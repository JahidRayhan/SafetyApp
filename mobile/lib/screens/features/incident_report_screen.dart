import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../core/theme.dart';
import '../../models/incident_report.dart';
import '../../services/incident_service.dart';

class IncidentReportScreen extends StatefulWidget {
  const IncidentReportScreen({super.key});

  @override
  State<IncidentReportScreen> createState() => _IncidentReportScreenState();
}

class _IncidentReportScreenState extends State<IncidentReportScreen> {
  List<IncidentReport> _reports = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetch();
  }

  Future<void> _fetch() async {
    setState(() => _loading = true);
    final list = await IncidentService.instance.list();
    if (!mounted) return;
    setState(() {
      _reports = list;
      _loading = false;
    });
  }

  Future<void> _openForm() async {
    final created = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _IncidentFormSheet(),
    );
    if (created == true) _fetch();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openForm,
        icon: const Icon(Icons.add),
        label: const Text('Report Incident'),
        backgroundColor: AppColors.emergency600,
        foregroundColor: Colors.white,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _fetch,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                children: [
                  const Text('Incident Reports', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 6),
                  const Text('File a report about something that happened to you or that you witnessed.',
                      style: TextStyle(color: AppColors.mutedForeground)),
                  const SizedBox(height: 16),
                  if (_reports.isEmpty)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 40),
                      child: Column(
                        children: [
                          Icon(Icons.report_outlined, size: 48, color: AppColors.mutedForeground.withValues(alpha: 0.6)),
                          const SizedBox(height: 12),
                          const Text('No reports yet', style: TextStyle(color: AppColors.mutedForeground)),
                        ],
                      ),
                    )
                  else
                    for (final r in _reports) _ReportCard(report: r),
                ],
              ),
            ),
    );
  }
}

class _ReportCard extends StatelessWidget {
  final IncidentReport report;
  const _ReportCard({required this.report});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: Text(report.title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15))),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.secondary,
                    borderRadius: BorderRadius.circular(AppRadius.pill),
                  ),
                  child: Text(report.category.label, style: const TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(report.description, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.circle, size: 8, color: report.status == IncidentStatus.resolved ? AppColors.safe600 : AppColors.warning600),
                const SizedBox(width: 6),
                Text(
                  switch (report.status) {
                    IncidentStatus.submitted => 'Submitted',
                    IncidentStatus.underReview => 'Under review',
                    IncidentStatus.resolved => 'Resolved',
                  },
                  style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground),
                ),
                const Spacer(),
                Text('${report.createdAt.hour.toString().padLeft(2, '0')}:${report.createdAt.minute.toString().padLeft(2, '0')}',
                    style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _IncidentFormSheet extends StatefulWidget {
  const _IncidentFormSheet();

  @override
  State<_IncidentFormSheet> createState() => _IncidentFormSheetState();
}

class _IncidentFormSheetState extends State<_IncidentFormSheet> {
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  IncidentCategory _category = IncidentCategory.other;
  bool _attachLocation = false;
  bool _saving = false;
  String? _error;

  Future<void> _submit() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      double? lat, lng;
      if (_attachLocation) {
        final pos = await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(accuracy: LocationAccuracy.medium),
        );
        lat = pos.latitude;
        lng = pos.longitude;
      }
      await IncidentService.instance.create(
        title: _titleController.text,
        description: _descController.text,
        category: _category,
        lat: lat,
        lng: lng,
      );
      if (mounted) Navigator.pop(context, true);
    } catch (e) {
      setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.card,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.panel)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Report an Incident', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(controller: _titleController, decoration: const InputDecoration(labelText: 'Title *')),
              const SizedBox(height: 12),
              TextField(
                controller: _descController,
                maxLines: 4,
                decoration: const InputDecoration(labelText: 'What happened? *'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<IncidentCategory>(
                initialValue: _category,
                decoration: const InputDecoration(labelText: 'Category'),
                items: IncidentCategory.values
                    .map((c) => DropdownMenuItem(value: c, child: Text(c.label)))
                    .toList(),
                onChanged: (v) => setState(() => _category = v ?? IncidentCategory.other),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                title: const Text('Attach my current location'),
                value: _attachLocation,
                onChanged: (v) => setState(() => _attachLocation = v),
              ),
              if (_error != null) ...[
                const SizedBox(height: 4),
                Text(_error!, style: const TextStyle(color: AppColors.destructive, fontSize: 13)),
              ],
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Submit Report'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
