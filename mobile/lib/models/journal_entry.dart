enum JournalMood { great, good, okay, low, difficult }

extension JournalMoodX on JournalMood {
  String get emoji => switch (this) {
        JournalMood.great => '😄',
        JournalMood.good => '🙂',
        JournalMood.okay => '😐',
        JournalMood.low => '😔',
        JournalMood.difficult => '😞',
      };
  String get label => switch (this) {
        JournalMood.great => 'Great',
        JournalMood.good => 'Good',
        JournalMood.okay => 'Okay',
        JournalMood.low => 'Low',
        JournalMood.difficult => 'Difficult',
      };
}

class JournalEntry {
  final String id;
  String text;
  JournalMood mood;
  final DateTime createdAt;

  JournalEntry({required this.id, required this.text, required this.mood, DateTime? createdAt})
      : createdAt = createdAt ?? DateTime.now();
}
