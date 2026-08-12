import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';
import '../../services/admin_service.dart';
import '../../services/geofencing_service.dart';

/// Ported from GovernmentAdminHome.tsx: quick stat cards + shortcuts for
/// the govt_admin role.
class GovernmentHomeScreen extends StatelessWidget {
  final ValueChanged<String> onNavigate;
  const GovernmentHomeScreen({super.key, required this.onNavigate});

  @override
  Widget build(BuildContext context) {
    final pendingAdminRequests = AdminService.instance.requests.where((r) => r.status.name == 'pending').length;
    final zoneCount = GeofencingService.instance.debugZones.length;
    final systemEvents = ActivityLogService.instance.entries.length;
    final sosCount = ActivityLogService.instance.entries.where((e) => e.type == ActivityType.sos).length;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Government Dashboard', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Incident review & safe zone management', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.5,
          children: [
            _StatCard(label: 'Pending Admin Requests', value: '$pendingAdminRequests', icon: Icons.fact_check_rounded, color: AppColors.warning600),
            _StatCard(label: 'Safe Zones', value: '$zoneCount', icon: Icons.shield_rounded, color: AppColors.safe600),
            _StatCard(label: 'SOS Alerts (system-wide)', value: '$sosCount', icon: Icons.emergency_rounded, color: AppColors.emergency600),
            _StatCard(label: 'Logged Events', value: '$systemEvents', icon: Icons.monitor_heart_rounded, color: Colors.blue),
          ],
        ),
        const SizedBox(height: 20),
        const Text('Quick Actions', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 10),
        _ActionTile(icon: Icons.fact_check_rounded, label: 'Review Requests', onTap: () => onNavigate('review-requests')),
        _ActionTile(icon: Icons.shield_rounded, label: 'Manage Safe Zones', onTap: () => onNavigate('safezones')),
        _ActionTile(icon: Icons.folder_shared_rounded, label: 'Data Requests', onTap: () => onNavigate('govt-requests')),
        _ActionTile(icon: Icons.history_edu_rounded, label: 'System Monitoring', onTap: () => onNavigate('activity-log')),
        _ActionTile(icon: Icons.verified_user_rounded, label: 'User Information', onTap: () => onNavigate('user-info')),
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
