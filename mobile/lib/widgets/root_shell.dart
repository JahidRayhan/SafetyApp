import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/shake_sos_service.dart';
import '../services/volume_button_sos_service.dart';
import '../state/app_state.dart';

/// Wraps the whole authenticated app so the volume-button (Android) and
/// shake (iOS) SOS triggers work from ANY screen — not just while the user
/// happens to be looking at the SOS tab. Mount this once, high up in the
/// widget tree (see main.dart), and it lives for the lifetime of the app.
///
/// Also checks for a lock-screen/background auto-SOS launch (see
/// SosAccessibilityService.kt) on startup and every time the app resumes
/// from the background — that's the pull-based half of that flow.
class RootShell extends StatefulWidget {
  final Widget child;
  const RootShell({super.key, required this.child});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> with WidgetsBindingObserver {
  StreamSubscription<void>? _volumeSub;
  StreamSubscription<void>? _shakeSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);

    VolumeButtonSosService.instance.init();
    _volumeSub = VolumeButtonSosService.instance.onTriplePress.listen((_) => _trigger());
    ShakeSosService.instance.start();
    _shakeSub = ShakeSosService.instance.onShake.listen((_) => _trigger());

    _checkAutoSosLaunch(); // covers cold start
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _checkAutoSosLaunch(); // covers the accessibility service bringing an already-backgrounded app forward
    }
  }

  Future<void> _checkAutoSosLaunch() async {
    final wasAutoSos = await VolumeButtonSosService.instance.checkPendingAutoSosLaunch();
    if (wasAutoSos) _trigger();
  }

  void _trigger() {
    final appState = context.read<AppState>();
    if (!appState.isAuthenticated) return; // ignore triggers on landing/auth screens
    appState.requestSosTrigger();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _volumeSub?.cancel();
    _shakeSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
