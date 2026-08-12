import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/evidence_queue_service.dart';

/// Real device file picker via `file_picker`: pick one or more existing
/// photos/videos/documents from the device and add them to the evidence
/// queue. Ported from RecordingPanel.tsx's upload tab.
class UploadEvidencePanel extends StatefulWidget {
  const UploadEvidencePanel({super.key});

  @override
  State<UploadEvidencePanel> createState() => _UploadEvidencePanelState();
}

class _UploadEvidencePanelState extends State<UploadEvidencePanel> {
  bool _picking = false;
  final List<String> _justAdded = [];

  Future<void> _pickFiles() async {
    setState(() => _picking = true);
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf', 'm4a', 'mp3'],
      );
      if (result == null) return; // user cancelled
      for (final f in result.files) {
        if (f.path == null) continue;
        await EvidenceQueueService.instance.add(kind: EvidenceKind.file, localPath: f.path!);
        _justAdded.add(f.name);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('${result.files.length} file(s) added to your evidence queue.'), backgroundColor: AppColors.safe600),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not access files on this device.'), backgroundColor: AppColors.destructive),
        );
      }
    } finally {
      if (mounted) setState(() => _picking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.secondary,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.border, style: BorderStyle.solid),
          ),
          child: Column(
            children: [
              Icon(Icons.upload_file_rounded, size: 40, color: AppColors.mutedForeground),
              const SizedBox(height: 10),
              const Text('Upload photos, videos, or documents from your device', textAlign: TextAlign.center),
              const SizedBox(height: 14),
              ElevatedButton.icon(
                onPressed: _picking ? null : _pickFiles,
                icon: _picking
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.folder_open_rounded),
                label: Text(_picking ? 'Picking…' : 'Choose Files'),
              ),
            ],
          ),
        ),
        if (_justAdded.isNotEmpty) ...[
          const SizedBox(height: 14),
          Align(
            alignment: Alignment.centerLeft,
            child: Text('Added this session', style: TextStyle(fontWeight: FontWeight.w600, color: AppColors.mutedForeground.withValues(alpha: 0.9), fontSize: 12)),
          ),
          const SizedBox(height: 6),
          for (final name in _justAdded)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  const Icon(Icons.check_circle_rounded, size: 16, color: AppColors.safe600),
                  const SizedBox(width: 6),
                  Expanded(child: Text(name, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13))),
                ],
              ),
            ),
        ],
      ],
    );
  }
}
