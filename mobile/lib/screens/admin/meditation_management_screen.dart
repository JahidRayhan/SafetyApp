import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/wellness_content_service.dart';

class MeditationManagementScreen extends StatefulWidget {
  const MeditationManagementScreen({super.key});

  @override
  State<MeditationManagementScreen> createState() => _MeditationManagementScreenState();
}

class _MeditationManagementScreenState extends State<MeditationManagementScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _minutesController = TextEditingController(text: '3');

  void _add() {
    if (_titleController.text.trim().isEmpty) return;
    WellnessContentService.instance.addSession(
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      minutes: int.tryParse(_minutesController.text) ?? 3,
    );
    _titleController.clear();
    _descController.clear();
    _minutesController.text = '3';
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final sessions = WellnessContentService.instance.sessions;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Meditation Management', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Add or remove guided sessions shown to users.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              children: [
                TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Session title')),
                const SizedBox(height: 10),
                TextField(controller: _descController, decoration: const InputDecoration(labelText: 'Description')),
                const SizedBox(height: 10),
                TextField(
                  controller: _minutesController,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'Minutes'),
                ),
                const SizedBox(height: 10),
                SizedBox(width: double.infinity, child: ElevatedButton(onPressed: _add, child: const Text('Add Session'))),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Existing Sessions', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        for (final s in sessions)
          Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: const Icon(Icons.self_improvement_rounded, color: Colors.blue),
              title: Text(s.title),
              subtitle: Text('${s.description}\n${s.minutes} min'),
              isThreeLine: true,
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
                onPressed: () {
                  WellnessContentService.instance.removeSession(s.id);
                  setState(() {});
                },
              ),
            ),
          ),
      ],
    );
  }
}
