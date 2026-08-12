import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';

/// Ported from ActivityMonitoring.tsx: admin-wide view of the activity log
/// with type filters. Same underlying ActivityLogService the user-facing
/// Activity History screen reads — an admin backend would scope this
/// across all users; here it's the current session's log.
class ActivityMonitoringScreen extends StatefulWidget {
  const ActivityMonitoringScreen({super.key});

  @override
  State<ActivityMonitoringScreen> createState() => _ActivityMonitoringScreenState();
}

class _ActivityMonitoringScreenState extends State<ActivityMonitoringScreen> {
  ActivityType? _filter;

  IconData _iconFor(ActivityType t) => switch (t) {
        ActivityType.sos => Icons.emergency_rounded,
        ActivityType.locationShare => Icons.location_on_rounded,
        ActivityType.zoneAlert => Icons.warning_rounded,
        ActivityType.incidentReport => Icons.report_rounded,
        ActivityType.contactChange => Icons.contacts_rounded,
        ActivityType.other => Icons.circle_outlined,
      };

  String _labelFor(ActivityType t) => switch (t) {
        ActivityType.sos => 'SOS',
        ActivityType.locationShare => 'Location',
        ActivityType.zoneAlert => 'Zone Alert',
        ActivityType.incidentReport => 'Report',
        ActivityType.contactChange => 'Contacts',
        ActivityType.other => 'Other',
      };

  @override
  Widget build(BuildContext context) {
    final entries = ActivityLogService.instance.entries.where((e) => _filter == null || e.type == _filter).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Activity Monitoring', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Platform-wide activity feed.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: [
              ChoiceChip(label: const Text('All'), selected: _filter == null, onSelected: (_) => setState(() => _filter = null)),
              const SizedBox(width: 6),
              for (final t in ActivityType.values) ...[
                ChoiceChip(label: Text(_labelFor(t)), selected: _filter == t, onSelected: (_) => setState(() => _filter = t)),
                const SizedBox(width: 6),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),
        if (entries.isEmpty)
          const Padding(padding: EdgeInsets.symmetric(vertical: 32), child: Text('No matching activity.', style: TextStyle(color: AppColors.mutedForeground)))
        else
          for (final e in entries)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(_iconFor(e.type), color: e.type == ActivityType.sos ? AppColors.emergency600 : AppColors.mutedForeground),
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
