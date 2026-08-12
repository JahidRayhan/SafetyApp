import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme.dart';
import '../../services/location_sharing_service.dart';

/// Ported from src/components/LocationSharing.tsx: map preview, current
/// coordinates + accuracy, Start/Stop Sharing, refresh, "open in Maps", and
/// the live-sharing status banner with the auto-stop countdown.
class LocationSharingScreen extends StatefulWidget {
  const LocationSharingScreen({super.key});

  @override
  State<LocationSharingScreen> createState() => _LocationSharingScreenState();
}

class _LocationSharingScreenState extends State<LocationSharingScreen> {
  final _service = LocationSharingService.instance;
  final _mapController = MapController();
  StreamSubscription<void>? _sub;
  Timer? _tickTimer;
  bool _loadingLocation = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _sub = _service.onChange.listen((_) {
      if (mounted) setState(() {});
    });
    _tickTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (mounted) setState(() {}); // re-render the "minutes left" countdown
    });
    _refreshLocation();
  }

  @override
  void dispose() {
    _sub?.cancel();
    _tickTimer?.cancel();
    super.dispose();
  }

  Future<void> _refreshLocation() async {
    setState(() {
      _loadingLocation = true;
      _error = null;
    });
    final loc = await _service.getCurrentLocation();
    if (!mounted) return;
    setState(() => _loadingLocation = false);
    if (loc == null) {
      setState(() => _error =
          'Location permission is off, or location services are disabled. Enable them in your device settings to continue.');
    } else {
      _mapController.move(LatLng(loc.lat, loc.lng), 16);
    }
  }

  Future<void> _toggleSharing() async {
    if (_service.isSharing) {
      _service.stopSharing();
      return;
    }
    final ok = await _service.startSharing();
    if (!ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Could not start sharing — check location permission.'),
          backgroundColor: AppColors.destructive,
        ),
      );
    }
  }

  Future<void> _openInMaps() async {
    final loc = _service.currentLocation;
    if (loc == null) return;
    final uri = Uri.parse('https://www.google.com/maps?q=${loc.lat},${loc.lng}');
    if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  int? get _minutesLeft {
    final expires = _service.expiresAt;
    if (expires == null) return null;
    final diff = expires.difference(DateTime.now()).inMinutes;
    return diff < 0 ? 0 : diff;
  }

  @override
  Widget build(BuildContext context) {
    final loc = _service.currentLocation;

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
                    Icon(Icons.location_on_rounded, color: AppColors.emergency600),
                    SizedBox(width: 10),
                    Text('Live Location Sharing',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 16),
                if (_loadingLocation) ...[
                  const SizedBox(height: 24),
                  const Center(child: CircularProgressIndicator()),
                  const SizedBox(height: 8),
                  const Center(
                    child: Text('Getting your location…', style: TextStyle(color: AppColors.mutedForeground)),
                  ),
                  const SizedBox(height: 24),
                ] else if (_error != null) ...[
                  Icon(Icons.location_off_rounded, size: 48, color: AppColors.mutedForeground.withValues(alpha: 0.6)),
                  const SizedBox(height: 12),
                  Text(_error!, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.mutedForeground)),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: _refreshLocation, child: const Text('Enable Location')),
                ] else if (loc != null) ...[
                  ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.md),
                    child: SizedBox(
                      height: 220,
                      child: FlutterMap(
                        mapController: _mapController,
                        options: MapOptions(initialCenter: LatLng(loc.lat, loc.lng), initialZoom: 16),
                        children: [
                          TileLayer(
                            urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                            userAgentPackageName: 'com.yourcompany.safeguard',
                          ),
                          MarkerLayer(markers: [
                            Marker(
                              point: LatLng(loc.lat, loc.lng),
                              width: 40,
                              height: 40,
                              child: const Icon(Icons.location_on_rounded, color: AppColors.emergency600, size: 40),
                            ),
                          ]),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.secondary,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Current location',
                            style: TextStyle(color: AppColors.mutedForeground, fontSize: 13)),
                        const SizedBox(height: 4),
                        Text('Lat: ${loc.lat.toStringAsFixed(6)}',
                            style: const TextStyle(fontFamily: 'monospace')),
                        Text('Lng: ${loc.lng.toStringAsFixed(6)}',
                            style: const TextStyle(fontFamily: 'monospace')),
                        if (loc.accuracy != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text('Accuracy: ±${loc.accuracy!.round()}m',
                                style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
                          ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _toggleSharing,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _service.isSharing ? AppColors.emergency600 : AppColors.safe600,
                          ),
                          icon: Icon(_service.isSharing ? Icons.shield_rounded : Icons.share_rounded),
                          label: Text(_service.isSharing ? 'Stop Sharing' : 'Start Live Sharing'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _refreshLocation,
                        icon: const Icon(Icons.my_location_rounded),
                        tooltip: 'Refresh location',
                      ),
                      const SizedBox(width: 8),
                      IconButton.filled(
                        onPressed: _openInMaps,
                        style: IconButton.styleFrom(backgroundColor: AppColors.mutedForeground),
                        icon: const Icon(Icons.navigation_rounded),
                        tooltip: 'Open in Maps',
                      ),
                    ],
                  ),
                  if (_service.isSharing) ...[
                    const SizedBox(height: 14),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: AppColors.safe50,
                        border: Border.all(color: AppColors.safe200),
                        borderRadius: BorderRadius.circular(AppRadius.md),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              _PulsingDot(),
                              const SizedBox(width: 8),
                              const Text('Live sharing active',
                                  style: TextStyle(color: AppColors.safe700, fontWeight: FontWeight.bold)),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Updates when you move more than 50m.'
                            '${_minutesLeft != null ? ' Auto-stops in ${_minutesLeft} min.' : ''}',
                            style: const TextStyle(color: AppColors.safe600, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.groups_rounded, color: Colors.blue),
                    SizedBox(width: 10),
                    Text('How it works', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.blue.withValues(alpha: 0.06),
                    border: Border.all(color: Colors.blue.withValues(alpha: 0.2)),
                    borderRadius: BorderRadius.circular(AppRadius.md),
                  ),
                  child: const Text(
                    'Your emergency contacts receive an alert with a map preview when sharing starts, '
                    'and again whenever you move more than 50 m. Sharing stops automatically after 60 '
                    'minutes, when you cancel an SOS, or when you tap Stop Sharing.',
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
        width: 10,
        height: 10,
        decoration: const BoxDecoration(color: AppColors.safe500, shape: BoxShape.circle),
      ),
    );
  }
}
