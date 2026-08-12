import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/contact_service.dart';
import '../../services/evidence_queue_service.dart';

enum _UserInfoTab { media, contacts }

/// Ported from UserInfo.tsx (+ UserRecordingsView.tsx, UserContactsView.tsx):
/// consolidated view of user data for moderation/support. Pulls from the
/// same EvidenceQueueService/ContactService singletons the user-facing
/// screens use — in a real multi-user backend this would be scoped by a
/// selected user id; here it's illustrative against the current session's
/// data.
class UserInfoScreen extends StatefulWidget {
  const UserInfoScreen({super.key});

  @override
  State<UserInfoScreen> createState() => _UserInfoScreenState();
}

class _UserInfoScreenState extends State<UserInfoScreen> {
  _UserInfoTab _tab = _UserInfoTab.media;
  final _searchController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Row(
          children: [
            Icon(Icons.search_rounded, color: Colors.blue, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('User Information', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                  Text('Consolidated view for moderation and support', style: TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _searchController,
          decoration: const InputDecoration(hintText: 'Search by user email or name…', prefixIcon: Icon(Icons.search_rounded)),
          onChanged: (_) => setState(() {}),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: const Text('User Media'),
                selected: _tab == _UserInfoTab.media,
                onSelected: (_) => setState(() => _tab = _UserInfoTab.media),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                label: const Text('Emergency Contacts'),
                selected: _tab == _UserInfoTab.contacts,
                onSelected: (_) => setState(() => _tab = _UserInfoTab.contacts),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_tab == _UserInfoTab.media) ..._buildMedia() else ..._buildContacts(),
      ],
    );
  }

  List<Widget> _buildMedia() {
    final items = EvidenceQueueService.instance.items;
    if (items.isEmpty) {
      return [const Padding(padding: EdgeInsets.symmetric(vertical: 24), child: Text('No recordings on file.', style: TextStyle(color: AppColors.mutedForeground)))];
    }
    return items
        .map((e) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(e.kind.name == 'audio' ? Icons.mic_rounded : Icons.videocam_rounded, color: AppColors.emergency600),
                title: Text('${e.kind.name} evidence'),
                subtitle: Text('${e.recordedAt} · ${e.durationSeconds ?? 0}s · ${e.uploaded ? 'Uploaded' : 'Pending'}'),
              ),
            ))
        .toList();
  }

  List<Widget> _buildContacts() {
    return [
      FutureBuilder(
        future: ContactService.instance.list(),
        builder: (context, snapshot) {
          final contacts = snapshot.data ?? [];
          if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
          if (contacts.isEmpty) {
            return const Padding(padding: EdgeInsets.symmetric(vertical: 24), child: Text('No contacts on file.', style: TextStyle(color: AppColors.mutedForeground)));
          }
          return Column(
            children: contacts
                .map((c) => Card(
                      margin: const EdgeInsets.only(bottom: 8),
                      child: ListTile(
                        leading: const Icon(Icons.contacts_rounded, color: Colors.blue),
                        title: Text(c.name),
                        subtitle: Text('${c.phone}${c.relationship != null ? ' · ${c.relationship!.label}' : ''}'),
                      ),
                    ))
                .toList(),
          );
        },
      ),
    ];
  }
}
