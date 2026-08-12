import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/navigation_items.dart';
import '../core/theme.dart';
import '../state/app_state.dart';
import '../widgets/app_shell.dart';
import '../widgets/core_features_grid.dart';
import 'admin/admin_home_screen.dart';
import 'content_router.dart';
import 'govt/government_home_screen.dart';

/// Ported from src/pages/Index.tsx — top-level authenticated shell that
/// switches between the dashboard home (CoreFeatures grid, role-specific)
/// and every other feature screen via ContentRouter.
class HomeShell extends StatelessWidget {
  const HomeShell({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, _) {
        final navItems = navItemsForRole(appState.role);
        final isHome = appState.activeTab == 'home';

        return AppShell(
          navItems: navItems,
          activeTab: appState.activeTab,
          onTabChange: appState.setTab,
          title: 'SafeGuard',
          actions: [
            IconButton(
              icon: const Icon(Icons.person_rounded),
              onPressed: () => appState.setTab('account-settings'),
            ),
          ],
          body: isHome
              ? (appState.role == UserRole.admin
                  ? AdminHomeScreen(onNavigate: appState.setTab)
                  : appState.role == UserRole.govtAdmin
                      ? GovernmentHomeScreen(onNavigate: appState.setTab)
                      : _HomeDashboard(role: appState.role, onSelect: appState.setTab))
              : ContentRouter(activeTab: appState.activeTab, userRole: appState.role),
        );
      },
    );
  }
}

class _HomeDashboard extends StatelessWidget {
  final UserRole role;
  final ValueChanged<String> onSelect;

  const _HomeDashboard({required this.role, required this.onSelect});

  String get _roleLabel => switch (role) {
        UserRole.admin => 'Admin Dashboard',
        UserRole.govtAdmin => 'Government Dashboard',
        UserRole.user => 'Welcome to SafeGuard',
      };

  String get _roleSubtitle => switch (role) {
        UserRole.admin => 'Platform oversight & moderation',
        UserRole.govtAdmin => 'Incident review & safe zone management',
        UserRole.user => 'Your personal safety dashboard',
      };

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_roleLabel,
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.foreground)),
          const SizedBox(height: 4),
          Text(_roleSubtitle, style: const TextStyle(fontSize: 15, color: AppColors.mutedForeground)),
          const SizedBox(height: 24),
          if (role == UserRole.user) _SosQuickAccess(onTap: () => onSelect('sos')),
          if (role == UserRole.user) const SizedBox(height: 24),
          CoreFeaturesGrid(items: homeFeaturesForRole(role), onSelect: onSelect),
        ],
      ),
    );
  }
}

/// Ported from the prominent SOS entry point on the user home dashboard —
/// full-width red banner button rather than a small grid tile, since it's
/// the app's primary action.
class _SosQuickAccess extends StatelessWidget {
  final VoidCallback onTap;
  const _SosQuickAccess({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [AppColors.emergency600, AppColors.emergency700],
          ),
          borderRadius: BorderRadius.circular(AppRadius.panel),
          boxShadow: [
            BoxShadow(color: AppColors.emergency600.withValues(alpha: 0.35), blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: const Row(
          children: [
            Icon(Icons.emergency_rounded, color: Colors.white, size: 32),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Emergency SOS',
                      style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 2),
                  Text('Tap, triple-press volume, or shake to alert your contacts',
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: Colors.white70),
          ],
        ),
      ),
    );
  }
}
