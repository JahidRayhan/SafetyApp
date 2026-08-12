enum EvidenceKind { audio, video, file }

class EvidenceItem {
  final String id;
  final EvidenceKind kind;
  final String localPath;
  final int? durationSeconds;
  final DateTime recordedAt;
  bool uploaded;

  EvidenceItem({
    required this.id,
    required this.kind,
    required this.localPath,
    this.durationSeconds,
    DateTime? recordedAt,
    this.uploaded = false,
  }) : recordedAt = recordedAt ?? DateTime.now();
}

/// Stand-in for src/features/evidence/services/evidenceService.ts's
/// `uploadOne` + the offline evidence queue (core/sync/evidenceQueue.ts).
/// Keeps recordings locally (in-memory list here; the files themselves are
/// already durably on-disk via path_provider's temp dir) and marks them
/// "uploaded" instantly, since there's no backend wired yet.
///
/// TODO: replace `_fakeUpload` with a real Supabase Storage upload once the
/// backend is connected — everything else (the recording UI, this queue's
/// shape) stays the same.
class EvidenceQueueService {
  EvidenceQueueService._();
  static final EvidenceQueueService instance = EvidenceQueueService._();

  final List<EvidenceItem> items = [];

  Future<EvidenceItem> add({
    required EvidenceKind kind,
    required String localPath,
    int? durationSeconds,
  }) async {
    final item = EvidenceItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      kind: kind,
      localPath: localPath,
      durationSeconds: durationSeconds,
    );
    items.insert(0, item);
    await _fakeUpload(item);
    return item;
  }

  Future<void> _fakeUpload(EvidenceItem item) async {
    await Future.delayed(const Duration(milliseconds: 400));
    item.uploaded = true;
  }
}
