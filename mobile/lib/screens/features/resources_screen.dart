import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';

class _Resource {
  final String title;
  final String description;
  final String? phone;
  final String? url;
  const _Resource({required this.title, required this.description, this.phone, this.url});
}

/// Static safety-resource directory. The original likely pulls this from a
/// CMS/Supabase table so it's editable without a redeploy — for now it's a
/// hardcoded list so the screen is genuinely useful immediately. General
/// guidance only, not region-specific hotlines — swap in local numbers for
/// your actual deployment region before shipping.
class ResourcesScreen extends StatelessWidget {
  const ResourcesScreen({super.key});

  static const _resources = [
    _Resource(
      title: 'Emergency Services',
      description: 'For any immediate, life-threatening emergency.',
      phone: '999', // Bangladesh national emergency number
    ),
    _Resource(
      title: 'National Helpline for Violence Against Women & Children',
      description: 'Confidential support line (Bangladesh).',
      phone: '109',
    ),
    _Resource(
      title: 'De-escalation basics',
      description: 'Simple techniques for staying calm and safe in a tense situation.',
    ),
    _Resource(
      title: 'Planning a safety exit',
      description: 'How to prepare an exit plan before you feel unsafe, not during.',
    ),
    _Resource(
      title: 'Digital safety checklist',
      description: 'Reviewing app permissions, location sharing, and account security.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Safety Resources', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Hotlines and guides. Update phone numbers for your region before relying on this.',
            style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        for (final r in _resources)
          Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: Icon(r.phone != null ? Icons.call_rounded : Icons.menu_book_rounded, color: AppColors.emergency600),
              title: Text(r.title),
              subtitle: Text(r.description),
              trailing: r.phone != null
                  ? IconButton(
                      icon: const Icon(Icons.phone_rounded, color: AppColors.safe600),
                      onPressed: () => launchUrl(Uri(scheme: 'tel', path: r.phone)),
                    )
                  : null,
            ),
          ),
      ],
    );
  }
}
