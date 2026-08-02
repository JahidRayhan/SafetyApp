import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Loader2, Mail, MapPin, RefreshCcw, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { sosAlertService } from '@/features/admin/services/sosAlertService';
import type { SosAlertDelivery, SosDeliveryStatus, SosIncidentSummary } from '@/features/admin/domain/types';

const STATUS_STYLES: Record<SosDeliveryStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  sent: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
};

const SOSAlertsPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SosDeliveryStatus>('all');
  const [incidents, setIncidents] = useState<SosIncidentSummary[]>([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);

    try {
      const summaries = await sosAlertService.listIncidentSummaries(150);
      setIncidents(summaries);
    } catch (error: any) {
      console.error('Failed to fetch SOS alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SOS alerts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesStatus =
        statusFilter === 'all' || incident.deliveries.some((delivery) => delivery.deliveryStatus === statusFilter);

      const haystack = [
        incident.userName,
        incident.status,
        ...incident.deliveries.flatMap((delivery) => [delivery.recipientEmail || '', delivery.recipientPhone || '', delivery.errorMessage || '']),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [incidents, searchTerm, statusFilter]);

  const handleResend = async (delivery: SosAlertDelivery) => {
    if (!user) return;

    setResendingId(delivery.id);

    try {
      const response = await sosAlertService.resend(delivery);

      toast({
        title: 'Alert resent',
        description: response?.message || 'The failed SOS alert was resent.',
      });

      await fetchAlerts();
    } catch (error: any) {
      console.error('Failed to resend SOS alert:', error);
      toast({
        title: 'Resend failed',
        description: error.message || 'Could not resend this alert.',
        variant: 'destructive',
      });
    } finally {
      setResendingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-24 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="w-6 h-6 text-emergency-600" />
              <h2 className="text-xl font-bold text-gray-900">SOS Alerts</h2>
            </div>
            <p className="text-gray-600">Recent SOS alerts, delivery results, and retry controls for failed notifications.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user, recipient, or error"
              className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | SosDeliveryStatus)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="all">All statuses</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Recent incidents</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{filteredIncidents.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Failed deliveries</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {filteredIncidents.reduce((sum, incident) => sum + incident.failedCount, 0)}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Successful deliveries</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {filteredIncidents.reduce((sum, incident) => sum + incident.sentCount, 0)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredIncidents.map((incident) => (
            <div key={incident.incidentId} className="border border-gray-200 rounded-xl p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-emergency-600" />
                    <h3 className="font-semibold text-gray-900">{incident.userName}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Triggered {new Date(incident.triggeredAt).toLocaleString()}</p>
                  {incident.locationLat && incident.locationLng && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {Number(incident.locationLat).toFixed(4)}, {Number(incident.locationLng).toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={fetchAlerts}
                  className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-200">
                      <th className="pb-3 font-medium">Recipient</th>
                      <th className="pb-3 font-medium">Channel</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Attempt</th>
                      <th className="pb-3 font-medium">Last tried</th>
                      <th className="pb-3 font-medium">Error</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incident.deliveries.map((delivery) => (
                      <tr key={delivery.id} className="border-b border-gray-100 last:border-b-0">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{delivery.recipientEmail || delivery.recipientPhone || 'Unavailable'}</div>
                          {delivery.recipientEmail && delivery.recipientPhone && (
                            <div className="text-xs text-gray-500">{delivery.recipientPhone}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4 capitalize">{delivery.channel}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[delivery.deliveryStatus]}`}>
                            {delivery.deliveryStatus}
                          </span>
                        </td>
                        <td className="py-3 pr-4">#{delivery.attemptNumber}</td>
                        <td className="py-3 pr-4">{new Date(delivery.attemptedAt).toLocaleString()}</td>
                        <td className="py-3 pr-4 text-gray-600 max-w-xs">
                          <span className="line-clamp-2">{delivery.errorMessage || '—'}</span>
                        </td>
                        <td className="py-3 text-right">
                          {delivery.deliveryStatus === 'failed' ? (
                            <button
                              onClick={() => handleResend(delivery)}
                              disabled={resendingId === delivery.id}
                              className="inline-flex items-center gap-2 rounded-lg bg-emergency-600 px-3 py-2 text-white hover:bg-emergency-700 disabled:opacity-60"
                            >
                              {resendingId === delivery.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                              Resend
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {filteredIncidents.length === 0 && (
            <div className="text-center py-12 border border-dashed border-gray-300 rounded-xl">
              <ShieldAlert className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No SOS alerts match the current filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSAlertsPanel;
