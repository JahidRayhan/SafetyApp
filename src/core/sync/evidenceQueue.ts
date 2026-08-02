/**
 * Offline-first evidence queue for emergency recordings.
 *
 * Recordings are persisted to IndexedDB before any network attempt. A background
 * processor uploads them to Supabase Storage and inserts the matching row in
 * `recordings`. Failed items stay in the queue with an exponential backoff and
 * an attempt counter, so they survive page reloads, network drops, and app
 * restarts. This implements the offline fallback + automatic retry described in
 * the evidence-storage rules.
 */

import { supabase } from '@/core/database/client';

const DB_NAME = 'safeguard-evidence';
const DB_VERSION = 1;
const STORE = 'pending_uploads';

export type EvidenceFileType = 'audio' | 'video' | 'image';

export interface QueuedEvidence {
  id: string;
  incident_id: string;
  user_id: string;
  file_path: string;          // <user_id>/<filename>
  file_name: string;
  file_type: EvidenceFileType;
  mime_type: string;
  blob: Blob;
  duration_seconds: number;
  created_at: number;
  attempts: number;
  next_attempt_at: number;
  last_error?: string;
  status: 'pending' | 'uploading' | 'failed';
}

type Listener = (items: QueuedEvidence[]) => void;

const listeners = new Set<Listener>();
let processing = false;
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    Promise.resolve(run(store)).then(
      (result) => {
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      },
      (err) => {
        try { transaction.abort(); } catch { /* noop */ }
        reject(err);
      }
    );
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function listQueue(): Promise<QueuedEvidence[]> {
  try {
    const items = await tx('readonly', (store) => reqToPromise(store.getAll()));
    return (items as QueuedEvidence[]).sort((a, b) => a.created_at - b.created_at);
  } catch (err) {
    console.error('listQueue failed:', err);
    return [];
  }
}

async function notify() {
  const items = await listQueue();
  listeners.forEach((fn) => {
    try { fn(items); } catch (e) { console.error(e); }
  });
}

export function subscribeQueue(fn: Listener): () => void {
  listeners.add(fn);
  // Immediately push current state.
  listQueue().then(fn).catch(() => fn([]));
  return () => listeners.delete(fn);
}

export interface EnqueueInput {
  incident_id: string;
  user_id: string;
  blob: Blob;
  file_type: EvidenceFileType;
  mime_type?: string;
  extension?: string;
  duration_seconds?: number;
}

export async function enqueueEvidence(input: EnqueueInput): Promise<QueuedEvidence> {
  const id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const ext = input.extension ?? guessExtension(input.mime_type ?? input.blob.type, input.file_type);
  const file_name = `evidence_${Date.now()}_${input.incident_id}.${ext}`;
  const item: QueuedEvidence = {
    id,
    incident_id: input.incident_id,
    user_id: input.user_id,
    file_path: `${input.user_id}/${file_name}`,
    file_name,
    file_type: input.file_type,
    mime_type: input.mime_type ?? input.blob.type ?? 'application/octet-stream',
    blob: input.blob,
    duration_seconds: input.duration_seconds ?? 0,
    created_at: Date.now(),
    attempts: 0,
    next_attempt_at: Date.now(),
    status: 'pending',
  };
  await tx('readwrite', (store) => reqToPromise(store.put(item)));
  await notify();
  // Try immediately in case we're already online.
  void processQueue();
  return item;
}

function guessExtension(mime: string, type: EvidenceFileType): string {
  if (mime.includes('webm')) return 'webm';
  if (mime.includes('mp4')) return 'mp4';
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mpeg')) return 'mp3';
  if (mime.includes('wav')) return 'wav';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('png')) return 'png';
  return type === 'audio' ? 'webm' : type === 'video' ? 'mp4' : 'bin';
}

async function update(item: QueuedEvidence) {
  await tx('readwrite', (store) => reqToPromise(store.put(item)));
}

async function remove(id: string) {
  await tx('readwrite', (store) => reqToPromise(store.delete(id)));
}

const MAX_ATTEMPTS = 8;

function backoffMs(attempts: number): number {
  // 5s, 10s, 20s, 40s, 1m20, 2m40, 5m20, 10m40 — capped at 15 min.
  const ms = 5000 * Math.pow(2, Math.max(0, attempts - 1));
  return Math.min(ms, 15 * 60 * 1000);
}

export async function processQueue(): Promise<void> {
  if (processing) return;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  // Need an authenticated session for the upload + insert RLS to pass.
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return;

  processing = true;
  try {
    const items = await listQueue();
    const now = Date.now();
    for (const item of items) {
      if (item.status === 'uploading') continue;
      if (item.next_attempt_at > now) continue;

      item.status = 'uploading';
      await update(item);
      await notify();

      try {
        const { error: uploadError } = await supabase.storage
          .from('emergency-recordings')
          .upload(item.file_path, item.blob, {
            contentType: item.mime_type,
            upsert: false,
          });

        // Treat "duplicate" as success — file already made it on a prior attempt.
        if (uploadError && !/exists|duplicate/i.test(uploadError.message)) {
          throw uploadError;
        }

        const { error: dbError } = await supabase.from('recordings').insert({
          incident_id: item.incident_id,
          user_id: item.user_id,
          file_path: item.file_path,
          file_type: item.file_type,
          file_size: item.blob.size,
          duration_seconds: item.duration_seconds,
        });
        if (dbError) throw dbError;

        await remove(item.id);
        await notify();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        const attempts = item.attempts + 1;
        const failed: QueuedEvidence = {
          ...item,
          attempts,
          status: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          last_error: message,
          next_attempt_at: Date.now() + backoffMs(attempts),
        };
        await update(failed);
        await notify();
        console.warn(`Evidence upload failed (attempt ${attempts}/${MAX_ATTEMPTS}):`, message);
      }
    }
  } finally {
    processing = false;
  }
}

export async function retryItem(id: string): Promise<void> {
  const items = await listQueue();
  const item = items.find((i) => i.id === id);
  if (!item) return;
  item.status = 'pending';
  item.next_attempt_at = Date.now();
  item.attempts = 0;
  item.last_error = undefined;
  await update(item);
  await notify();
  void processQueue();
}

export async function discardItem(id: string): Promise<void> {
  await remove(id);
  await notify();
}

let started = false;
let intervalId: number | undefined;

/**
 * Start the background processor. Idempotent — safe to call from any mount.
 * Triggers a flush on online events, auth changes, and every 30 seconds.
 */
export function startQueueProcessor(): void {
  if (started || typeof window === 'undefined') return;
  started = true;

  const trigger = () => { void processQueue(); };

  window.addEventListener('online', trigger);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') trigger();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) trigger();
  });

  intervalId = window.setInterval(trigger, 30_000);
  trigger();
}

export function stopQueueProcessor(): void {
  if (!started) return;
  started = false;
  if (intervalId !== undefined) {
    clearInterval(intervalId);
    intervalId = undefined;
  }
}

// Shared retry/queue contracts live alongside the driver so consumers can
// depend on a single `core/sync` entry point.
export { computeBackoff, MAX_DEFAULT_ATTEMPTS } from "./retry";
export type { SyncQueue, QueueItem } from "./queue";
