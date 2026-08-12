import 'dart:async';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'evidence_queue_service.dart';

/// Auto-starts an audio recording the moment SOS activates (from ANY
/// trigger — button tap, volume-press, shake, or the lock-screen
/// accessibility trigger), and saves it to the evidence queue when SOS is
/// resolved. This is the Dart-side "start evidence recording" piece — it
/// only runs once the Flutter engine is actually active, so it can't
/// capture the few seconds before a cold app-launch finishes, but covers
/// everything from the moment SOS fires onward.
class AutoEvidenceRecorder {
  AutoEvidenceRecorder._();
  static final AutoEvidenceRecorder instance = AutoEvidenceRecorder._();

  final _recorder = AudioRecorder();
  String? _path;
  DateTime? _startedAt;
  bool _recording = false;

  Future<void> start() async {
    if (_recording) return;
    if (!await _recorder.hasPermission()) return; // fail silently — SOS flow shouldn't block on this
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/${DateTime.now().millisecondsSinceEpoch}_sos_evidence.m4a';
    await _recorder.start(const RecordConfig(), path: path);
    _path = path;
    _startedAt = DateTime.now();
    _recording = true;
  }

  Future<void> stopAndSave() async {
    if (!_recording) return;
    final path = await _recorder.stop();
    _recording = false;
    final finalPath = path ?? _path;
    if (finalPath == null) return;
    final duration = _startedAt != null ? DateTime.now().difference(_startedAt!).inSeconds : null;
    await EvidenceQueueService.instance.add(kind: EvidenceKind.audio, localPath: finalPath, durationSeconds: duration);
  }
}
