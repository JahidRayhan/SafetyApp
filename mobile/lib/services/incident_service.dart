import '../core/supabase_client.dart';
import '../models/activity_entry.dart';
import '../models/incident_report.dart';
import 'activity_log_service.dart';

const _categoryToDb = {
  IncidentCategory.harassment: 'harassment',
  IncidentCategory.theft: 'theft',
  IncidentCategory.assault: 'assault',
  IncidentCategory.suspiciousActivity: 'suspicious_activity',
  IncidentCategory.accident: 'accident',
  IncidentCategory.other: 'other',
};
final _dbToCategory = {for (final e in _categoryToDb.entries) e.value: e.key};

IncidentStatus _statusFromDb(String? s) => switch (s) {
      'under_review' => IncidentStatus.underReview,
      'resolved' => IncidentStatus.resolved,
      _ => IncidentStatus.submitted,
    };

/// Wired to the real `incident_reports` table.
class IncidentService {
  IncidentService._();
  static final IncidentService instance = IncidentService._();

  IncidentReport _fromRow(Map<String, dynamic> row) {
    return IncidentReport(
      id: row['id'] as String,
      title: row['title'] as String,
      description: (row['description'] as String?) ?? '',
      category: _dbToCategory[row['incident_type']] ?? IncidentCategory.other,
      lat: (row['location_lat'] as num?)?.toDouble(),
      lng: (row['location_lng'] as num?)?.toDouble(),
      status: _statusFromDb(row['status'] as String?),
      createdAt: DateTime.parse((row['reported_at'] ?? row['updated_at']) as String),
    );
  }

  Future<List<IncidentReport>> list() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return [];
    final rows = await supabase
        .from('incident_reports')
        .select()
        .eq('user_id', userId)
        .order('reported_at', ascending: false);
    return (rows as List).map((r) => _fromRow(r as Map<String, dynamic>)).toList();
  }

  Future<IncidentReport> create({
    required String title,
    required String description,
    required IncidentCategory category,
    double? lat,
    double? lng,
  }) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('You must be signed in to file a report.');
    if (title.trim().isEmpty || description.trim().isEmpty) {
      throw Exception('Please add a title and description.');
    }
    final row = await supabase
        .from('incident_reports')
        .insert({
          'user_id': userId,
          'title': title.trim(),
          'description': description.trim(),
          'incident_type': _categoryToDb[category],
          'location_lat': lat,
          'location_lng': lng,
          'status': 'submitted',
        })
        .select()
        .single();
    final report = _fromRow(row);
    ActivityLogService.instance.log(ActivityType.incidentReport, 'Incident reported: ${report.title}');
    return report;
  }
}
