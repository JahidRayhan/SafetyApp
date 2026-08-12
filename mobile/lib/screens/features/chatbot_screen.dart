import 'package:flutter/material.dart';
import '../../core/theme.dart';

class _ChatMessage {
  final String text;
  final bool fromUser;
  const _ChatMessage(this.text, this.fromUser);
}

/// Ported from ChatbotSupport.tsx. The original wires this to an AI
/// backend (likely a Supabase edge function calling an LLM) — that's not
/// available here, so responses are rule-based canned replies matched by
/// keyword. Swap `_respondTo` for a real API call once the backend exists;
/// the chat UI itself (bubbles, input, scroll) is fully functional.
class ChatbotScreen extends StatefulWidget {
  const ChatbotScreen({super.key});

  @override
  State<ChatbotScreen> createState() => _ChatbotScreenState();
}

class _ChatbotScreenState extends State<ChatbotScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [
    const _ChatMessage(
        "Hi, I'm your SafeGuard assistant. I can help with safety tips, using the app's features, or just talk if you need someone. What's on your mind?",
        false),
  ];

  String _respondTo(String input) {
    final t = input.toLowerCase();
    if (t.contains('sos') || t.contains('emergency')) {
      return 'The SOS button is on your Home screen — tap it, and after a short countdown it alerts your emergency contacts with your location. You can also trigger it by triple-pressing the volume button, or by shaking your phone on iOS.';
    }
    if (t.contains('contact')) {
      return 'You can manage who gets notified during an SOS from the Emergency Contacts screen — add, edit, or set priority order there.';
    }
    if (t.contains('scared') || t.contains('unsafe') || t.contains('afraid') || t.contains('followed')) {
      return "I'm sorry you're feeling that way. If you're in immediate danger, please use the SOS button now, or call your local emergency number. Would you like me to walk you through starting Live Location Sharing so someone can see where you are?";
    }
    if (t.contains('location')) {
      return 'Location Sharing lets trusted contacts see your live position, and Location Tracking warns you when you enter a flagged safe or risky zone. Both are on your Home dashboard.';
    }
    if (t.contains('thank')) {
      return "You're welcome. Stay safe — I'm here anytime you need me.";
    }
    return "I'm a simple assistant for now, but here to help however I can. You can ask me about SOS, emergency contacts, location sharing, or just talk.";
  }

  void _send() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(_ChatMessage(text, true));
      _controller.clear();
    });
    Future.delayed(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      setState(() => _messages.add(_ChatMessage(_respondTo(text), false)));
      _scrollToBottom();
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 50), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, i) {
              final m = _messages[i];
              return Align(
                alignment: m.fromUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  constraints: BoxConstraints(maxWidth: MediaQuery.sizeOf(context).width * 0.75),
                  decoration: BoxDecoration(
                    color: m.fromUser ? AppColors.emergency600 : AppColors.secondary,
                    borderRadius: BorderRadius.circular(AppRadius.panel),
                  ),
                  child: Text(
                    m.text,
                    style: TextStyle(color: m.fromUser ? Colors.white : AppColors.foreground, fontSize: 14),
                  ),
                ),
              );
            },
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Type a message…'),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filled(onPressed: _send, icon: const Icon(Icons.send_rounded)),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
