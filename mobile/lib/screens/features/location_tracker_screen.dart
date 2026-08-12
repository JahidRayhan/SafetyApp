import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/theme.dart';
import '../../models/safe_zone.dart';
import '../../services/geofencing_service.dart';

/// Ported from src/components/LocationTracker.tsx: Start/Stop Tracking
/// toggle, "tracking active" indicator, and a live list of zone-entry
/// alerts (danger/safe/other), color-coded exactly like the original.
class LocationTrackerScreen extends StatefulWidget {
  const LocationTrackerScreen({super.key});

  @override
  State<LocationTrackerScreen> createState() => _LocationTrackerScreenState();
}

class _LocationTrackerScreenState extends State<LocationTrackerScreen> {
  final _service = GeofencingService.instance;
  StreamSubscription<void>? _sub;

  @override
  void initState() {
    super.initState();
    _sub = _service.onChange.listen((_) {
      if (mounted) setState(() {});
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  Future<void> _toggleTracking() async {
    if (_service.isTracking) {
      _service.stop();
      return;
    }
    final ok = await _service.start();
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not start tracking — check location permission.'),
          backgroundColor: AppColors.destructive,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final alerts = _service.activeAlerts;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.my_location_rounded, color: Colors.blue),
                        SizedBox(width: 10),
                        Text('Location Tracking', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      ],
                    ),
                    ElevatedButton(
                      onPressed: _toggleTracking,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _service.isTracking ? AppColors.safe600 : AppColors.secondary,
                        foregroundColor: _service.isTracking ? Colors.white : AppColors.foreground,
                      ),
                      child: Text(_service.isTracking ? 'Stop Tracking' : 'Start Tracking'),
                    ),
                  ],
                ),
                if (_service.isTracking) ...[
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _PulsingDot(),
                      const SizedBox(width: 8),
                      const Text('Location tracking active',
                          style: TextStyle(color: AppColors.safe600, fontSize: 13)),
                    ],
                  ),
                ],
                if (alerts.isNotEmpty) ...[
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Active Zone Alerts', style: TextStyle(fontWeight: FontWeight.w600)),
                      TextButton(onPressed: _service.clearAlerts, child: const Text('Clear All')),
                    ],
                  ),
                  const SizedBox(height: 8),
                  for (final alert in alerts) _ZoneAlertTile(alert: alert),
                ],
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.06),
                    border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: const Text(
                    'Location tracking helps you receive alerts when entering safe or danger zones. '
                    'Your location data is encrypted and only shared with your emergency contacts when needed.',
                    style: TextStyle(color: Colors.blue, fontSize: 13, height: 1.4),
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

class _ZoneAlertTile extends StatelessWidget {
  final ZoneAlert alert;
  const _ZoneAlertTile({required this.alert});

  @override
  Widget build(BuildContext context) {
    final (bg, border, icon, iconColor) = switch (alert.zoneType) {
      ZoneType.unsafe => (AppColors.emergency50, AppColors.emergency200, Icons.warning_rounded, AppColors.emergency600),
      ZoneType.safe => (AppColors.safe50, AppColors.safe200, Icons.shield_rounded, AppColors.safe600),
      ZoneType.other => (AppColors.warning50, AppColors.warning200, Icons.info_rounded, AppColors.warning600),
    };

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        border: Border.all(color: border),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(alert.zoneName, style: const TextStyle(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(alert.message, style: const TextStyle(fontSize: 13, color: AppColors.mutedForeground)),
                const SizedBox(height: 2),
                Text('Distance: ${alert.distanceMeters.round()}m',
                    style: const TextStyle(fontSize: 11, color: AppColors.mutedForeground)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _PulsingDot extends StatefulWidget {
  @override
  State<_PulsingDot> createState() => _PulsingDotState();
}

class _PulsingDotState extends State<_PulsingDot> with SingleTickerProviderStateMixin {
  late final _controller = AnimationController(vsync: this, duration: const Duration(seconds: 1))
    ..repeat(reverse: true);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween(begin: 0.4, end: 1.0).animate(_controller),
      child: Container(
        width: 8,
        height: 8,
        decoration: const BoxDecoration(color: AppColors.safe500, shape: BoxShape.circle),
      ),
    );
  }
}
