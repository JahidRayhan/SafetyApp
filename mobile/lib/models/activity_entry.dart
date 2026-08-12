enum ActivityType { sos, locationShare, zoneAlert, incidentReport, contactChange, other }

class ActivityEntry {
  final String id;
  final ActivityType type;
  final String title;
  final String? detail;
  final DateTime timestamp;

  ActivityEntry({
    required this.id,
    required this.type,
    required this.title,
    this.detail,
    DateTime? timestamp,
  }) : timestamp = timestamp ?? DateTime.now();
}
