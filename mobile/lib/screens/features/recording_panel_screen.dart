import 'dart:async';
import 'package:flutter/material.dart';
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import '../../core/theme.dart';
import '../../services/evidence_queue_service.dart';
import 'upload_evidence_panel.dart';
import 'video_recorder_panel.dart';

enum _RecordingTab { audio, video, upload }

/// Ported from src/components/RecordingPanel.tsx (+ AudioRecorder.tsx). All
/// three tabs — audio, video, upload — are now fully functional.
class RecordingPanelScreen extends StatefulWidget {
  const RecordingPanelScreen({super.key});

  @override
  State<RecordingPanelScreen> createState() => _RecordingPanelScreenState();
}

class _RecordingPanelScreenState extends State<RecordingPanelScreen> {
  _RecordingTab _tab = _RecordingTab.audio;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.description_rounded, color: AppColors.emergency600),
                    SizedBox(width: 10),
                    Text('Evidence Recording', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _TabChip(
                      label: 'Audio',
                      icon: Icons.mic_rounded,
                      selected: _tab == _RecordingTab.audio,
                      onTap: () => setState(() => _tab = _RecordingTab.audio),
                    ),
                    const SizedBox(width: 8),
                    _TabChip(
                      label: 'Video',
                      icon: Icons.videocam_rounded,
                      selected: _tab == _RecordingTab.video,
                      onTap: () => setState(() => _tab = _RecordingTab.video),
                    ),
                    const SizedBox(width: 8),
                    _TabChip(
                      label: 'Upload',
                      icon: Icons.upload_rounded,
                      selected: _tab == _RecordingTab.upload,
                      onTap: () => setState(() => _tab = _RecordingTab.upload),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                switch (_tab) {
                  _RecordingTab.audio => const _AudioRecorderPanel(),
                  _RecordingTab.video => const VideoRecorderPanel(),
                  _RecordingTab.upload => const UploadEvidencePanel(),
                },
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.blue.withValues(alpha: 0.06),
            border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Evidence Collection Tips', style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold)),
              SizedBox(height: 6),
              Text('• Record clear audio/video evidence of the situation', style: TextStyle(color: Colors.blue, fontSize: 13)),
              Text('• Speak clearly and describe what you\'re seeing', style: TextStyle(color: Colors.blue, fontSize: 13)),
              Text('• Keep recordings focused and relevant to the incident', style: TextStyle(color: Colors.blue, fontSize: 13)),
              Text('• Upload existing photos/videos from your device', style: TextStyle(color: Colors.blue, fontSize: 13)),
              Text('• All recordings are encrypted and stored securely', style: TextStyle(color: Colors.blue, fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }
}

class _TabChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  const _TabChip({required this.label, required this.icon, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: selected ? AppColors.emergency600 : AppColors.secondary,
            borderRadius: BorderRadius.circular(AppRadius.md),
          ),
          child: Column(
            children: [
              Icon(icon, size: 18, color: selected ? Colors.white : AppColors.foreground),
              const SizedBox(height: 2),
              Text(label,
                  style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: selected ? Colors.white : AppColors.foreground)),
            ],
          ),
        ),
      ),
    );
  }
}


/// Fully functional audio recording: mic permission → record → stop →
/// playback → save to the (stubbed) evidence queue. Ported from
/// AudioRecorder.tsx's state machine.
class _AudioRecorderPanel extends StatefulWidget {
  const _AudioRecorderPanel();

  @override
  State<_AudioRecorderPanel> createState() => _AudioRecorderPanelState();
}

enum _AudioState { idle, recording, recorded, playing, saving, saved }

class _AudioRecorderPanelState extends State<_AudioRecorderPanel> {
  final _recorder = AudioRecorder();
  final _player = AudioPlayer();
  _AudioState _state = _AudioState.idle;
  String? _path;
  Duration _elapsed = Duration.zero;
  Timer? _ticker;
  StreamSubscription<void>? _completeSub;

  @override
  void initState() {
    super.initState();
    _completeSub = _player.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _state = _AudioState.recorded);
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _completeSub?.cancel();
    _recorder.dispose();
    _player.dispose();
    super.dispose();
  }

  Future<void> _start() async {
    if (!await _recorder.hasPermission()) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Microphone permission is required to record audio.'),
            backgroundColor: AppColors.destructive,
          ),
        );
      }
      return;
    }
    final dir = await getTemporaryDirectory();
    final path = '${dir.path}/${DateTime.now().millisecondsSinceEpoch}_evidence.m4a';
    await _recorder.start(const RecordConfig(), path: path);
    setState(() {
      _state = _AudioState.recording;
      _path = path;
      _elapsed = Duration.zero;
    });
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _elapsed += const Duration(seconds: 1));
    });
  }

  Future<void> _stop() async {
    final path = await _recorder.stop();
    _ticker?.cancel();
    setState(() {
      _state = _AudioState.recorded;
      _path = path ?? _path;
    });
  }

  Future<void> _togglePlay() async {
    if (_path == null) return;
    if (_state == _AudioState.playing) {
      await _player.pause();
      setState(() => _state = _AudioState.recorded);
    } else {
      await _player.play(DeviceFileSource(_path!));
      setState(() => _state = _AudioState.playing);
    }
  }

  Future<void> _save() async {
    if (_path == null) return;
    setState(() => _state = _AudioState.saving);
    await EvidenceQueueService.instance.add(
      kind: EvidenceKind.audio,
      localPath: _path!,
      durationSeconds: _elapsed.inSeconds,
    );
    if (!mounted) return;
    setState(() => _state = _AudioState.saved);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Audio evidence saved.'), backgroundColor: AppColors.safe600),
    );
  }

  String _fmt(Duration d) =>
      '${d.inMinutes.remainder(60).toString().padLeft(2, '0')}:${d.inSeconds.remainder(60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    final isRecording = _state == _AudioState.recording;
    final hasRecording = _path != null && _state != _AudioState.recording;

    return Column(
      children: [
        if (isRecording || hasRecording)
          Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(_fmt(_elapsed), style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
          ),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _RoundIconButton(
              icon: isRecording ? Icons.stop_rounded : Icons.mic_rounded,
              color: isRecording ? AppColors.mutedForeground : AppColors.emergency600,
              onTap: isRecording ? _stop : _start,
              pulse: isRecording,
            ),
            if (hasRecording) ...[
              const SizedBox(width: 16),
              _RoundIconButton(
                icon: _state == _AudioState.playing ? Icons.pause_rounded : Icons.play_arrow_rounded,
                color: Colors.blue,
                onTap: _togglePlay,
              ),
              const SizedBox(width: 16),
              _RoundIconButton(
                icon: _state == _AudioState.saved ? Icons.check_rounded : Icons.save_rounded,
                color: AppColors.safe600,
                onTap: _state == _AudioState.saving || _state == _AudioState.saved ? null : _save,
              ),
            ],
          ],
        ),
        const SizedBox(height: 10),
        Text(
          switch (_state) {
            _AudioState.idle => 'Tap the mic to start recording audio evidence.',
            _AudioState.recording => 'Recording…',
            _AudioState.recorded => 'Recording ready — play it back or save it.',
            _AudioState.playing => 'Playing…',
            _AudioState.saving => 'Saving…',
            _AudioState.saved => 'Saved to your evidence queue.',
          },
          style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13),
        ),
      ],
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;
  final bool pulse;

  const _RoundIconButton({required this.icon, required this.color, required this.onTap, this.pulse = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: onTap == null ? color.withValues(alpha: 0.4) : color,
        ),
        child: Icon(icon, color: Colors.white, size: 24),
      ),
    );
  }
}
