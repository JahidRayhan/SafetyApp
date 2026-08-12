import '../models/journal_entry.dart';

/// Anonymous Journal — private, local-only by design (matches the
/// original's "anonymous" framing: entries aren't tied to identity beyond
/// the logged-in account, and here they never leave the device since
/// there's no backend wired yet).
class JournalService {
  JournalService._();
  static final JournalService instance = JournalService._();

  final List<JournalEntry> _entries = [];
  int _nextId = 1;

  List<JournalEntry> list() => [..._entries]..sort((a, b) => b.createdAt.compareTo(a.createdAt));

  JournalEntry add({required String text, required JournalMood mood}) {
    final entry = JournalEntry(id: (_nextId++).toString(), text: text, mood: mood);
    _entries.add(entry);
    return entry;
  }

  void remove(String id) => _entries.removeWhere((e) => e.id == id);
}
