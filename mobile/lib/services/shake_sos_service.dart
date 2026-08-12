import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';

/// Shake-to-trigger SOS, primarily for iOS per spec. Implemented in Dart via
/// `sensors_plus` (cross-platform accelerometer stream) rather than native
/// CoreMotion, so behavior is easy to tune/test from one place. Detects a
/// short burst of high-magnitude acceleration samples — the same technique
/// UIKit's "shake gesture" uses under the hood.
class ShakeSosService {
  ShakeSosService._();
  static final ShakeSosService instance = ShakeSosService._();

  final _controller = StreamController<void>.broadcast();
  Stream<void> get onShake => _controller.stream;

  StreamSubscription<AccelerometerEvent>? _sub;

  // Tunables
  static const double _shakeThresholdG = 2.7; // g-force delta to count as a "shake"
  static const int _minShakesInWindow = 3;
  static const Duration _window = Duration(milliseconds: 1200);
  static const Duration _cooldown = Duration(seconds: 3);

  final List<DateTime> _recentShakes = [];
  DateTime? _lastTrigger;

  /// Only enabled by default on iOS, matching the product spec (Android uses
  /// the volume-button trigger instead). Pass [force] to enable on Android
  /// too if you want both triggers available there.
  void start({bool force = false}) {
    if (!force && !Platform.isIOS) return;
    _sub ??= accelerometerEventStream(samplingPeriod: SensorInterval.gameInterval)
        .listen(_onEvent);
  }

  void stop() {
    _sub?.cancel();
    _sub = null;
    _recentShakes.clear();
  }

  void _onEvent(AccelerometerEvent event) {
    // Magnitude of acceleration, minus gravity (~9.8 m/s^2), converted to g.
    final magnitude = sqrt(event.x * event.x + event.y * event.y + event.z * event.z);
    final gForce = (magnitude - 9.8).abs() / 9.8;

    if (gForce < _shakeThresholdG) return;

    final now = DateTime.now();
    _recentShakes.add(now);
    _recentShakes.removeWhere((t) => now.difference(t) > _window);

    if (_recentShakes.length >= _minShakesInWindow) {
      if (_lastTrigger == null || now.difference(_lastTrigger!) > _cooldown) {
        _lastTrigger = now;
        _recentShakes.clear();
        _controller.add(null);
      }
    }
  }

  void dispose() {
    stop();
    _controller.close();
  }
}
