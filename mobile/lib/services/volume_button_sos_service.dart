import 'dart:async';
import 'package:flutter/services.dart';

/// Listens for a native "tripleVolumePress" event sent from Android's
/// MainActivity (see android_native_snippets/MainActivity.kt), which
/// overrides dispatchKeyEvent to detect 3x volume-up (or volume-down)
/// presses within a short window.
///
/// LIMITATION (be upfront with users/testers about this): Android does not
/// deliver hardware key events to apps that aren't in the foreground with
/// window focus — there is no public API for a background/lock-screen
/// global key listener without a device-owner/accessibility-service
/// escalation. So this trigger works reliably while SafeGuard is open or
/// resumed, which matches how most non-OEM personal-safety apps implement
/// "quick button" SOS. If you need true background/lock-screen triggering,
/// the practical options are a persistent accessibility service (extra
/// Play Store review scrutiny) or a home-screen widget / notification
/// quick-action instead.
class VolumeButtonSosService {
  VolumeButtonSosService._();
  static final VolumeButtonSosService instance = VolumeButtonSosService._();

  static const _channel = MethodChannel('safeguard/volume_sos');
  final _controller = StreamController<void>.broadcast();

  Stream<void> get onTriplePress => _controller.stream;
  bool _initialized = false;

  void init() {
    if (_initialized) return;
    _initialized = true;
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'tripleVolumePress') {
        _controller.add(null);
      }
    });
  }

  void dispose() {
    _controller.close();
  }

  /// Asks the native side whether this launch/resume was triggered by the
  /// lock-screen accessibility service (see SosAccessibilityService.kt).
  /// Pull-based on purpose — avoids any race between native invokeMethod
  /// timing and Dart's listener being attached yet.
  Future<bool> checkPendingAutoSosLaunch() async {
    try {
      final result = await _channel.invokeMethod<bool>('checkAutoSosLaunch');
      return result ?? false;
    } catch (_) {
      return false;
    }
  }
}
