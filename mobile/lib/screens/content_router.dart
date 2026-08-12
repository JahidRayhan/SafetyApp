import 'package:flutter/material.dart';
import '../state/app_state.dart';
import 'admin/activity_monitoring_screen.dart';
import 'admin/admin_approvals_screen.dart';
import 'admin/admin_requests_screen.dart';
import 'admin/community_management_screen.dart';
import 'admin/emotional_support_management_screen.dart';
import 'admin/meditation_management_screen.dart';
import 'admin/sos_alerts_panel_screen.dart';
import 'admin/user_info_screen.dart';
import 'govt/govt_data_requests_screen.dart';
import 'govt/review_requests_screen.dart';
import 'govt/safe_zone_manager_screen.dart';
import 'features/activity_history_screen.dart';
import 'features/alerts_screen.dart';
import 'features/chatbot_screen.dart';
import 'features/community_screen.dart';
import 'features/emergency_contacts_screen.dart';
import 'features/emotional_support_screen.dart';
import 'features/fake_call_screen.dart';
import 'features/feature_screen_stub.dart';
import 'features/incident_report_screen.dart';
import 'features/journal_screen.dart';
import 'features/location_sharing_screen.dart';
import 'features/location_tracker_screen.dart';
import 'features/meditation_screen.dart';
import 'features/recording_panel_screen.dart';
import 'features/resources_screen.dart';
import 'features/safe_zones_screen.dart';
import 'features/scream_detection_screen.dart';
import 'features/settings_screen.dart';
import 'features/voice_commands_screen.dart';
import 'sos/emergency_sos_screen.dart';

/// Ported from src/components/dashboard/ContentRenderer.tsx — one switch
/// statement mapping a tab id to a screen. Each `FeatureScreenStub` entry
/// still standing corresponds 1:1 to a component in the original
/// `src/components/` folder that hasn't been built out yet (admin/govt
/// panels — deliberately last per the agreed build order).
class ContentRouter extends StatelessWidget {
  final String activeTab;
  final UserRole userRole;

  const ContentRouter({super.key, required this.activeTab, required this.userRole});

  @override
  Widget build(BuildContext context) {
    switch (activeTab) {
      case 'sos':
        return const EmergencySosScreen();

      // --- Location ---
      case 'location':
        return const LocationSharingScreen();
      case 'location-tracking':
        return const LocationTrackerScreen();
      case 'safezones':
        if (userRole == UserRole.govtAdmin) {
          return const SafeZoneManagerScreen();
        }
        return const SafeZonesScreen();

      // --- Emergency tooling ---
      case 'contacts':
        return const EmergencyContactsScreen();
      case 'recording':
        return const RecordingPanelScreen();
      case 'incident-report':
        return const IncidentReportScreen();
      case 'fakecall':
        return const FakeCallScreen();
      case 'chatbot':
        return const ChatbotScreen();
      case 'resources':
      case 'safety-resources':
        return const ResourcesScreen();
      case 'activity':
        return const ActivityHistoryScreen();
      case 'activity-log':
        return const ActivityHistoryScreen();
      case 'alerts':
        if (userRole == UserRole.admin) {
          return const SosAlertsPanelScreen();
        }
        return const AlertsScreen();
      case 'community':
        return const CommunityScreen();
      case 'journal':
        return const JournalScreen();
      case 'meditation':
        return const MeditationScreen();
      case 'emotional-support':
        return const EmotionalSupportScreen();
      case 'voice-commands':
        return const VoiceCommandsScreen();
      case 'scream-detection':
        return const ScreamDetectionScreen();

      // --- Settings / account ---
      case 'settings':
      case 'account-settings':
        return const SettingsScreen();
      case 'user-info':
        return const UserInfoScreen();

      // --- Admin ---
      case 'admin-requests':
        return const AdminRequestsScreen();
      case 'admin-approvals':
        return const AdminApprovalsScreen();
      case 'activity-monitoring':
        return const ActivityMonitoringScreen();
      case 'community-management':
        return const CommunityManagementScreen();
      case 'meditation-management':
        return const MeditationManagementScreen();
      case 'emotional-support-management':
        return const EmotionalSupportManagementScreen();

      // --- Govt (deliberately last, per your priority order) ---
      case 'govt-requests':
      case 'request':
        return const GovtDataRequestsScreen();
      case 'review-requests':
        return const ReviewRequestsScreen();

      default:
        return const FeatureScreenStub(
          icon: Icons.hourglass_empty_rounded,
          title: 'Feature Coming Soon',
          description: 'This feature is under development.',
        );
    }
  }
}
