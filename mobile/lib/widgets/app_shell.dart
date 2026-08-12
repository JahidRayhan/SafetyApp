import 'package:flutter/material.dart';
import '../core/navigation_items.dart';
import '../core/theme.dart';

/// Ported from TopNavigation.tsx + NavigationItems.tsx (`hidden lg:flex` for
/// desktop tabs) and MobileMenu.tsx (hamburger/bottom nav on small screens).
/// Since this is primarily a phone app, the bottom-nav-bar branch is what
/// most users see; the top-tab-bar branch keeps parity for tablet/desktop
/// (e.g. Android tablets, or a future web build from the same codebase).
class AppShell extends StatelessWidget {
  final List<NavItem> navItems;
  final String activeTab;
  final ValueChanged<String> onTabChange;
  final Widget body;
  final String title;
  final List<Widget>? actions;

  const AppShell({
    super.key,
    required this.navItems,
    required this.activeTab,
    required this.onTabChange,
    required this.body,
    this.title = 'SafeGuard',
    this.actions,
  });

  static const double _desktopBreakpoint = 1024; // matches Tailwind `lg`

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= _desktopBreakpoint;

    if (isWide) {
      return Scaffold(
        appBar: AppBar(
          title: Text(title),
          actions: [
            ...navItems.map(
              (item) => _DesktopTab(
                item: item,
                selected: item.id == activeTab,
                onTap: () => onTabChange(item.id),
              ),
            ),
            const SizedBox(width: 12),
            ...?actions,
          ],
        ),
        body: body,
      );
    }

    return Scaffold(
      appBar: AppBar(title: Text(title), actions: actions),
      body: body,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navItems.indexWhere((i) => i.id == activeTab).clamp(0, navItems.length - 1),
        onDestinationSelected: (index) => onTabChange(navItems[index].id),
        destinations: navItems
            .map((item) => NavigationDestination(icon: Icon(item.icon), label: item.label))
            .toList(),
      ),
    );
  }
}

class _DesktopTab extends StatelessWidget {
  final NavItem item;
  final bool selected;
  final VoidCallback onTap;

  const _DesktopTab({required this.item, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: TextButton.icon(
        onPressed: onTap,
        style: TextButton.styleFrom(
          backgroundColor: selected ? AppColors.emergency100 : Colors.transparent,
          foregroundColor: selected ? AppColors.emergency700 : AppColors.mutedForeground,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.md)),
        ),
        icon: Icon(item.icon, size: 18),
        label: Text(item.label),
      ),
    );
  }
}
