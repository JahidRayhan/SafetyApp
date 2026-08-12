import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/community_story.dart';
import '../../services/community_service.dart';

/// Ported from CommunityManagement.tsx — general moderation list for all
/// community posts (remove any post). StoriesModeration.tsx (a narrower
/// "flagged content only" queue) is covered by AdminApprovalsScreen's
/// content-flag entries, so it isn't duplicated as a separate screen here.
class CommunityManagementScreen extends StatefulWidget {
  const CommunityManagementScreen({super.key});

  @override
  State<CommunityManagementScreen> createState() => _CommunityManagementScreenState();
}

class _CommunityManagementScreenState extends State<CommunityManagementScreen> {
  List<CommunityStory> _stories = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final list = await CommunityService.instance.list();
    if (!mounted) return;
    setState(() {
      _stories = list;
      _loading = false;
    });
  }

  Future<void> _remove(CommunityStory s) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Remove this post?'),
        content: Text('"${s.title}" will be removed from the community feed.'),
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
    CommunityService.instance.remove(s.id);
    _fetch();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Community Management', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Moderate community posts.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (_loading)
          const Center(child: CircularProgressIndicator())
        else if (_stories.isEmpty)
          const Padding(padding: EdgeInsets.symmetric(vertical: 32), child: Text('No posts.', style: TextStyle(color: AppColors.mutedForeground)))
        else
          for (final s in _stories)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(s.title, style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(s.body, maxLines: 2, overflow: TextOverflow.ellipsis),
                trailing: IconButton(
                  icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
                  onPressed: () => _remove(s),
                ),
              ),
            ),
      ],
    );
  }
}
