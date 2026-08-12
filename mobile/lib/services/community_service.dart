import '../models/community_story.dart';

/// Mirrors the shape of the community stories feature (submit/list/support
/// a story). In-memory, seeded with a couple of examples.
class CommunityService {
  CommunityService._();
  static final CommunityService instance = CommunityService._();

  final List<CommunityStory> _stories = [
    CommunityStory(
      id: '1',
      authorName: 'Anonymous',
      title: 'A stranger walked me to my car',
      body: 'Leaving work late one night, a coworker noticed I looked nervous and offered to walk me to my car. Small gestures like that make such a difference.',
      supportCount: 12,
    ),
    CommunityStory(
      id: '2',
      authorName: 'Anonymous',
      title: 'The SOS feature gave me peace of mind',
      body: 'I travel alone for work often. Knowing I can trigger an alert with one tap has genuinely changed how safe I feel on solo trips.',
      supportCount: 8,
    ),
  ];
  int _nextId = 3;

  Future<List<CommunityStory>> list() async {
    await Future.delayed(const Duration(milliseconds: 150));
    return [..._stories]..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<CommunityStory> submit({required String title, required String body, String authorName = 'Anonymous'}) async {
    if (title.trim().isEmpty || body.trim().isEmpty) {
      throw Exception('Please add a title and your story.');
    }
    final story = CommunityStory(id: (_nextId++).toString(), authorName: authorName, title: title.trim(), body: body.trim());
    _stories.add(story);
    return story;
  }

  void support(String id) {
    final story = _stories.firstWhere((s) => s.id == id);
    story.supportCount++;
  }

  void remove(String id) => _stories.removeWhere((s) => s.id == id);
}
