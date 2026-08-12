enum IncidentCategory { harassment, theft, assault, suspiciousActivity, accident, other }

extension IncidentCategoryLabel on IncidentCategory {
  String get label => switch (this) {
        IncidentCategory.harassment => 'Harassment',
        IncidentCategory.theft => 'Theft',
        IncidentCategory.assault => 'Assault',
        IncidentCategory.suspiciousActivity => 'Suspicious Activity',
        IncidentCategory.accident => 'Accident',
        IncidentCategory.other => 'Other',
      };
}

enum IncidentStatus { submitted, underReview, resolved }

class IncidentReport {
  final String id;
  String title;
  String description;
  IncidentCategory category;
  double? lat;
  double? lng;
  IncidentStatus status;
  final DateTime createdAt;

  IncidentReport({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    this.lat,
    this.lng,
    this.status = IncidentStatus.submitted,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}
