import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/govt_service.dart';

/// Ported from GovernmentAdminHome.tsx's "Data Requests" feature — a
/// govt_admin's own outgoing requests for data (distinct from reviewing
/// admin-submitted requests, which is ReviewRequestsScreen).
class GovtDataRequestsScreen extends StatefulWidget {
  const GovtDataRequestsScreen({super.key});

  @override
  State<GovtDataRequestsScreen> createState() => _GovtDataRequestsScreenState();
}

class _GovtDataRequestsScreenState extends State<GovtDataRequestsScreen> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  String _dataType = 'user_locations';

  void _submit() {
    if (_titleController.text.trim().isEmpty) return;
    GovtService.instance.submit(
      title: _titleController.text.trim(),
      description: _descController.text.trim(),
      dataType: _dataType,
    );
    _titleController.clear();
    _descController.clear();
    setState(() {});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Data request submitted.'), backgroundColor: AppColors.safe600),
    );
  }

  @override
  Widget build(BuildContext context) {
    final requests = GovtService.instance.requests;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Data Requests', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Submit and track requests for platform data.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Request title')),
                const SizedBox(height: 10),
                TextField(controller: _descController, maxLines: 3, decoration: const InputDecoration(labelText: 'Description / justification')),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  initialValue: _dataType,
                  decoration: const InputDecoration(labelText: 'Data type'),
                  items: const [
                    DropdownMenuItem(value: 'user_locations', child: Text('User locations')),
                    DropdownMenuItem(value: 'incident_reports', child: Text('Incident reports')),
                    DropdownMenuItem(value: 'sos_history', child: Text('SOS history')),
                    DropdownMenuItem(value: 'evidence_media', child: Text('Evidence media')),
                  ],
                  onChanged: (v) => setState(() => _dataType = v ?? 'user_locations'),
                ),
                const SizedBox(height: 12),
                ElevatedButton(onPressed: _submit, child: const Text('Submit Request')),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Submitted Requests', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        if (requests.isEmpty)
          const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Text('No requests yet.', style: TextStyle(color: AppColors.mutedForeground)))
        else
          for (final r in requests)
            Card(
              margin: const EdgeInsets.only(bottom: 8),
              child: ListTile(
                leading: const Icon(Icons.folder_shared_rounded, color: AppColors.emergency600),
                title: Text(r.title),
                subtitle: Text('${r.dataType} · ${r.description}'),
                trailing: Text(
                  r.status.name,
                  style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground),
                ),
              ),
            ),
      ],
    );
  }
}
