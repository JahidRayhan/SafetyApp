import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/admin_request.dart';
import '../../services/admin_service.dart';

/// Ported from ReviewRequests.tsx's govt_admin branch: reviews the
/// zone/data requests admins have submitted (AdminService.requests),
/// approving or rejecting each.
class ReviewRequestsScreen extends StatefulWidget {
  const ReviewRequestsScreen({super.key});

  @override
  State<ReviewRequestsScreen> createState() => _ReviewRequestsScreenState();
}

class _ReviewRequestsScreenState extends State<ReviewRequestsScreen> {
  void _resolve(String id, bool approved) {
    AdminService.instance.resolveRequest(id, approved: approved);
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(approved ? 'Request approved.' : 'Request rejected.'),
        backgroundColor: approved ? AppColors.safe600 : AppColors.destructive,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final requests = AdminService.instance.requests;
    final pending = requests.where((r) => r.status == AdminRequestStatus.pending).toList();
    final resolved = requests.where((r) => r.status != AdminRequestStatus.pending).toList();

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Review Requests', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Zone and data-modification requests submitted by admins.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        if (pending.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Text('No pending requests.', style: TextStyle(color: AppColors.mutedForeground)),
          )
        else
          for (final r in pending)
            Card(
              margin: const EdgeInsets.only(bottom: 10),
              color: AppColors.warning50,
              child: Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(r.type == AdminRequestType.zoneRequest ? Icons.map_rounded : Icons.storage_rounded, color: AppColors.warning600),
                        const SizedBox(width: 10),
                        Expanded(child: Text(r.title, style: const TextStyle(fontWeight: FontWeight.bold))),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(r.detail, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text('Urgency: ${r.urgency}', style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => _resolve(r.id, false),
                            style: OutlinedButton.styleFrom(foregroundColor: AppColors.destructive),
                            child: const Text('Reject'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => _resolve(r.id, true),
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
        if (resolved.isNotEmpty) ...[
          const SizedBox(height: 12),
          const Text('Resolved', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          for (final r in resolved)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                title: Text(r.title),
                subtitle: Text(r.detail, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: Text(
                  r.status == AdminRequestStatus.approved ? 'Approved' : 'Rejected',
                  style: TextStyle(
                    color: r.status == AdminRequestStatus.approved ? AppColors.safe600 : AppColors.destructive,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ),
        ],
      ],
    );
  }
}
