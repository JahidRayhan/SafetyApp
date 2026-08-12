import 'dart:async';
import 'package:camera/camera.dart';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/evidence_queue_service.dart';

/// Real video recording via the `camera` package: live preview, start/stop,
/// then save to the evidence queue. Ported from RecordingPanel.tsx's video
/// tab (the original likely uses Capacitor's camera plugin; this is the
/// Flutter equivalent).
class VideoRecorderPanel extends StatefulWidget {
  const VideoRecorderPanel({super.key});

  @override
  State<VideoRecorderPanel> createState() => _VideoRecorderPanelState();
}

enum _VideoState { idle, initializing, ready, recording, saving, saved, error }

class _VideoRecorderPanelState extends State<VideoRecorderPanel> {
  CameraController? _controller;
  _VideoState _state = _VideoState.idle;
  String? _error;
  Duration _elapsed = Duration.zero;
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    setState(() => _state = _VideoState.initializing);
    try {
      final cameras = await availableCameras();
      if (cameras.isEmpty) {
        setState(() {
          _state = _VideoState.error;
          _error = 'No camera found on this device.';
        });
        return;
      }
      final camera = cameras.firstWhere((c) => c.lensDirection == CameraLensDirection.back, orElse: () => cameras.first);
      final controller = CameraController(camera, ResolutionPreset.medium, enableAudio: true);
      await controller.initialize();
      if (!mounted) return;
      setState(() {
        _controller = controller;
        _state = _VideoState.ready;
      });
    } catch (e) {
      setState(() {
        _state = _VideoState.error;
        _error = 'Camera permission is required to record video.';
      });
    }
  }

  Future<void> _startRecording() async {
    final controller = _controller;
    if (controller == null) return;
    await controller.startVideoRecording();
    setState(() {
      _state = _VideoState.recording;
      _elapsed = Duration.zero;
    });
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => setState(() => _elapsed += const Duration(seconds: 1)));
  }

  Future<void> _stopAndSave() async {
    final controller = _controller;
    if (controller == null) return;
    _ticker?.cancel();
    setState(() => _state = _VideoState.saving);
    final file = await controller.stopVideoRecording();
    await EvidenceQueueService.instance.add(kind: EvidenceKind.video, localPath: file.path, durationSeconds: _elapsed.inSeconds);
    if (!mounted) return;
    setState(() => _state = _VideoState.saved);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Video evidence saved.'), backgroundColor: AppColors.safe600),
    );
    // Brief pause so "Saved" is visible, then return to ready for another take.
    await Future.delayed(const Duration(seconds: 1));
    if (mounted) setState(() => _state = _VideoState.ready);
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _controller?.dispose();
    super.dispose();
  }

  String _fmt(Duration d) =>
      '${d.inMinutes.remainder(60).toString().padLeft(2, '0')}:${d.inSeconds.remainder(60).toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    if (_state == _VideoState.initializing) {
      return const SizedBox(height: 200, child: Center(child: CircularProgressIndicator()));
    }
    if (_state == _VideoState.error) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: AppColors.secondary, borderRadius: BorderRadius.circular(AppRadius.md)),
        child: Column(
          children: [
            const Icon(Icons.videocam_off_rounded, size: 36, color: AppColors.mutedForeground),
            const SizedBox(height: 10),
            Text(_error ?? 'Camera unavailable', textAlign: TextAlign.center, style: const TextStyle(color: AppColors.mutedForeground)),
            const SizedBox(height: 12),
            OutlinedButton(onPressed: _init, child: const Text('Retry')),
          ],
        ),
      );
    }

    final controller = _controller;
    if (controller == null || !controller.value.isInitialized) {
      return const SizedBox(height: 200, child: Center(child: CircularProgressIndicator()));
    }

    return Column(
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: AspectRatio(
            aspectRatio: controller.value.aspectRatio,
            child: CameraPreview(controller),
          ),
        ),
        const SizedBox(height: 12),
        if (_state == _VideoState.recording) Text(_fmt(_elapsed), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 10),
        GestureDetector(
          onTap: _state == _VideoState.recording
              ? _stopAndSave
              : (_state == _VideoState.ready ? _startRecording : null),
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: _state == _VideoState.recording ? AppColors.mutedForeground : AppColors.emergency600,
            ),
            child: Icon(
              _state == _VideoState.recording ? Icons.stop_rounded : Icons.videocam_rounded,
              color: Colors.white,
              size: 28,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          switch (_state) {
            _VideoState.ready => 'Tap to start recording video evidence.',
            _VideoState.recording => 'Recording…',
            _VideoState.saving => 'Saving…',
            _VideoState.saved => 'Saved to your evidence queue.',
            _ => '',
          },
          style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13),
        ),
      ],
    );
  }
}
