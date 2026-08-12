import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';
import '../../services/admin_service.dart';
import '../../services/community_service.dart';
import '../../services/contact_service.dart';
import '../../services/incident_service.dart';

/// Ported from AdminHome.tsx: quick stat cards + shortcuts. Counts are
/// pulled live from the in-memory services (they'll reflect real Supabase
/// aggregates once each service is backend-wired — nothing in this screen
/// needs to change then).
class AdminHomeScreen extends StatefulWidget {
  final ValueChanged<String> onNavigate;
  const AdminHomeScreen({super.key, required this.onNavigate});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _contacts = 0;
  int _reports = 0;
  int _stories = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final contacts = await ContactService.instance.list();
    final reports = await IncidentService.instance.list();
    final stories = await CommunityService.instance.list();
    if (!mounted) return;
    setState(() {
      _contacts = contacts.length;
      _reports = reports.length;
      _stories = stories.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    final sosCount =
        ActivityLogService.instance.entries.where((e) => e.type == ActivityType.sos).length;
    final pendingApprovals = AdminService.instance.approvals.length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Admin Dashboard', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Platform oversight & moderation', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _StatCard(label: 'SOS Alerts', value: '$sosCount', icon: Icons.emergency_rounded, color: AppColors.emergency600),
            _StatCard(label: 'Pending Approvals', value: '$pendingApprovals', icon: Icons.inbox_rounded, color: AppColors.warning600),
            _StatCard(label: 'Incident Reports', value: '$_reports', icon: Icons.report_rounded, color: Colors.blue),
            _StatCard(label: 'Community Posts', value: '$_stories', icon: Icons.groups_rounded, color: AppColors.safe600),
          ],
        ),
        const SizedBox(height: 20),
        const Text('Quick Actions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),
        _ActionTile(icon: Icons.notifications_active_rounded, label: 'Review SOS Alerts', onTap: () => widget.onNavigate('alerts')),
        _ActionTile(icon: Icons.inbox_rounded, label: 'Pending Approvals', onTap: () => widget.onNavigate('admin-requests')),
        _ActionTile(icon: Icons.verified_user_rounded, label: 'User Info', onTap: () => widget.onNavigate('user-info')),
        _ActionTile(icon: Icons.monitor_heart_rounded, label: 'Activity Monitoring', onTap: () => widget.onNavigate('activity-monitoring')),
        _ActionTile(icon: Icons.groups_2_rounded, label: 'Community Management', onTap: () => widget.onNavigate('community-management')),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _StatCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.panel),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
        ],
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.emergency600),
        title: Text(label),
        trailing: const Icon(Icons.chevron_right_rounded),
        onTap: onTap,
      ),
    );
  }
}
