class MeditationSession {
  final String id;
  String title;
  String description;
  int minutes;
  MeditationSession({required this.id, required this.title, required this.description, required this.minutes});
}

class SupportTip {
  final String id;
  String title;
  String body;
  SupportTip({required this.id, required this.title, required this.body});
}

/// Backs both the user-facing Meditation/Emotional Support screens and
/// their admin management counterparts (MeditationManagement.tsx /
/// EmotionalSupportManagement.tsx) with the same in-memory list, so an
/// admin edit is immediately visible to users in this session.
class WellnessContentService {
  WellnessContentService._();
  static final WellnessContentService instance = WellnessContentService._();

  final List<MeditationSession> sessions = [
    MeditationSession(id: 's1', title: 'Box Breathing', description: 'A calming 4-4-4-4 breathing pattern used to reduce acute stress.', minutes: 3),
    MeditationSession(id: 's2', title: 'Grounding Breath', description: 'Slow, steady breathing to bring your attention back to the present.', minutes: 5),
    MeditationSession(id: 's3', title: 'Quick Reset', description: 'A short session for when you only have a minute.', minutes: 1),
  ];
  int _nextSessionId = 4;

  final List<SupportTip> tips = [
    SupportTip(id: 't1', title: 'Ground yourself', body: '5-4-3-2-1: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.'),
    SupportTip(id: 't2', title: "It's okay to reach out", body: 'Talking to someone you trust — a friend, family member, or counselor — is a sign of strength, not weakness.'),
    SupportTip(id: 't3', title: 'You are not alone', body: 'Many people experience fear, anxiety, or trauma. Support is available, and healing is not linear.'),
    SupportTip(id: 't4', title: 'Small steps count', body: "You don't have to have everything figured out today. One small action at a time is enough."),
  ];
  int _nextTipId = 5;

  void addSession({required String title, required String description, required int minutes}) {
    sessions.add(MeditationSession(id: 's${_nextSessionId++}', title: title, description: description, minutes: minutes));
  }

  void removeSession(String id) => sessions.removeWhere((s) => s.id == id);

  void addTip({required String title, required String body}) {
    tips.add(SupportTip(id: 't${_nextTipId++}', title: title, body: body));
  }

  void removeTip(String id) => tips.removeWhere((t) => t.id == id);
}
