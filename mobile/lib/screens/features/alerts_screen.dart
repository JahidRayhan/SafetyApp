import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final alerts = ActivityLogService.instance.entries
        .where((e) => e.type == ActivityType.sos || e.type == ActivityType.zoneAlert)
        .toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Alerts', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('SOS activations and zone-entry alerts.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (alerts.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                Icon(Icons.notifications_off_outlined, size: 48, color: AppColors.mutedForeground.withValues(alpha: 0.6)),
                const SizedBox(height: 12),
                const Text('No alerts yet', style: TextStyle(color: AppColors.mutedForeground)),
              ],
            ),
          )
        else
          for (final a in alerts) _AlertTile(entry: a),
      ],
    );
  }
}

class _AlertTile extends StatelessWidget {
  final ActivityEntry entry;
  const _AlertTile({required this.entry});

  @override
  Widget build(BuildContext context) {
    final isSos = entry.type == ActivityType.sos;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(isSos ? Icons.emergency_rounded : Icons.warning_rounded,
            color: isSos ? AppColors.emergency600 : AppColors.warning600),
        title: Text(entry.title),
        subtitle: entry.detail != null ? Text(entry.detail!) : null,
        trailing: Text(
          '${entry.timestamp.hour.toString().padLeft(2, '0')}:${entry.timestamp.minute.toString().padLeft(2, '0')}',
          style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground),
        ),
      ),
    );
  }
}
