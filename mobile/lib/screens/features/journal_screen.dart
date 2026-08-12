import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/journal_entry.dart';
import '../../services/journal_service.dart';

class JournalScreen extends StatefulWidget {
  const JournalScreen({super.key});

  @override
  State<JournalScreen> createState() => _JournalScreenState();
}

class _JournalScreenState extends State<JournalScreen> {
  Future<void> _openForm() async {
    final added = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _JournalFormSheet(),
    );
    if (added == true) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final entries = JournalService.instance.list();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openForm,
        icon: const Icon(Icons.add),
        label: const Text('New Entry'),
        backgroundColor: AppColors.emergency600,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          const Text('Anonymous Journal', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          const Text('A private space to note how you\'re feeling. Stays on this device only.',
              style: TextStyle(color: AppColors.mutedForeground)),
          const SizedBox(height: 16),
          if (entries.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Column(
                children: [
                  Icon(Icons.book_outlined, size: 48, color: AppColors.mutedForeground.withValues(alpha: 0.6)),
                  const SizedBox(height: 12),
                  const Text('No entries yet', style: TextStyle(color: AppColors.mutedForeground)),
                ],
              ),
            )
          else
            for (final e in entries)
              Card(
                margin: const EdgeInsets.only(bottom: 10),
                child: ListTile(
                  leading: Text(e.mood.emoji, style: const TextStyle(fontSize: 22)),
                  title: Text(e.text, maxLines: 3, overflow: TextOverflow.ellipsis),
                  subtitle: Text('${e.mood.label} · ${e.createdAt.month}/${e.createdAt.day}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
                    onPressed: () {
                      JournalService.instance.remove(e.id);
                      setState(() {});
                    },
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class _JournalFormSheet extends StatefulWidget {
  const _JournalFormSheet();

  @override
  State<_JournalFormSheet> createState() => _JournalFormSheetState();
}

class _JournalFormSheetState extends State<_JournalFormSheet> {
  final _textController = TextEditingController();
  JournalMood _mood = JournalMood.okay;

  void _save() {
    if (_textController.text.trim().isEmpty) return;
    JournalService.instance.add(text: _textController.text.trim(), mood: _mood);
    Navigator.pop(context, true);
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
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('How are you feeling?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: JournalMood.values
                  .map((m) => ChoiceChip(
                        label: Text('${m.emoji} ${m.label}'),
                        selected: _mood == m,
                        onSelected: (_) => setState(() => _mood = m),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _textController,
              maxLines: 5,
              decoration: const InputDecoration(hintText: 'Write freely — this stays private.'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _save, child: const Text('Save Entry')),
          ],
        ),
      ),
    );
  }
}
