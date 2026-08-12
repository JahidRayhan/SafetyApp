import 'package:flutter/material.dart';
import '../state/app_state.dart';

class NavItem {
  final String id;
  final String label;
  final IconData icon;
  const NavItem(this.id, this.label, this.icon);
}

/// Ported from src/components/navigation/NavigationItems.tsx — keep this list
/// in sync with the web app whenever navigation changes there.
List<NavItem> navItemsForRole(UserRole role) {
  switch (role) {
    case UserRole.user:
      return const [
        NavItem('home', 'Home', Icons.home_rounded),
        NavItem('incident-report', 'Report', Icons.description_rounded),
        NavItem('chatbot', 'Chatbot', Icons.chat_bubble_rounded),
        NavItem('community', 'Community', Icons.groups_rounded),
      ];
    case UserRole.admin:
      return const [
        NavItem('home', 'Home', Icons.home_rounded),
        NavItem('user-info', 'User Info', Icons.verified_user_rounded),
        NavItem('settings', 'Settings', Icons.shield_rounded),
      ];
    case UserRole.govtAdmin:
      return const [
        NavItem('home', 'Home', Icons.home_rounded),
        NavItem('incident-report', 'Report', Icons.description_rounded),
        NavItem('review-requests', 'Review Requests', Icons.fact_check_rounded),
        NavItem('safezones', 'Manage Zones', Icons.shield_rounded),
      ];
  }
}

/// Full feature set reachable from the Home dashboard grid (CoreFeatures.tsx),
/// beyond what's in the top/bottom nav bar.
List<NavItem> homeFeaturesForRole(UserRole role) {
  if (role == UserRole.user) {
    return const [
      NavItem('sos', 'Emergency SOS', Icons.emergency_rounded),
      NavItem('location', 'Location Sharing', Icons.location_on_rounded),
      NavItem('location-tracking', 'Location Tracking', Icons.my_location_rounded),
      NavItem('contacts', 'Emergency Contacts', Icons.contacts_rounded),
      NavItem('recording', 'Evidence Recording', Icons.mic_rounded),
      NavItem('incident-report', 'Report Incident', Icons.report_rounded),
      NavItem('fakecall', 'Fake Call', Icons.phone_in_talk_rounded),
      NavItem('safezones', 'Safe Zones', Icons.shield_rounded),
      NavItem('chatbot', 'Chatbot Support', Icons.support_agent_rounded),
      NavItem('resources', 'Safety Resources', Icons.menu_book_rounded),
      NavItem('activity', 'Activity History', Icons.history_rounded),
      NavItem('alerts', 'Alerts', Icons.notifications_active_rounded),
      NavItem('community', 'Community', Icons.groups_rounded),
      NavItem('journal', 'Anonymous Journal', Icons.book_rounded),
      NavItem('meditation', 'Meditation', Icons.self_improvement_rounded),
      NavItem('emotional-support', 'Emotional Support', Icons.favorite_rounded),
      NavItem('voice-commands', 'Voice Commands', Icons.mic_none_rounded),
      NavItem('scream-detection', 'Scream Detection', Icons.hearing_rounded),
      NavItem('settings', 'Settings', Icons.settings_rounded),
    ];
  }
  if (role == UserRole.admin) {
    return const [
      NavItem('user-info', 'User Info', Icons.verified_user_rounded),
      NavItem('admin-requests', 'Admin Requests', Icons.inbox_rounded),
      NavItem('admin-approvals', 'Pending Approvals', Icons.fact_check_rounded),
      NavItem('activity-monitoring', 'Activity Monitoring', Icons.monitor_heart_rounded),
      NavItem('community-management', 'Community Management', Icons.groups_2_rounded),
      NavItem('alerts', 'SOS Alerts', Icons.notifications_active_rounded),
      NavItem('meditation-management', 'Meditation Management', Icons.self_improvement_rounded),
      NavItem('emotional-support-management', 'Emotional Support Management', Icons.favorite_rounded),
      NavItem('settings', 'Settings', Icons.settings_rounded),
    ];
  }
  // govt_admin
  return const [
    NavItem('incident-report', 'Report Incident', Icons.report_rounded),
    NavItem('review-requests', 'Review Requests', Icons.fact_check_rounded),
    NavItem('safezones', 'Manage Safe Zones', Icons.shield_rounded),
    NavItem('govt-requests', 'Government Requests', Icons.account_balance_rounded),
    NavItem('activity-log', 'Activity Log', Icons.history_edu_rounded),
    NavItem('user-info', 'User Info', Icons.verified_user_rounded),
    NavItem('community', 'Community Oversight', Icons.groups_rounded),
    NavItem('chatbot', 'AI Assistant', Icons.support_agent_rounded),
  ];
}
