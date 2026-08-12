import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../core/supabase_client.dart';

enum UserRole { user, admin, govtAdmin }

UserRole roleFromString(String? value) {
  switch (value) {
    case 'admin':
      return UserRole.admin;
    case 'govt_admin':
      return UserRole.govtAdmin;
    default:
      return UserRole.user;
  }
}

/// Mirrors the React app's `Index.tsx` top-level state: auth user, profile role,
/// and which tab/feature is active. Kept deliberately simple (ChangeNotifier)
/// so it's easy to swap in riverpod/bloc later if the team prefers.
class AppState extends ChangeNotifier {
  bool loading = true; // starts true: we check for an existing Supabase session first
  bool isAuthenticated = false;
  String? userEmail;
  String? userId;
  UserRole role = UserRole.user;
  String? authError;

  String activeTab = 'home';
  bool sosActive = false;

  /// Set by the app-wide volume/shake listeners (see RootShell) and
  /// consumed by EmergencySosScreen to auto-start its countdown, so a
  /// trigger works no matter which tab the user is currently on.
  int sosTriggerToken = 0;
  void requestSosTrigger() {
    activeTab = 'sos';
    sosTriggerToken++;
    notifyListeners();
  }

  /// Call once at app startup (see main.dart). Restores an existing
  /// Supabase session if one is stored on-device, and keeps listening for
  /// auth changes (e.g. token refresh, or sign-out from another tab/device).
  Future<void> bootstrap() async {
    supabase.auth.onAuthStateChange.listen((data) {
      final session = data.session;
      if (session != null) {
        _onSignedIn(session.user);
      } else {
        isAuthenticated = false;
        userEmail = null;
        userId = null;
        notifyListeners();
      }
    });

    final existing = supabase.auth.currentSession;
    if (existing != null) {
      await _onSignedIn(existing.user);
    }
    loading = false;
    notifyListeners();
  }

  Future<void> _onSignedIn(User user) async {
    userId = user.id;
    userEmail = user.email;
    isAuthenticated = true;
    // profiles.id is the same uuid as auth.users.id in this schema.
    try {
      final row = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      role = roleFromString(row?['role'] as String?);
    } catch (_) {
      role = UserRole.user; // fail open to the least-privileged role
    }
    activeTab = 'home';
    notifyListeners();
  }

  Future<bool> signInWithPassword({required String email, required String password}) async {
    authError = null;
    loading = true;
    notifyListeners();
    try {
      final res = await supabase.auth.signInWithPassword(email: email, password: password);
      if (res.user != null) await _onSignedIn(res.user!);
      loading = false;
      notifyListeners();
      return res.user != null;
    } on AuthException catch (e) {
      authError = e.message;
      loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      authError = 'Something went wrong. Please try again.';
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> signUpWithPassword({required String email, required String password}) async {
    authError = null;
    loading = true;
    notifyListeners();
    try {
      final res = await supabase.auth.signUp(email: email, password: password);
      // If email confirmation is required, res.user exists but session is
      // null until they click the confirmation link — surface that clearly
      // rather than silently doing nothing.
      if (res.session == null && res.user != null) {
        authError = 'Check your email to confirm your account, then sign in.';
        loading = false;
        notifyListeners();
        return false;
      }
      if (res.user != null) await _onSignedIn(res.user!);
      loading = false;
      notifyListeners();
      return res.user != null;
    } on AuthException catch (e) {
      authError = e.message;
      loading = false;
      notifyListeners();
      return false;
    } catch (e) {
      authError = 'Something went wrong. Please try again.';
      loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> signOut() async {
    await supabase.auth.signOut();
    isAuthenticated = false;
    userEmail = null;
    userId = null;
    activeTab = 'home';
    notifyListeners();
  }

  void setTab(String tab) {
    activeTab = tab;
    notifyListeners();
  }

  void setSosActive(bool value) {
    sosActive = value;
    notifyListeners();
  }
}
