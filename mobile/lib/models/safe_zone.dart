enum ZoneType { safe, unsafe, other }

/// Mirrors the zone shape used by src/features/geofencing (safeZoneService +
/// useGeofencingStore) — id, name, type, center point, radius. Kept minimal
/// since the full Safe Zones management screen (create/edit zones on a map)
/// is built separately later; this is just the read model LocationTracker
/// needs to evaluate against.
class SafeZone {
  final String id;
  final String name;
  final ZoneType zoneType;
  final double lat;
  final double lng;
  final double radiusMeters;

  const SafeZone({
    required this.id,
    required this.name,
    required this.zoneType,
    required this.lat,
    required this.lng,
    required this.radiusMeters,
  });
}
