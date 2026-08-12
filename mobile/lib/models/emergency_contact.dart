/// Mirrors src/features/emergency-contacts/domain/types.ts exactly, so the
/// eventual Supabase wiring is a drop-in (same field names/shape).
enum ContactRelationship {
  family('Family'),
  friend('Friend'),
  colleague('Colleague'),
  neighbor('Neighbor'),
  emergencyService('Emergency Service'),
  other('Other');

  final String label;
  const ContactRelationship(this.label);
}

class EmergencyContact {
  final String id;
  String name;
  String phone;
  String? email;
  ContactRelationship? relationship;
  int priority; // 1 (highest) – 5 (lowest), matches ContactPriority 1|2|3|4|5
  final DateTime createdAt;

  EmergencyContact({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.relationship,
    this.priority = 1,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}
