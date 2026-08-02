import { CloudOff, CloudUpload, AlertTriangle, RefreshCw, X, Clock } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/shared/ui/drawer';
import { useEvidenceQueue } from '@/hooks/useEvidenceQueue';

const formatBytes = (n: number) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
};

const formatRelative = (ts: number) => {
  const diff = Math.max(0, Date.now() - ts);
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(ts).toLocaleString();
};

const EvidenceQueueIndicator = () => {
  const { items, online, pendingCount, failedCount, retry, discard, flushNow } =
    useEvidenceQueue();

  // Hide entirely when nothing to show.
  if (items.length === 0 && online) return null;

  const Icon = !online ? CloudOff : failedCount > 0 ? AlertTriangle : CloudUpload;
  const label = !online
    ? 'Offline'
    : failedCount > 0
      ? `${failedCount} failed`
      : `${pendingCount} pending`;
  const tone = !online
    ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
    : failedCount > 0
      ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
      : 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200';

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${tone}`}
          aria-label="Open evidence upload queue"
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
        </button>
      </DrawerTrigger>

      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DrawerTitle className="flex items-center gap-2">
                  Evidence upload queue
                  {!online && (
                    <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-900">
                      <CloudOff className="mr-1 h-3 w-3" /> Offline
                    </Badge>
                  )}
                </DrawerTitle>
                <DrawerDescription>
                  {online
                    ? 'Recordings are uploaded automatically. Items below are still on this device.'
                    : 'You are offline. Recordings are safe on this device and will upload when you reconnect.'}
                </DrawerDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => flushNow()}
                disabled={!online || items.length === 0}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Retry all
              </Button>
            </div>

            <div className="mt-3 flex gap-2">
              <Badge variant="outline">{pendingCount} pending</Badge>
              {failedCount > 0 && (
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  {failedCount} failed
                </Badge>
              )}
            </div>
          </DrawerHeader>

          <div className="max-h-[55vh] overflow-y-auto px-4 pb-2">
            {items.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nothing in the queue.
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {item.file_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              item.status === 'failed'
                                ? 'border-destructive/40 text-destructive'
                                : item.status === 'uploading'
                                  ? 'border-blue-300 text-blue-700'
                                  : ''
                            }
                          >
                            {item.status}
                            {item.attempts > 0 ? ` · ${item.attempts}` : ''}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="capitalize">{item.file_type}</span>
                          <span>{formatBytes(item.blob.size)}</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelative(item.created_at)}
                          </span>
                          {item.next_attempt_at > Date.now() && item.status !== 'failed' && (
                            <span>
                              next try in{' '}
                              {Math.max(
                                1,
                                Math.round((item.next_attempt_at - Date.now()) / 1000)
                              )}
                              s
                            </span>
                          )}
                        </div>

                        {item.last_error && (
                          <p className="mt-2 break-words rounded bg-destructive/5 px-2 py-1 text-xs text-destructive">
                            {item.last_error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => retry(item.id)}
                        disabled={item.status === 'uploading'}
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => discard(item.id)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" />
                        Discard
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EvidenceQueueIndicator;
