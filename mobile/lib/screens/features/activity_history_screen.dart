import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';

class ActivityHistoryScreen extends StatelessWidget {
  const ActivityHistoryScreen({super.key});

  IconData _iconFor(ActivityType t) => switch (t) {
        ActivityType.sos => Icons.emergency_rounded,
        ActivityType.locationShare => Icons.location_on_rounded,
        ActivityType.zoneAlert => Icons.warning_rounded,
        ActivityType.incidentReport => Icons.report_rounded,
        ActivityType.contactChange => Icons.contacts_rounded,
        ActivityType.other => Icons.circle_outlined,
      };

  @override
  Widget build(BuildContext context) {
    final entries = ActivityLogService.instance.entries;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Activity History', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Everything logged during your use of the app.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (entries.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                Icon(Icons.history_rounded, size: 48, color: AppColors.mutedForeground.withValues(alpha: 0.6)),
                const SizedBox(height: 12),
                const Text('No activity yet — this fills up as you use SOS, location sharing, and reports.',
                    textAlign: TextAlign.center, style: TextStyle(color: AppColors.mutedForeground)),
              ],
            ),
          )
        else
          for (final e in entries)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(_iconFor(e.type), color: AppColors.mutedForeground),
                title: Text(e.title),
                subtitle: e.detail != null ? Text(e.detail!) : null,
                trailing: Text(
                  '${e.timestamp.month}/${e.timestamp.day} ${e.timestamp.hour.toString().padLeft(2, '0')}:${e.timestamp.minute.toString().padLeft(2, '0')}',
                  style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground),
                ),
              ),
            ),
      ],
    );
  }
}
