import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../models/emergency_contact.dart';
import '../../services/contact_service.dart';

/// Ported from src/components/EmergencyContacts.tsx: list of contacts
/// sorted by priority, add/edit form, call action, delete with confirm.
/// Backed by ContactService (in-memory today, Supabase-shaped for later).
class EmergencyContactsScreen extends StatefulWidget {
  const EmergencyContactsScreen({super.key});

  @override
  State<EmergencyContactsScreen> createState() => _EmergencyContactsScreenState();
}

class _EmergencyContactsScreenState extends State<EmergencyContactsScreen> {
  List<EmergencyContact> _contacts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final list = await ContactService.instance.list();
    if (!mounted) return;
    setState(() {
      _contacts = list;
      _loading = false;
    });
  }

  void _showSnack(String message, {bool error = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: error ? AppColors.destructive : AppColors.safe600,
      ),
    );
  }

  Future<void> _callContact(EmergencyContact c) async {
    final uri = Uri(scheme: 'tel', path: c.phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      _showSnack('Could not start a call on this device', error: true);
    }
  }

  Future<void> _deleteContact(EmergencyContact c) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove contact?'),
        content: Text('${c.name} will no longer be notified during an SOS alert.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Remove', style: TextStyle(color: AppColors.destructive)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await ContactService.instance.remove(c.id);
    _showSnack('${c.name} has been removed from your emergency contacts.');
    _fetch();
  }

  Future<void> _openContactForm({EmergencyContact? existing}) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ContactFormSheet(existing: existing),
    );
    if (result == true) _fetch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _openContactForm(),
        icon: const Icon(Icons.add),
        label: const Text('Add Contact'),
        backgroundColor: AppColors.emergency600,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: _contacts.isEmpty
                  ? _EmptyState(onAdd: () => _openContactForm())
                  : ListView(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: Text(
                            'Emergency Contacts',
                            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const Padding(
                          padding: EdgeInsets.only(bottom: 16),
                          child: Text(
                            'These people are notified — with your location — when you trigger an SOS alert.',
                            style: TextStyle(color: AppColors.mutedForeground),
                          ),
                        ),
                        for (final c in _contacts)
                          _ContactCard(
                            contact: c,
                            onCall: () => _callContact(c),
                            onEdit: () => _openContactForm(existing: c),
                            onDelete: () => _deleteContact(c),
                          ),
                      ],
                    ),
            ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final VoidCallback onAdd;
  const _EmptyState({required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) => SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: ConstrainedBox(
          constraints: BoxConstraints(minHeight: constraints.maxHeight),
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.contacts_rounded, size: 56, color: AppColors.mutedForeground),
                  const SizedBox(height: 16),
                  const Text('No emergency contacts yet',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  const Text(
                    'Add at least one contact so someone is notified if you ever trigger an SOS alert.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.mutedForeground),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: onAdd,
                    icon: const Icon(Icons.add),
                    label: const Text('Add your first contact'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  final EmergencyContact contact;
  final VoidCallback onCall;
  final VoidCallback onEdit;
  final VoidCallback onDelete;

  const _ContactCard({
    required this.contact,
    required this.onCall,
    required this.onEdit,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppColors.emergency100,
              child: Text(
                contact.name.isNotEmpty ? contact.name[0].toUpperCase() : '?',
                style: const TextStyle(color: AppColors.emergency700, fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Text(contact.name,
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            overflow: TextOverflow.ellipsis),
                      ),
                      if (contact.priority == 1) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.emergency100,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          child: const Text('Primary',
                              style: TextStyle(fontSize: 10, color: AppColors.emergency700, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(contact.phone, style: const TextStyle(color: AppColors.mutedForeground)),
                  if (contact.relationship != null)
                    Text(contact.relationship!.label,
                        style: const TextStyle(color: AppColors.mutedForeground, fontSize: 12)),
                ],
              ),
            ),
            IconButton(
              icon: const Icon(Icons.phone_rounded, color: AppColors.safe600),
              onPressed: onCall,
              tooltip: 'Call',
            ),
            IconButton(
              icon: const Icon(Icons.edit_rounded, color: AppColors.mutedForeground),
              onPressed: onEdit,
              tooltip: 'Edit',
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
              onPressed: onDelete,
              tooltip: 'Remove',
            ),
          ],
        ),
      ),
    );
  }
}

class _ContactFormSheet extends StatefulWidget {
  final EmergencyContact? existing;
  const _ContactFormSheet({this.existing});

  @override
  State<_ContactFormSheet> createState() => _ContactFormSheetState();
}

class _ContactFormSheetState extends State<_ContactFormSheet> {
  late final _nameController = TextEditingController(text: widget.existing?.name ?? '');
  late final _phoneController = TextEditingController(text: widget.existing?.phone ?? '');
  late final _emailController = TextEditingController(text: widget.existing?.email ?? '');
  ContactRelationship? _relationship;
  late int _priority;
  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _relationship = widget.existing?.relationship;
    _priority = widget.existing?.priority ?? 1;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      if (widget.existing == null) {
        await ContactService.instance.create(
          name: _nameController.text,
          phone: _phoneController.text,
          email: _emailController.text,
          relationship: _relationship,
          priority: _priority,
        );
      } else {
        await ContactService.instance.update(
          EmergencyContact(
            id: widget.existing!.id,
            name: _nameController.text.trim(),
            phone: _phoneController.text.trim(),
            email: _emailController.text.trim().isEmpty ? null : _emailController.text.trim(),
            relationship: _relationship,
            priority: _priority,
            createdAt: widget.existing!.createdAt,
          ),
        );
      }
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.existing != null;
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.panel)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(isEdit ? 'Edit Contact' : 'Add Emergency Contact',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(
                controller: _nameController,
                decoration: const InputDecoration(labelText: 'Name *'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                decoration: const InputDecoration(labelText: 'Phone *'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email (optional)'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<ContactRelationship?>(
                initialValue: _relationship,
                decoration: const InputDecoration(labelText: 'Relationship'),
                items: [
                  const DropdownMenuItem(value: null, child: Text('Not specified')),
                  ...ContactRelationship.values
                      .map((r) => DropdownMenuItem(value: r, child: Text(r.label))),
                ],
                onChanged: (v) => setState(() => _relationship = v),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                initialValue: _priority,
                decoration: const InputDecoration(labelText: 'Priority (1 = notified first)'),
                items: List.generate(
                  5,
                  (i) => DropdownMenuItem(value: i + 1, child: Text('${i + 1}')),
                ),
                onChanged: (v) => setState(() => _priority = v ?? 1),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: AppColors.destructive, fontSize: 13)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _saving ? null : _save,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : Text(isEdit ? 'Save Changes' : 'Add Contact'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
