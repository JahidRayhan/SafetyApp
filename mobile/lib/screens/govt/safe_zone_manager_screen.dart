import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/theme.dart';
import '../../models/safe_zone.dart';
import '../../services/geofencing_service.dart';

/// Ported from SafeZoneMapPicker.tsx: tap the map to drop a pin, name the
/// zone, choose safe/unsafe, set a radius, and save — fully functional
/// against GeofencingService (which LocationTracker/SafeZonesScreen both
/// read from), so zones created here immediately show up for users.
class SafeZoneManagerScreen extends StatefulWidget {
  const SafeZoneManagerScreen({super.key});

  @override
  State<SafeZoneManagerScreen> createState() => _SafeZoneManagerScreenState();
}

class _SafeZoneManagerScreenState extends State<SafeZoneManagerScreen> {
  LatLng? _pending;
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
        const Text('Manage Safe Zones', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        const Text('Tap the map to place a new zone.', style: TextStyle(color: AppColors.mutedForeground)),
        const SizedBox(height: 12),
        Card(
          clipBehavior: Clip.antiAlias,
          child: SizedBox(
            height: 260,
            child: FlutterMap(
              options: MapOptions(
                initialCenter: center,
                initialZoom: 13,
                onTap: (tapPos, point) => setState(() => _pending = point),
              ),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.yourcompany.safeguard',
                ),
                MarkerLayer(
                  markers: [
                    ...zones.map((z) => Marker(
                          point: LatLng(z.lat, z.lng),
                          width: 32,
                          height: 32,
                          child: Icon(Icons.shield_rounded,
                              color: z.zoneType == ZoneType.safe ? AppColors.safe600 : AppColors.emergency600, size: 28),
                        )),
                    if (_pending != null)
                      Marker(
                        point: _pending!,
                        width: 32,
                        height: 32,
                        child: const Icon(Icons.add_location_alt_rounded, color: Colors.blue, size: 30),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ),
        if (_pending != null) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: _NewZoneForm(
                point: _pending!,
                onSaved: () => setState(() => _pending = null),
                onCancel: () => setState(() => _pending = null),
              ),
            ),
          ),
        ],
        const SizedBox(height: 16),
        const Text('Existing Zones', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        for (final z in zones)
          Card(
            margin: const EdgeInsets.only(bottom: 8),
            child: ListTile(
              leading: Icon(
                z.zoneType == ZoneType.safe ? Icons.shield_rounded : Icons.warning_rounded,
                color: z.zoneType == ZoneType.safe ? AppColors.safe600 : AppColors.emergency600,
              ),
              title: Text(z.name),
              subtitle: Text('${z.zoneType == ZoneType.safe ? 'Safe' : 'Higher-risk'} · ${z.radiusMeters.round()}m radius'),
              trailing: IconButton(
                icon: const Icon(Icons.delete_outline_rounded, color: AppColors.destructive),
                onPressed: () async {
                  await GeofencingService.instance.removeZone(z.id);
                  if (mounted) setState(() {});
                },
              ),
            ),
          ),
      ],
    );
  }
}

class _NewZoneForm extends StatefulWidget {
  final LatLng point;
  final VoidCallback onSaved;
  final VoidCallback onCancel;
  const _NewZoneForm({required this.point, required this.onSaved, required this.onCancel});

  @override
  State<_NewZoneForm> createState() => _NewZoneFormState();
}

class _NewZoneFormState extends State<_NewZoneForm> {
  final _nameController = TextEditingController();
  ZoneType _type = ZoneType.safe;
  double _radius = 300;

  Future<void> _save() async {
    if (_nameController.text.trim().isEmpty) return;
    await GeofencingService.instance.addZone(
      name: _nameController.text.trim(),
      type: _type,
      lat: widget.point.latitude,
      lng: widget.point.longitude,
      radiusMeters: _radius,
    );
    widget.onSaved();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('New zone at ${widget.point.latitude.toStringAsFixed(4)}, ${widget.point.longitude.toStringAsFixed(4)}',
            style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
        const SizedBox(height: 10),
        TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Zone name')),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: ChoiceChip(
                label: const Text('Safe'),
                selected: _type == ZoneType.safe,
                onSelected: (_) => setState(() => _type = ZoneType.safe),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: ChoiceChip(
                label: const Text('Higher-risk'),
                selected: _type == ZoneType.unsafe,
                onSelected: (_) => setState(() => _type = ZoneType.unsafe),
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text('Radius: ${_radius.round()}m', style: const TextStyle(fontSize: 12, color: AppColors.mutedForeground)),
        Slider(value: _radius, min: 50, max: 1000, divisions: 19, onChanged: (v) => setState(() => _radius = v)),
        Row(
          children: [
            Expanded(child: OutlinedButton(onPressed: widget.onCancel, child: const Text('Cancel'))),
            const SizedBox(width: 8),
            Expanded(child: ElevatedButton(onPressed: _save, child: const Text('Save Zone'))),
          ],
        ),
      ],
    );
  }
}
