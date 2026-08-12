import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../state/app_state.dart';

/// Combines src/components/settings/{ProfileSettings,NotificationSettings,
/// DataPrivacySettings,EmergencyPlanSettings}.tsx into one screen with
/// expandable sections. All toggles are local UI state for now — nothing
/// persists to a backend yet (no Supabase profile table wired), but every
/// control is interactive and holds its state within the session.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _pushNotifications = true;
  bool _emailAlerts = true;
  bool _shareLocationWithContacts = true;
  bool _autoRecordOnSos = true;
  double _sosCountdownSeconds = 3;

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Settings', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),

        _SectionCard(
          title: 'Profile',
          icon: Icons.person_rounded,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const CircleAvatar(child: Icon(Icons.person_rounded)),
              title: Text(appState.userEmail ?? 'Signed in'),
              subtitle: const Text('Tap to edit profile details'),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {}, // TODO: real profile edit form once backend exists
            ),
          ],
        ),

        _SectionCard(
          title: 'Notifications',
          icon: Icons.notifications_rounded,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Push notifications'),
              subtitle: const Text('SOS confirmations, zone alerts, etc.'),
              value: _pushNotifications,
              onChanged: (v) => setState(() => _pushNotifications = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Email alerts'),
              value: _emailAlerts,
              onChanged: (v) => setState(() => _emailAlerts = v),
            ),
          ],
        ),

        _SectionCard(
          title: 'Emergency Plan',
          icon: Icons.emergency_rounded,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('SOS countdown'),
              subtitle: Text('${_sosCountdownSeconds.round()} seconds before an alert sends'),
            ),
            Slider(
              value: _sosCountdownSeconds,
              min: 0,
              max: 10,
              divisions: 10,
              label: '${_sosCountdownSeconds.round()}s',
              onChanged: (v) => setState(() => _sosCountdownSeconds = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Auto-start evidence recording on SOS'),
              value: _autoRecordOnSos,
              onChanged: (v) => setState(() => _autoRecordOnSos = v),
            ),
          ],
        ),

        _SectionCard(
          title: 'Data & Privacy',
          icon: Icons.privacy_tip_rounded,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Share live location with contacts'),
              subtitle: const Text('Only during an active SOS or manual share'),
              value: _shareLocationWithContacts,
              onChanged: (v) => setState(() => _shareLocationWithContacts = v),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Download my data'),
              trailing: const Icon(Icons.chevron_right_rounded),
              onTap: () {}, // TODO
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Delete my account', style: TextStyle(color: AppColors.destructive)),
              trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.destructive),
              onTap: () {}, // TODO
            ),
          ],
        ),

        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () async => context.read<AppState>().signOut(),
          icon: const Icon(Icons.logout_rounded),
          label: const Text('Sign Out'),
        ),
      ],
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final List<Widget> children;
  const _SectionCard({required this.title, required this.icon, required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: AppColors.emergency600, size: 20),
                const SizedBox(width: 8),
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const Divider(height: 24),
            ...children,
          ],
        ),
      ),
    );
  }
}
