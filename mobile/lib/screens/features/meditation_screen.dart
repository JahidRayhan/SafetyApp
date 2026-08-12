import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../services/wellness_content_service.dart';

class _Session {
  final String title;
  final String description;
  final int minutes;
  const _Session(this.title, this.description, this.minutes);
}

/// Ported from MeditationSessions.tsx. The original likely streams audio
/// tracks — no audio assets are available here, so this is a genuinely
/// functional guided-breathing timer (4-4-4-4 box breathing) instead of a
/// fake progress bar, which needs no external assets at all.
class MeditationScreen extends StatefulWidget {
  const MeditationScreen({super.key});

  @override
  State<MeditationScreen> createState() => _MeditationScreenState();
}

class _MeditationScreenState extends State<MeditationScreen> {
  List<_Session> get _sessions => WellnessContentService.instance.sessions
      .map((s) => _Session(s.title, s.description, s.minutes))
      .toList();

  _Session? _active;

  void _start(_Session s) => setState(() => _active = s);
  void _stop() => setState(() => _active = null);

  @override
  Widget build(BuildContext context) {
    if (_active != null) {
      return _BreathingTimer(session: _active!, onDone: _stop, onCancel: _stop);
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Meditation Sessions', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Short guided breathing exercises to help you feel calmer.',
            style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 16),
        for (final s in _sessions)
          Card(
            margin: const EdgeInsets.only(bottom: 10),
            child: ListTile(
              leading: const Icon(Icons.self_improvement_rounded, color: Colors.blue),
              title: Text(s.title),
              subtitle: Text('${s.description}\n${s.minutes} min'),
              isThreeLine: true,
              trailing: IconButton.filled(icon: const Icon(Icons.play_arrow_rounded), onPressed: () => _start(s)),
            ),
          ),
      ],
    );
  }
}

class _BreathingTimer extends StatefulWidget {
  final _Session session;
  final VoidCallback onDone;
  final VoidCallback onCancel;
  const _BreathingTimer({required this.session, required this.onDone, required this.onCancel});

  @override
  State<_BreathingTimer> createState() => _BreathingTimerState();
}

class _BreathingTimerState extends State<_BreathingTimer> with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  Timer? _sessionTimer;
  int _secondsLeft = 0;
  static const _phases = ['Breathe in', 'Hold', 'Breathe out', 'Hold'];
  int _phaseIndex = 0;

  @override
  void initState() {
    super.initState();
    _secondsLeft = widget.session.minutes * 60;
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 4))
      ..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          setState(() => _phaseIndex = (_phaseIndex + 1) % _phases.length);
          _controller.forward(from: 0);
        }
      })
      ..forward();
    _sessionTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) {
        t.cancel();
        widget.onDone();
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _sessionTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isInhale = _phaseIndex == 0;
    final isExhale = _phaseIndex == 2;
    final scale = isInhale
        ? 0.6 + (_controller.value * 0.4)
        : isExhale
            ? 1.0 - (_controller.value * 0.4)
            : (_phaseIndex == 1 ? 1.0 : 0.6);

    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(widget.session.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 30),
          AnimatedBuilder(
            animation: _controller,
            builder: (context, child) => Transform.scale(
              scale: scale,
              child: Container(
                width: 160,
                height: 160,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.blue.withValues(alpha: 0.15),
                  border: Border.all(color: Colors.blue, width: 2),
                ),
              ),
            ),
          ),
          const SizedBox(height: 30),
          Text(_phases[_phaseIndex], style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
          const SizedBox(height: 12),
          Text('${(_secondsLeft ~/ 60).toString().padLeft(2, '0')}:${(_secondsLeft % 60).toString().padLeft(2, '0')} remaining',
              style: const TextStyle(color: AppColors.mutedForeground)),
          const SizedBox(height: 30),
          OutlinedButton(onPressed: widget.onCancel, child: const Text('End Session')),
        ],
      ),
    );
  }
}
