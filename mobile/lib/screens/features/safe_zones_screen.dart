import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme.dart';
import '../../models/safe_zone.dart';
import '../../services/geofencing_service.dart';

/// Read-only map + list of known safe/danger zones, for regular users.
/// Zones are fetched from Supabase via GeofencingService.loadZones().
class SafeZonesScreen extends StatefulWidget {
  const SafeZonesScreen({super.key});

  @override
  State<SafeZonesScreen> createState() => _SafeZonesScreenState();
}

class _SafeZonesScreenState extends State<SafeZonesScreen> {
  StreamSubscription<void>? _sub;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _sub = GeofencingService.instance.onChange.listen((_) {
      if (mounted) setState(() {});
    });
    GeofencingService.instance.loadZones().then((_) {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: CircularProgressIndicator());

    final zones = GeofencingService.instance.debugZones;
    final center = zones.isNotEmpty ? LatLng(zones.first.lat, zones.first.lng) : const LatLng(23.7808, 90.2792);

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          clipBehavior: Clip.antiAlias,
          child: SizedBox(
            height: 240,
            child: FlutterMap(
              options: MapOptions(initialCenter: center, initialZoom: 13),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yourcompany.safeguard',
                ),
                MarkerLayer(
                  markers: zones
                      .map((z) => Marker(
                            point: LatLng(z.lat, z.lng),
                            width: 36,
                            height: 36,
                            child: Icon(
                              Icons.shield_rounded,
                              color: z.zoneType == ZoneType.safe ? AppColors.safe600 : AppColors.emergency600,
                              size: 32,
                            ),
                          ))
                      .toList(),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),
        const Text('Safe Zones', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Areas flagged as safe or higher-risk near you.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 12),
        if (zones.isEmpty)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 24),
            child: Text('No zones have been defined yet.', style: TextStyle(color: AppColors.mutedForeground)),
          )
        else
          for (final z in zones) _ZoneTile(zone: z),
      ],
    );
  }
}

class _ZoneTile extends StatelessWidget {
  final SafeZone zone;
  const _ZoneTile({required this.zone});

  @override
  Widget build(BuildContext context) {
    final isSafe = zone.zoneType == ZoneType.safe;
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: ListTile(
        leading: Icon(isSafe ? Icons.shield_rounded : Icons.warning_rounded,
            color: isSafe ? AppColors.safe600 : AppColors.emergency600),
        title: Text(zone.name),
        subtitle: Text('${isSafe ? 'Safe zone' : 'Higher-risk zone'} · ${zone.radiusMeters.round()}m radius'),
      ),
    );
  }
}
