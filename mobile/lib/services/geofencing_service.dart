import 'dart:async';
import 'package:geolocator/geolocator.dart' hide ActivityType;
import '../core/supabase_client.dart';
import '../models/activity_entry.dart';
import '../models/safe_zone.dart';
import 'activity_log_service.dart';

const _zoneTypeToDb = {ZoneType.safe: 'safe', ZoneType.unsafe: 'unsafe', ZoneType.other: 'other'};
ZoneType _zoneTypeFromDb(String? s) => switch (s) {
      'unsafe' => ZoneType.unsafe,
      'safe' => ZoneType.safe,
      _ => ZoneType.other,
    };

class ZoneAlert {
  final String zoneId;
  final String zoneName;
  final ZoneType zoneType;
  final double distanceMeters;
  final String message;

  const ZoneAlert({
    required this.zoneId,
    required this.zoneName,
    required this.zoneType,
    required this.distanceMeters,
    required this.message,
  });
}

/// Wired to the real `safe_zones` table. Zones are fetched once via
/// `loadZones()` (call this from a screen's initState — SafeZonesScreen,
/// LocationTrackerScreen, and SafeZoneManagerScreen all do) and cached
/// locally for fast per-position distance checks; `addZone`/`removeZone`
/// write through to Supabase immediately.
class GeofencingService {
  GeofencingService._();
  static final GeofencingService instance = GeofencingService._();

  List<SafeZone> _zones = [];
  bool _loaded = false;

  List<SafeZone> get debugZones => List.unmodifiable(_zones);

  SafeZone _fromRow(Map<String, dynamic> row) {
    return SafeZone(
      id: row['id'] as String,
      name: row['name'] as String,
      zoneType: _zoneTypeFromDb(row['zone_type'] as String?),
      lat: (row['center_lat'] as num).toDouble(),
      lng: (row['center_lng'] as num).toDouble(),
      radiusMeters: (row['radius_meters'] as num).toDouble(),
    );
  }

  Future<void> loadZones({bool force = false}) async {
    if (_loaded && !force) return;
    final rows = await supabase.from('safe_zones').select().eq('is_active', true);
    _zones = (rows as List).map((r) => _fromRow(r as Map<String, dynamic>)).toList();
    _loaded = true;
    _controller.add(null);
  }

  Future<void> addZone({
    required String name,
    required ZoneType type,
    required double lat,
    required double lng,
    required double radiusMeters,
  }) async {
    final userId = supabase.auth.currentUser?.id;
    final row = await supabase
        .from('safe_zones')
        .insert({
          'name': name,
          'zone_type': _zoneTypeToDb[type],
          'center_lat': lat,
          'center_lng': lng,
          'radius_meters': radiusMeters,
          'created_by': userId,
          'is_active': true,
        })
        .select()
        .single();
    _zones.add(_fromRow(row));
    _controller.add(null);
  }

  Future<void> removeZone(String id) async {
    await supabase.from('safe_zones').delete().eq('id', id);
    _zones.removeWhere((z) => z.id == id);
    _occupiedZoneIds.remove(id);
    _controller.add(null);
  }

  bool isTracking = false;
  final List<ZoneAlert> activeAlerts = [];
  final Set<String> _occupiedZoneIds = {};

  StreamSubscription<Position>? _positionSub;
  final _controller = StreamController<void>.broadcast();
  Stream<void> get onChange => _controller.stream;

  Future<bool> start() async {
    await loadZones();

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever ||
        !await Geolocator.isLocationServiceEnabled()) {
      return false;
    }

    isTracking = true;
    _controller.add(null);

    _positionSub?.cancel();
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, distanceFilter: 10),
    ).listen((pos) => _evaluate(pos.latitude, pos.longitude));

    return true;
  }

  void stop() {
    isTracking = false;
    _positionSub?.cancel();
    _positionSub = null;
    _controller.add(null);
  }

  void clearAlerts() {
    activeAlerts.clear();
    _controller.add(null);
  }

  void _evaluate(double lat, double lng) {
    for (final zone in _zones) {
      final distance = Geolocator.distanceBetween(lat, lng, zone.lat, zone.lng);
      final isInside = distance <= zone.radiusMeters;
      final wasInside = _occupiedZoneIds.contains(zone.id);

      if (isInside && !wasInside) {
        _occupiedZoneIds.add(zone.id);
        final message = switch (zone.zoneType) {
          ZoneType.unsafe => 'Warning: you are entering a high-risk area. Please stay alert.',
          ZoneType.safe => 'You have entered a designated safe zone.',
          ZoneType.other => 'Location alert for: ${zone.name}',
        };
        activeAlerts.insert(
          0,
          ZoneAlert(zoneId: zone.id, zoneName: zone.name, zoneType: zone.zoneType, distanceMeters: distance, message: message),
        );
        _controller.add(null);
        ActivityLogService.instance.log(ActivityType.zoneAlert, zone.name, detail: message);
      } else if (!isInside && wasInside) {
        _occupiedZoneIds.remove(zone.id);
      }
    }
  }

  void dispose() {
    _positionSub?.cancel();
    _controller.close();
  }
}
