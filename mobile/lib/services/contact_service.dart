import '../core/supabase_client.dart';
import '../models/activity_entry.dart';
import '../models/emergency_contact.dart';
import 'activity_log_service.dart';

/// Wired to the real `emergency_contacts` table (RLS-scoped to the signed-in
/// user via `user_id`). Same shape as the original's
/// ContactDirectoryEntry/ContactDirectoryDraft types.
class ContactService {
  ContactService._();
  static final ContactService instance = ContactService._();

  ContactRelationship? _relationshipFromLabel(String? label) {
    if (label == null) return null;
    for (final r in ContactRelationship.values) {
      if (r.label == label) return r;
    }
    return null;
  }

  EmergencyContact _fromRow(Map<String, dynamic> row) {
    return EmergencyContact(
      id: row['id'] as String,
      name: row['name'] as String,
      phone: row['phone'] as String,
      email: row['email'] as String?,
      relationship: _relationshipFromLabel(row['relationship'] as String?),
      priority: (row['priority'] as int?) ?? 1,
      createdAt: DateTime.parse(row['created_at'] as String),
    );
  }

  Future<List<EmergencyContact>> list() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return [];
    final rows = await supabase
        .from('emergency_contacts')
        .select()
        .eq('user_id', userId)
        .order('priority', ascending: true);
    return (rows as List).map((r) => _fromRow(r as Map<String, dynamic>)).toList();
  }

  Future<EmergencyContact> create({
    required String name,
    required String phone,
    String? email,
    ContactRelationship? relationship,
    int priority = 1,
  }) async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) throw Exception('You must be signed in to add a contact.');
    if (name.trim().isEmpty || phone.trim().isEmpty) {
      throw Exception('Please fill in at least the name and phone number.');
    }
    final row = await supabase
        .from('emergency_contacts')
        .insert({
          'user_id': userId,
          'name': name.trim(),
          'phone': phone.trim(),
          'email': (email?.trim().isEmpty ?? true) ? null : email!.trim(),
          'relationship': relationship?.label,
          'priority': priority,
        })
        .select()
        .single();
    final contact = _fromRow(row);
    ActivityLogService.instance.log(ActivityType.contactChange, 'Added contact: ${contact.name}');
    return contact;
  }

  Future<void> update(EmergencyContact updated) async {
    await supabase.from('emergency_contacts').update({
      'name': updated.name,
      'phone': updated.phone,
      'email': updated.email,
      'relationship': updated.relationship?.label,
      'priority': updated.priority,
    }).eq('id', updated.id);
  }

  Future<void> remove(String id) async {
    await supabase.from('emergency_contacts').delete().eq('id', id);
  }
}
