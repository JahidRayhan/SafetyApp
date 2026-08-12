import 'package:flutter/material.dart';
import '../core/theme.dart';

class LandingPage extends StatelessWidget {
  final VoidCallback onGetStarted;
  const LandingPage({super.key, required this.onGetStarted});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 88,
                  height: 88,
                  decoration: const BoxDecoration(
                    color: AppColors.emergency600,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.shield_rounded, color: Colors.white, size: 44),
                ),
                const SizedBox(height: 24),
                const Text(
                  'SafeGuard',
                  style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.foreground),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Your personal safety companion',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: AppColors.mutedForeground),
                ),
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: onGetStarted,
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 4),
                      child: Text('Get Started'),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
