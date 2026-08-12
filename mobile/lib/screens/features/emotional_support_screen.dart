import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/wellness_content_service.dart';

class EmotionalSupportScreen extends StatelessWidget {
  const EmotionalSupportScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tips = WellnessContentService.instance.tips;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Emotional Support', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Gentle reminders and coping tools for difficult moments.',
            style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        for (final t in tips)
          Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(t.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  const SizedBox(height: 6),
                  Text(t.body, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13, height: 1.4)),
                ],
              ),
            ),
          ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.emergency50,
            border: Border.all(color: AppColors.emergency200),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: const Text(
            'If you are in crisis or thinking about harming yourself, please contact your local emergency '
            'number or a crisis line right away. You deserve support.',
            style: TextStyle(color: AppColors.emergency700, fontSize: 13, height: 1.4),
          ),
        ),
      ],
    );
  }
}
