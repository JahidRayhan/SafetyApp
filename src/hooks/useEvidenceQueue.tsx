import { useEffect, useState } from 'react';
import {
  QueuedEvidence,
  subscribeQueue,
  retryItem,
  discardItem,
  processQueue,
} from '@/core/sync/evidenceQueue';

export const useEvidenceQueue = () => {
  const [items, setItems] = useState<QueuedEvidence[]>([]);
  const [online, setOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const unsubscribe = subscribeQueue(setItems);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      unsubscribe();
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return {
    items,
    online,
    pendingCount: items.filter((i) => i.status !== 'failed').length,
    failedCount: items.filter((i) => i.status === 'failed').length,
    retry: retryItem,
    discard: discardItem,
    flushNow: processQueue,
  };
};
