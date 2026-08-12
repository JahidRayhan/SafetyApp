import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/community_story.dart';
import '../../services/community_service.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
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

  Future<void> _openForm() async {
    final posted = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _StoryFormSheet(),
    );
    if (posted == true) _fetch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openForm,
        icon: const Icon(Icons.add),
        label: const Text('Share a story'),
        backgroundColor: AppColors.emergency600,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                children: [
                  const Text('Community', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  const Text('Stories and support from people using SafeGuard.',
                      style: TextStyle(color: AppColors.mutedForeground)),
                  const SizedBox(height: 16),
                  for (final s in _stories)
                    _StoryCard(
                      story: s,
                      onSupport: () {
                        CommunityService.instance.support(s.id);
                        setState(() {});
                      },
                    ),
                ],
              ),
            ),
    );
  }
}

class _StoryCard extends StatelessWidget {
  final CommunityStory story;
  final VoidCallback onSupport;
  const _StoryCard({required this.story, required this.onSupport});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(story.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
            const SizedBox(height: 6),
            Text(story.body, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
            const SizedBox(height: 10),
            Row(
              children: [
                Text('— ${story.authorName}', style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                const Spacer(),
                TextButton.icon(
                  onPressed: onSupport,
                  icon: const Icon(Icons.favorite_border_rounded, size: 16),
                  label: Text('${story.supportCount}'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StoryFormSheet extends StatefulWidget {
  const _StoryFormSheet();

  @override
  State<_StoryFormSheet> createState() => _StoryFormSheetState();
}

class _StoryFormSheetState extends State<_StoryFormSheet> {
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();
  bool _saving = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await CommunityService.instance.submit(title: _titleController.text, body: _bodyController.text);
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
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
              const Text('Share Your Story', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Title')),
              const SizedBox(height: 12),
              TextField(
                controller: _bodyController,
                maxLines: 5,
                decoration: const InputDecoration(labelText: 'Your story'),
              ),
              if (_error != null) ...[
                const SizedBox(height: 8),
                Text(_error!, style: const TextStyle(color: AppColors.destructive, fontSize: 13)),
              ],
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Post (Anonymous)'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
