import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';

/// Ported from FakeCallScheduler.tsx: pick a delay and a caller name, then
/// after that delay a full-screen simulated incoming call appears.
class FakeCallScreen extends StatefulWidget {
  const FakeCallScreen({super.key});

  @override
  State<FakeCallScreen> createState() => _FakeCallScreenState();
}

class _FakeCallScreenState extends State<FakeCallScreen> {
  int _delaySeconds = 10;
  String _callerName = 'Mom';
  Timer? _timer;
  int? _countdown;

  final _presetDelays = const [5, 10, 30, 60];
  final _presetCallers = const ['Mom', 'Dad', 'Boss', 'Best Friend'];

  void _schedule() {
    _timer?.cancel();
    setState(() => _countdown = _delaySeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _countdown = (_countdown ?? 1) - 1);
      if ((_countdown ?? 0) <= 0) {
        t.cancel();
        setState(() => _countdown = null);
        _showIncomingCall();
      }
    });
  }

  void _cancelSchedule() {
    _timer?.cancel();
    setState(() => _countdown = null);
  }

  void _showIncomingCall() {
    Navigator.of(context).push(
      PageRouteBuilder(
        opaque: true,
        pageBuilder: (_, __, ___) => _IncomingCallScreen(callerName: _callerName),
      ),
    );
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

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
                    Icon(Icons.phone_in_talk_rounded, color: AppColors.emergency600),
                    SizedBox(width: 10),
                    Text('Fake Call Scheduler', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  'Schedule a simulated incoming call to help you exit an uncomfortable situation.',
                  style: TextStyle(color: AppColors.mutedForeground),
                ),
                const SizedBox(height: 20),
                const Text('Caller name', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _presetCallers
                      .map((c) => ChoiceChip(
                            label: Text(c),
                            selected: _callerName == c,
                            onSelected: (_) => setState(() => _callerName = c),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 16),
                const Text('Delay before the call rings', style: TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _presetDelays
                      .map((d) => ChoiceChip(
                            label: Text('${d}s'),
                            selected: _delaySeconds == d,
                            onSelected: (_) => setState(() => _delaySeconds = d),
                          ))
                      .toList(),
                ),
                const SizedBox(height: 24),
                if (_countdown != null) ...[
                  Center(
                    child: Column(
                      children: [
                        Text('Calling in $_countdown s…',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        OutlinedButton(onPressed: _cancelSchedule, child: const Text('Cancel')),
                      ],
                    ),
                  ),
                ] else
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _schedule,
                      icon: const Icon(Icons.schedule_rounded),
                      label: Text('Schedule call from $_callerName'),
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

class _IncomingCallScreen extends StatelessWidget {
  final String callerName;
  const _IncomingCallScreen({required this.callerName});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF111827),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            children: [
              const SizedBox(height: 60),
              const Text('Incoming call', style: TextStyle(color: Colors.white70, fontSize: 16)),
              const SizedBox(height: 12),
              CircleAvatar(
                radius: 56,
                backgroundColor: Colors.white24,
                child: Text(callerName.isNotEmpty ? callerName[0] : '?',
                    style: const TextStyle(fontSize: 40, color: Colors.white)),
              ),
              const SizedBox(height: 16),
              Text(callerName, style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
              const Spacer(),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _CallActionButton(
                    icon: Icons.call_end_rounded,
                    color: AppColors.emergency600,
                    label: 'Decline',
                    onTap: () => Navigator.of(context).pop(),
                  ),
                  _CallActionButton(
                    icon: Icons.call_rounded,
                    color: AppColors.safe600,
                    label: 'Answer',
                    onTap: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _CallActionButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String label;
  final VoidCallback onTap;

  const _CallActionButton({required this.icon, required this.color, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: onTap,
          child: Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(shape: BoxShape.circle, color: color),
            child: Icon(icon, color: Colors.white, size: 28),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 13)),
      ],
    );
  }
}
