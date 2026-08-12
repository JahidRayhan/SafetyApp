import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/admin_request.dart';
import '../../services/admin_service.dart';

/// Ported from AdminApprovals.tsx.
class AdminApprovalsScreen extends StatefulWidget {
  const AdminApprovalsScreen({super.key});

  @override
  State<AdminApprovalsScreen> createState() => _AdminApprovalsScreenState();
}

class _AdminApprovalsScreenState extends State<AdminApprovalsScreen> {
  void _resolve(String id, bool approved) {
    AdminService.instance.resolveApproval(id, approved: approved);
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(approved ? 'Approved.' : 'Rejected.'),
        backgroundColor: approved ? AppColors.safe600 : AppColors.destructive,
      ),
    );
  }

  IconData _iconFor(ApprovalKind k) => switch (k) {
        ApprovalKind.userVerification => Icons.verified_user_rounded,
        ApprovalKind.roleUpgrade => Icons.upgrade_rounded,
        ApprovalKind.contentFlag => Icons.flag_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final approvals = AdminService.instance.approvals;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Pending Approvals', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('User verifications and flagged content awaiting review.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (approvals.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 40),
            child: Column(
              children: [
                Icon(Icons.done_all_rounded, size: 48, color: AppColors.safe600.withValues(alpha: 0.6)),
                const SizedBox(height: 12),
                const Text('All caught up — nothing pending.', style: TextStyle(color: AppColors.mutedForeground)),
              ],
            ),
          )
        else
          for (final a in approvals)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(_iconFor(a.kind), color: AppColors.warning600),
                        const SizedBox(width: 10),
                        Expanded(child: Text(a.title, style: const TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(a.detail, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _resolve(a.id, false),
                            style: OutlinedButton.styleFrom(foregroundColor: AppColors.destructive),
                            child: const Text('Reject'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _resolve(a.id, true),
                            style: ElevatedButton.styleFrom(backgroundColor: AppColors.safe600),
                            child: const Text('Approve'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
      ],
    );
  }
}
