import 'package:geolocator/geolocator.dart';
import '../core/supabase_client.dart';

/// Wired to the real `emergency_incidents` table + the `send-emergency-alerts`
/// edge function (both already exist in your Supabase project — same ones
/// the original web app uses). This is the piece that actually notifies
/// emergency contacts when SOS activates.
///
/// Resend limitation to know about: on a free/sandbox Resend account
/// without a verified sending domain, Resend only delivers to the single
/// email address that owns the Resend account — it blocks sending to any
/// other recipient until you verify a domain. So right now this will only
/// actually land in that one inbox, not your real contacts' emails, no
/// matter how correctly this code runs. Verify a domain in Resend to lift
/// that limit.
class EmergencyIncidentService {
  EmergencyIncidentService._();
  static final EmergencyIncidentService instance = EmergencyIncidentService._();

  String? _activeIncidentId;

  /// Creates an incident row, then asks the edge function to email/SMS
  /// every emergency contact. Returns the incident id (or null if the user
  /// isn't signed in / something failed) so the caller can resolve it later.
  Future<String?> triggerSos() async {
    final userId = supabase.auth.currentUser?.id;
    if (userId == null) return null;

    double? lat, lng, accuracy;
    try {
      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high),
      );
      lat = pos.latitude;
      lng = pos.longitude;
      accuracy = pos.accuracy;
    } catch (_) {
      // Proceed without location rather than blocking the whole SOS flow —
      // an alert with no location is still far better than no alert.
    }

    final incidentRow = await supabase
        .from('emergency_incidents')
        .insert({
          'user_id': userId,
          'status': 'active',
          'location_lat': lat,
          'location_lng': lng,
          'location_accuracy': accuracy,
        })
        .select()
        .single();

    final incidentId = incidentRow['id'] as String;
    _activeIncidentId = incidentId;

    try {
      await supabase.functions.invoke('send-emergency-alerts', body: {
        'incident_id': incidentId,
        if (lat != null && lng != null) 'location': {'lat': lat, 'lng': lng, 'accuracy': accuracy},
        'message_type': 'both',
      });
    } catch (e) {
      // Don't let a failed notification hide the fact that the incident
      // itself WAS created — surface this to the caller so the UI can
      // show a "contacts may not have been notified" warning rather than
      // silently pretending everything worked.
      rethrow;
    }

    return incidentId;
  }

  Future<void> resolve() async {
    final id = _activeIncidentId;
    if (id == null) return;
    await supabase.from('emergency_incidents').update({
      'status': 'resolved',
      'resolved_at': DateTime.now().toIso8601String(),
    }).eq('id', id);
    _activeIncidentId = null;
  }
}
