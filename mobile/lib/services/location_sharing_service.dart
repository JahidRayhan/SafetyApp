import 'dart:async';
import 'package:geolocator/geolocator.dart';

class LatLngAccuracy {
  final double lat;
  final double lng;
  final double? accuracy;
  const LatLngAccuracy({required this.lat, required this.lng, this.accuracy});
}

/// Ported from src/hooks/useLiveLocationSharing.ts. Real device location via
/// `geolocator`; the "notify contacts by email on >50m movement" part is
/// server-side in the original app (Supabase function) — that's flagged
/// below as a TODO since it needs your backend wired up, but all the
/// client-side plumbing (position stream, 50 m distance filter, 60-minute
/// auto-expiry) is real and functional.
class LocationSharingService {
  LocationSharingService._();
  static final LocationSharingService instance = LocationSharingService._();

  static const Duration sessionDuration = Duration(minutes: 60);
  static const int moveThresholdMeters = 50;

  bool isSharing = false;
  DateTime? expiresAt;
  LatLngAccuracy? currentLocation;

  StreamSubscription<Position>? _positionSub;
  Timer? _expiryTimer;
  final _controller = StreamController<void>.broadcast();

  /// Fires whenever isSharing/currentLocation/expiresAt changes.
  Stream<void> get onChange => _controller.stream;

  Future<bool> _ensurePermission() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) return false;
    if (!await Geolocator.isLocationServiceEnabled()) return false;
    return permission == LocationPermission.always || permission == LocationPermission.whileInUse;
  }

  Future<LatLngAccuracy?> getCurrentLocation() async {
    if (!await _ensurePermission()) return null;
    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
    );
    currentLocation = LatLngAccuracy(lat: pos.latitude, lng: pos.longitude, accuracy: pos.accuracy);
    _controller.add(null);
    return currentLocation;
  }

  Future<bool> startSharing() async {
    if (!await _ensurePermission()) return false;
    isSharing = true;
    expiresAt = DateTime.now().add(sessionDuration);

    _positionSub?.cancel();
    _positionSub = Geolocator.getPositionStream(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: moveThresholdMeters,
      ),
    ).listen((pos) {
      currentLocation = LatLngAccuracy(lat: pos.latitude, lng: pos.longitude, accuracy: pos.accuracy);
      _controller.add(null);
      // TODO: POST updated location to your backend here so it can email
      // contacts, matching the original's server-side notify-on-move logic.
    });

    _expiryTimer?.cancel();
    _expiryTimer = Timer(sessionDuration, () => stopSharing());

    _controller.add(null);
    return true;
  }

  void stopSharing() {
    isSharing = false;
    expiresAt = null;
    _positionSub?.cancel();
    _positionSub = null;
    _expiryTimer?.cancel();
    _expiryTimer = null;
    _controller.add(null);
  }

  void dispose() {
    _positionSub?.cancel();
    _expiryTimer?.cancel();
    _controller.close();
  }
}
