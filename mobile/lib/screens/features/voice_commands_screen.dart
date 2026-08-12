import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../core/theme.dart';
import '../../state/app_state.dart';

/// Ported from VoiceCommands.tsx. Real speech recognition via
/// `speech_to_text` (uses the OS's built-in recognizer — Google on
/// Android, Apple's on iOS — no server calls, works offline on most
/// devices). Listens continuously while active; if the transcript
/// contains a trigger phrase ("help me", "emergency", "call for help"),
/// it fires the same app-wide SOS trigger as the volume-button/shake
/// gestures.
class VoiceCommandsScreen extends StatefulWidget {
  const VoiceCommandsScreen({super.key});

  @override
  State<VoiceCommandsScreen> createState() => _VoiceCommandsScreenState();
}

class _VoiceCommandsScreenState extends State<VoiceCommandsScreen> {
  final _speech = stt.SpeechToText();
  bool _available = false;
  bool _listening = false;
  String _transcript = '';
  String? _error;

  static const _triggerPhrases = ['help me', 'emergency', 'call for help', 'sos'];

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    final available = await _speech.initialize(
      onError: (e) => setState(() => _error = e.errorMsg),
      onStatus: (status) {
        if (status == 'notListening' && _listening) {
          // Recognizer auto-stops after a pause; restart to keep listening
          // continuously while the toggle is on.
          _startListening();
        }
      },
    );
    if (mounted) setState(() => _available = available);
  }

  void _startListening() {
    _speech.listen(
      onResult: (result) {
        setState(() => _transcript = result.recognizedWords);
        final lower = _transcript.toLowerCase();
        if (_triggerPhrases.any(lower.contains)) {
          _onTriggerDetected();
        }
      },
      listenFor: const Duration(seconds: 30),
      pauseFor: const Duration(seconds: 5),
    );
  }

  void _onTriggerDetected() {
    _stop();
    context.read<AppState>().requestSosTrigger();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Trigger phrase detected — starting SOS.'), backgroundColor: AppColors.emergency600),
    );
  }

  void _toggle() {
    if (_listening) {
      _stop();
    } else {
      setState(() {
        _listening = true;
        _transcript = '';
        _error = null;
      });
      _startListening();
    }
  }

  void _stop() {
    _speech.stop();
    setState(() => _listening = false);
  }

  @override
  void dispose() {
    _speech.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.mic_rounded, color: AppColors.emergency600),
                    SizedBox(width: 10),
                    Text('Voice Commands', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Say "${_triggerPhrases.join('", "')}" to trigger SOS hands-free.',
                  style: const TextStyle(color: AppColors.mutedForeground, fontSize: 13),
                ),
                const SizedBox(height: 20),
                if (!_available)
                  const Text('Speech recognition is not available on this device.',
                      style: TextStyle(color: AppColors.destructive))
                else ...[
                  Center(
                    child: GestureDetector(
                      onTap: _toggle,
                      child: Container(
                        width: 96,
                        height: 96,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _listening ? AppColors.emergency600 : AppColors.secondary,
                        ),
                        child: Icon(
                          _listening ? Icons.mic_rounded : Icons.mic_none_rounded,
                          size: 40,
                          color: _listening ? Colors.white : AppColors.foreground,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Center(
                    child: Text(
                      _listening ? 'Listening…' : 'Tap to start listening',
                      style: const TextStyle(color: AppColors.mutedForeground),
                    ),
                  ),
                  if (_transcript.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: AppColors.secondary, borderRadius: BorderRadius.circular(AppRadius.md)),
                      child: Text('"$_transcript"', style: const TextStyle(fontStyle: FontStyle.italic)),
                    ),
                  ],
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(_error!, style: const TextStyle(color: AppColors.destructive, fontSize: 12)),
                  ],
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
