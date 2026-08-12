import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/admin_request.dart';
import '../../services/admin_service.dart';

/// Ported from AdminRequests.tsx: an admin submits zone-creation or
/// data-modification requests upward to govt_admins for review.
class AdminRequestsScreen extends StatefulWidget {
  const AdminRequestsScreen({super.key});

  @override
  State<AdminRequestsScreen> createState() => _AdminRequestsScreenState();
}

class _AdminRequestsScreenState extends State<AdminRequestsScreen> {
  AdminRequestType _tab = AdminRequestType.zoneRequest;
  final _locationController = TextEditingController();
  final _reasonController = TextEditingController();
  String _urgency = 'medium';

  void _submit() {
    if (_locationController.text.trim().isEmpty || _reasonController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all fields.'), backgroundColor: AppColors.destructive),
      );
      return;
    }
    AdminService.instance.submitRequest(
      type: _tab,
      title: _tab == AdminRequestType.zoneRequest ? 'Zone request: ${_locationController.text}' : 'Data request: ${_locationController.text}',
      detail: _reasonController.text,
      urgency: _urgency,
    );
    _locationController.clear();
    _reasonController.clear();
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Request submitted to Government Officials for review.'), backgroundColor: AppColors.safe600),
    );
  }

  @override
  Widget build(BuildContext context) {
    final requests = AdminService.instance.requests;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Admin Requests', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Submit requests for review by Government Officials.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: const Text('Zone Request'),
                selected: _tab == AdminRequestType.zoneRequest,
                onSelected: (_) => setState(() => _tab = AdminRequestType.zoneRequest),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                label: const Text('Data Modification'),
                selected: _tab == AdminRequestType.dataModification,
                onSelected: (_) => setState(() => _tab = AdminRequestType.dataModification),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(
                  controller: _locationController,
                  decoration: InputDecoration(
                    labelText: _tab == AdminRequestType.zoneRequest ? 'Location / area' : 'Data type / title',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _reasonController,
                  maxLines: 3,
                  decoration: const InputDecoration(labelText: 'Reason / description'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  initialValue: _urgency,
                  decoration: const InputDecoration(labelText: 'Urgency'),
                  items: const [
                    DropdownMenuItem(value: 'low', child: Text('Low')),
                    DropdownMenuItem(value: 'medium', child: Text('Medium')),
                    DropdownMenuItem(value: 'high', child: Text('High')),
                  ],
                  onChanged: (v) => setState(() => _urgency = v ?? 'medium'),
                ),
                const SizedBox(height: 16),
                ElevatedButton.icon(onPressed: _submit, icon: const Icon(Icons.send_rounded), label: const Text('Submit Request')),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text('Submitted Requests', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (requests.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Text('No requests submitted yet.', style: TextStyle(color: AppColors.mutedForeground)),
          )
        else
          for (final r in requests)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: Icon(
                  r.type == AdminRequestType.zoneRequest ? Icons.map_rounded : Icons.storage_rounded,
                  color: AppColors.emergency600,
                ),
                title: Text(r.title),
                subtitle: Text('${r.detail}\nUrgency: ${r.urgency}'),
                isThreeLine: true,
                trailing: _StatusChip(status: r.status),
              ),
            ),
      ],
    );
  }
}

class _StatusChip extends StatelessWidget {
  final AdminRequestStatus status;
  const _StatusChip({required this.status});

  @override
  Widget build(BuildContext context) {
    final (label, color) = switch (status) {
      AdminRequestStatus.pending => ('Pending', AppColors.warning600),
      AdminRequestStatus.approved => ('Approved', AppColors.safe600),
      AdminRequestStatus.rejected => ('Rejected', AppColors.destructive),
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(AppRadius.pill)),
      child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold)),
    );
  }
}
