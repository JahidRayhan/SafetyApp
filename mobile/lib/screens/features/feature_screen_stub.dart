import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Shared template for the many feature screens that are scaffolded but not
/// yet fully built out (mirrors ContentRenderer.tsx's default "Feature Coming
/// Soon" case, but keyed per-feature so each has its own icon/title/
/// description ready for real content). Swap the `child` for real UI as each
/// feature gets built.
class FeatureScreenStub extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Widget? child;

  const FeatureScreenStub({
    super.key,
    required this.icon,
    required this.title,
    required this.description,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: AppColors.emergency100,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Icon(icon, color: AppColors.emergency600),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title,
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(description,
                            style: const TextStyle(color: AppColors.mutedForeground)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (child != null) ...[
            const SizedBox(height: 16),
            child!,
          ],
        ],
      ),
    );
  }
}
