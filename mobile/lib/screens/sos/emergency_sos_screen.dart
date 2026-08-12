import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme.dart';
import '../../models/activity_entry.dart';
import '../../services/activity_log_service.dart';
import '../../services/auto_evidence_recorder.dart';
import '../../services/emergency_incident_service.dart';
import '../../state/app_state.dart';

/// Ported from EmergencyButton.tsx + emergency/EmergencySOSButton.tsx +
/// emergency/EmergencyCountdown.tsx: big pulsing red button, hold-to-confirm
/// countdown, then "alert sent" state.
///
/// NOTE: the volume-button/shake triggers are NOT listened for here anymore
/// — they're listened for app-wide in RootShell (see
/// lib/widgets/root_shell.dart), because a user can trigger SOS from any
/// screen, not just while already looking at this one. RootShell calls
/// AppState.requestSosTrigger() on a trigger, which bumps [sosTriggerToken]
/// and switches the active tab to 'sos'; this screen watches that token and
/// auto-starts the countdown when it changes.
class EmergencySosScreen extends StatefulWidget {
  const EmergencySosScreen({super.key});

  @override
  State<EmergencySosScreen> createState() => _EmergencySosScreenState();
}

enum _SosPhase { idle, countdown, active }

class _EmergencySosScreenState extends State<EmergencySosScreen>
    with SingleTickerProviderStateMixin {
  _SosPhase _phase = _SosPhase.idle;
  int _secondsLeft = 3;
  Timer? _timer;
  int _lastSeenToken = -1;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    if (_phase != _SosPhase.idle) return;
    setState(() {
      _phase = _SosPhase.countdown;
      _secondsLeft = 3;
    });
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) {
        t.cancel();
        _activateSos();
      }
    });
  }

  void _cancelCountdown() {
    _timer?.cancel();
    setState(() => _phase = _SosPhase.idle);
  }

  void _activateSos() {
    setState(() => _phase = _SosPhase.active);
    context.read<AppState>().setSosActive(true);
    ActivityLogService.instance.log(ActivityType.sos, 'SOS alert activated',
        detail: 'Emergency contacts notified with your location.');
    AutoEvidenceRecorder.instance.start(); // fire-and-forget: silently no-ops if mic permission isn't granted

    EmergencyIncidentService.instance.triggerSos().catchError((e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('SOS is active, but contacts may not have been notified: $e'),
            backgroundColor: AppColors.warning600,
          ),
        );
      }
      return null;
    });
  }

  void _deactivateSos() {
    setState(() => _phase = _SosPhase.idle);
    context.read<AppState>().setSosActive(false);
    ActivityLogService.instance.log(ActivityType.sos, 'Marked as safe', detail: 'SOS alert resolved.');
    AutoEvidenceRecorder.instance.stopAndSave();
    EmergencyIncidentService.instance.resolve();
  }

  @override
  Widget build(BuildContext context) {
    // Pick up an external trigger (volume-button / shake) fired while this
    // screen wasn't mounted yet — see class doc comment above.
    final token = context.watch<AppState>().sosTriggerToken;
    if (_lastSeenToken == -1) {
      _lastSeenToken = token; // don't fire on first build, only on change
    } else if (token != _lastSeenToken) {
      _lastSeenToken = token;
      WidgetsBinding.instance.addPostFrameCallback((_) => _startCountdown());
    }

    return Container(
      decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildStateLabel(),
              const SizedBox(height: 32),
              _buildButton(),
              const SizedBox(height: 32),
              _buildTriggerHints(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStateLabel() {
    final text = switch (_phase) {
      _SosPhase.idle => 'Press and hold, or use a quick trigger below.',
      _SosPhase.countdown => 'Sending alert in $_secondsLeft…',
      _SosPhase.active => '🚨 Emergency alert active — contacts notified',
    };
    return Text(
      text,
      textAlign: TextAlign.center,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: _phase == _SosPhase.active ? AppColors.emergency700 : AppColors.mutedForeground,
      ),
    );
  }

  Widget _buildButton() {
    if (_phase == _SosPhase.active) {
      return _CircleButton(
        color: AppColors.safe600,
        icon: Icons.check_rounded,
        label: "I'm Safe",
        onTap: _deactivateSos,
      );
    }
    if (_phase == _SosPhase.countdown) {
      return _CircleButton(
        color: AppColors.warning500,
        icon: Icons.close_rounded,
        label: '$_secondsLeft',
        onTap: _cancelCountdown,
        pulse: true,
      );
    }
    return _CircleButton(
      color: AppColors.emergency600,
      icon: Icons.warning_rounded,
      label: 'SOS',
      onTap: _startCountdown,
      pulse: true,
    );
  }

  Widget _buildTriggerHints() {
    return Column(
      children: [
        _hintRow(Icons.volume_up_rounded, 'Android: triple-press volume button'),
        const SizedBox(height: 8),
        _hintRow(Icons.vibration_rounded, 'iOS: shake your phone'),
      ],
    );
  }

  Widget _hintRow(IconData icon, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.mutedForeground),
        const SizedBox(width: 6),
        Text(label, style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
      ],
    );
  }
}

class _CircleButton extends StatefulWidget {
  final Color color;
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool pulse;

  const _CircleButton({
    required this.color,
    required this.icon,
    required this.label,
    required this.onTap,
    this.pulse = false,
  });

  @override
  State<_CircleButton> createState() => _CircleButtonState();
}

class _CircleButtonState extends State<_CircleButton> with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 1),
  )..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final scale = widget.pulse ? 1.0 + (_controller.value * 0.05) : 1.0;
          return Transform.scale(scale: scale, child: child);
        },
        child: Container(
          width: 200,
          height: 200,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: widget.color,
            boxShadow: [
              BoxShadow(color: widget.color.withValues(alpha: 0.5), blurRadius: 40, spreadRadius: 4),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(widget.icon, color: Colors.white, size: 48),
              const SizedBox(height: 8),
              Text(
                widget.label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
