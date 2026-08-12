import '../models/activity_entry.dart';

/// Central in-memory activity log other services can push into (SOS
/// trigger/resolve, zone-entry alerts, incident reports, contact edits),
/// and the Activity History screen reads from. Mirrors what
/// src/features/activity's service + ActivityHistory.tsx do, minus the
/// Supabase persistence.
class ActivityLogService {
  ActivityLogService._();
  static final ActivityLogService instance = ActivityLogService._();

  final List<ActivityEntry> _entries = [];
  int _nextId = 1;

  List<ActivityEntry> get entries => [..._entries]..sort((a, b) => b.timestamp.compareTo(a.timestamp));

  void log(ActivityType type, String title, {String? detail}) {
    _entries.add(ActivityEntry(id: (_nextId++).toString(), type: type, title: title, detail: detail));
  }
}
