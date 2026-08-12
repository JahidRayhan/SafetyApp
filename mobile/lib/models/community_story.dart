class CommunityStory {
  final String id;
  final String authorName;
  final String title;
  final String body;
  int supportCount;
  final DateTime createdAt;

  CommunityStory({
    required this.id,
    required this.authorName,
    required this.title,
    required this.body,
    this.supportCount = 0,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();
}
