import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';

/// Ported from admin/SOSAlertsPanel.tsx: live feed of SOS activations an
/// admin needs to respond to. "Acknowledge" here just marks it handled in
/// local UI state (a Set of ids) — no backend status field wired yet.
class SosAlertsPanelScreen extends StatefulWidget {
  const SosAlertsPanelScreen({super.key});

  @override
  State<SosAlertsPanelScreen> createState() => _SosAlertsPanelScreenState();
}

class _SosAlertsPanelScreenState extends State<SosAlertsPanelScreen> {
  final Set<String> _acknowledged = {};

  @override
  Widget build(BuildContext context) {
    final alerts = ActivityLogService.instance.entries.where((e) => e.type == ActivityType.sos).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Row(
          children: [
            Icon(Icons.emergency_rounded, color: AppColors.emergency600, size: 28),
            SizedBox(width: 10),
            Text('SOS Alerts', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ],
        ),
        const SizedBox(height: 4),
        const Text('Live incoming emergency alerts from users.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (alerts.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                Icon(Icons.shield_rounded, size: 48, color: AppColors.safe600.withValues(alpha: 0.6)),
                const SizedBox(height: 12),
                const Text('No active SOS alerts.', style: TextStyle(color: AppColors.mutedForeground)),
              ],
            ),
          )
        else
          for (final a in alerts)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              color: _acknowledged.contains(a.id) ? null : AppColors.emergency50,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Row(
                  children: [
                    Icon(Icons.emergency_rounded,
                        color: _acknowledged.contains(a.id) ? AppColors.mutedForeground : AppColors.emergency600),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(a.title, style: const TextStyle(fontWeight: FontWeight.bold)),
                          if (a.detail != null) Text(a.detail!, style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                          Text(
                            '${a.timestamp.hour.toString().padLeft(2, '0')}:${a.timestamp.minute.toString().padLeft(2, '0')}',
                            style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground),
                          ),
                        ],
                      ),
                    ),
                    if (!_acknowledged.contains(a.id))
                      ElevatedButton(
                        onPressed: () => setState(() => _acknowledged.add(a.id)),
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.emergency600),
                        child: const Text('Acknowledge'),
                      )
                    else
                      const Icon(Icons.check_circle_rounded, color: AppColors.safe600),
                  ],
                ),
              ),
            ),
      ],
    );
  }
}
