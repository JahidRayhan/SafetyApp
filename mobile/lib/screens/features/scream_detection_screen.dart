import 'dart:async';
import 'package:flutter/material.dart';
import 'package:record/record.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';

/// Ported from ScreamDetection.tsx. Real ML scream classification (as the
/// original likely intends) needs a trained audio model — out of scope
/// here. What IS implemented for real: continuous microphone amplitude
/// monitoring via `record`'s onAmplitudeChanged stream, flagging a sudden
/// loud spike (a rough proxy for "scream or shout") above a dB threshold
/// held for a short burst. This is a legitimate, working detector — just a
/// much simpler one than genuine audio classification, and it WILL also
/// fire on other loud sounds (dropped objects, shouting in general, etc).
/// Be upfront with users about that if you ship this as-is.
class ScreamDetectionScreen extends StatefulWidget {
  const ScreamDetectionScreen({super.key});

  @override
  State<ScreamDetectionScreen> createState() => _ScreamDetectionScreenState();
}

class _ScreamDetectionScreenState extends State<ScreamDetectionScreen> {
  final _recorder = AudioRecorder();
  StreamSubscription<Amplitude>? _ampSub;
  bool _listening = false;
  double _currentDb = -160;
  int _loudStreak = 0;
  DateTime? _lastTrigger;

  static const double _threshold = -18; // dB — louder (closer to 0) triggers
  static const int _requiredStreak = 3; // consecutive loud samples (~600ms)

  Future<void> _toggle() async {
    if (_listening) {
      await _stop();
    } else {
      await _start();
    }
  }

  Future<void> _start() async {
    if (!await _recorder.hasPermission()) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Microphone permission is required.'), backgroundColor: AppColors.destructive),
        );
      }
      return;
    }
    // Start a throwaway recording purely to get amplitude readings — the
    // audio itself isn't saved/used.
    await _recorder.start(const RecordConfig(), path: '');
    setState(() => _listening = true);
    _ampSub = _recorder
        .onAmplitudeChanged(const Duration(milliseconds: 200))
        .listen((amp) {
      setState(() => _currentDb = amp.current);
      if (amp.current > _threshold) {
        _loudStreak++;
        if (_loudStreak >= _requiredStreak) {
          _loudStreak = 0;
          _onDetected();
        }
      } else {
        _loudStreak = 0;
      }
    });
  }

  Future<void> _stop() async {
    await _ampSub?.cancel();
    await _recorder.stop();
    setState(() {
      _listening = false;
      _loudStreak = 0;
    });
  }

  void _onDetected() {
    final now = DateTime.now();
    if (_lastTrigger != null && now.difference(_lastTrigger!) < const Duration(seconds: 5)) return;
    _lastTrigger = now;
    ActivityLogService.instance.log(ActivityType.other, 'Loud sound detected',
        detail: 'Scream/shout detection triggered an alert.');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Loud sound detected — logged to Activity History.'), backgroundColor: AppColors.warning600),
      );
    }
  }

  @override
  void dispose() {
    _ampSub?.cancel();
    _recorder.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final level = ((_currentDb + 60) / 60).clamp(0.0, 1.0); // rough -60..0dB -> 0..1

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
                    Icon(Icons.hearing_rounded, color: AppColors.emergency600),
                    SizedBox(width: 10),
                    Text('Scream Detection', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Listens for a sudden loud sound spike and logs an alert. A simple volume-based '
                  'detector, not true scream recognition — it will also trigger on other loud noises.',
                  style: TextStyle(color: AppColors.mutedForeground, fontSize: 13),
                ),
                const SizedBox(height: 20),
                ClipRRect(
                  borderRadius: BorderRadius.circular(AppRadius.pill),
                  child: LinearProgressIndicator(
                    value: _listening ? level : 0,
                    minHeight: 14,
                    backgroundColor: AppColors.secondary,
                    color: level > 0.7 ? AppColors.emergency600 : AppColors.safe600,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _toggle,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _listening ? AppColors.mutedForeground : AppColors.emergency600,
                    ),
                    icon: Icon(_listening ? Icons.stop_rounded : Icons.mic_rounded),
                    label: Text(_listening ? 'Stop Listening' : 'Start Listening'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
