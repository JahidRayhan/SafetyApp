import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/wellness_content_service.dart';

class EmotionalSupportManagementScreen extends StatefulWidget {
  const EmotionalSupportManagementScreen({super.key});

  @override
  State<EmotionalSupportManagementScreen> createState() => _EmotionalSupportManagementScreenState();
}

class _EmotionalSupportManagementScreenState extends State<EmotionalSupportManagementScreen> {
  final _titleController = TextEditingController();
  final _bodyController = TextEditingController();

  void _add() {
    if (_titleController.text.trim().isEmpty || _bodyController.text.trim().isEmpty) return;
    WellnessContentService.instance.addTip(title: _titleController.text.trim(), body: _bodyController.text.trim());
    _titleController.clear();
    _bodyController.clear();
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final tips = WellnessContentService.instance.tips;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Emotional Support Management', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Add or remove coping tips shown to users.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Tip title')),
                const SizedBox(height: 10),
                TextField(controller: _bodyController, maxLines: 3, decoration: const InputDecoration(labelText: 'Tip body')),
                const SizedBox(height: 10),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _add, child: const Text('Add Tip'))),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Existing Tips', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        for (final t in tips)
          Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              title: Text(t.title),
              subtitle: Text(t.body, maxLines: 2, overflow: TextOverflow.ellipsis),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
                onPressed: () {
                  WellnessContentService.instance.removeTip(t.id);
                  setState(() {});
                },
              ),
            ),
          ),
      ],
    );
  }
}
