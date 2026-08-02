/**
 * Tiny generic queue interface used by sync primitives. The concrete
 * implementations (IndexedDB for evidence, localStorage for lighter
 * payloads) plug into this surface. Kept intentionally minimal — no
 * scheduler, no event bus.
 */
export interface QueueItem<T> {
  id: string;
  payload: T;
  attempts: number;
  nextAttemptAt: number;
  status: "pending" | "uploading" | "failed";
  lastError?: string;
  createdAt: number;
}

export interface SyncQueue<T> {
  list(): Promise<QueueItem<T>[]>;
  enqueue(payload: T): Promise<QueueItem<T>>;
  update(item: QueueItem<T>): Promise<void>;
  remove(id: string): Promise<void>;
  subscribe(fn: (items: QueueItem<T>[]) => void): () => void;
}
