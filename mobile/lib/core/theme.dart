import 'package:flutter/material.dart';

/// Colors ported 1:1 from the original app's `index.css` (--background, --primary,
/// etc.) and `tailwind.config.ts` (emergency/safe/warning scales), so the Flutter
/// app matches the web/Capacitor UI exactly.
class AppColors {
  AppColors._();

  // --- shadcn/ui tokens (light mode) ---
  static const background = Color(0xFFF8FAFC); // 248 250 252
  static const foreground = Color(0xFF0F172A); // 15 23 42
  static const card = Color(0xFFFFFFFF);
  static const cardForeground = Color(0xFF0F172A);
  static const primary = Color(0xFFEF4444); // 239 68 68
  static const primaryForeground = Color(0xFFFFFFFF);
  static const secondary = Color(0xFFF1F5F9); // 241 245 249
  static const secondaryForeground = Color(0xFF0F172A);
  static const muted = Color(0xFFF1F5F9);
  static const mutedForeground = Color(0xFF64748B); // 100 116 139
  static const accent = Color(0xFFF1F5F9);
  static const destructive = Color(0xFFEF4444);
  static const border = Color(0xFFE2E8F0); // 226 232 240

  // --- shadcn/ui tokens (dark mode) ---
  static const backgroundDark = Color(0xFF0F172A);
  static const foregroundDark = Color(0xFFF8FAFC);
  static const cardDark = Color(0xFF1E293B);
  static const mutedForegroundDark = Color(0xFF94A3B8);
  static const borderDark = Color(0xFF334155);

  // --- emergency scale ---
  static const emergency50 = Color(0xFFFEF2F2);
  static const emergency100 = Color(0xFFFEE2E2);
  static const emergency200 = Color(0xFFFECACA);
  static const emergency500 = Color(0xFFEF4444);
  static const emergency600 = Color(0xFFDC2626);
  static const emergency700 = Color(0xFFB91C1C);

  // --- safe scale ---
  static const safe50 = Color(0xFFF0FDF4);
  static const safe200 = Color(0xFFBBF7D0);
  static const safe500 = Color(0xFF22C55E);
  static const safe600 = Color(0xFF16A34A);
  static const safe700 = Color(0xFF15803D);

  // --- warning scale ---
  static const warning50 = Color(0xFFFFFBEB);
  static const warning200 = Color(0xFFFDE68A);
  static const warning500 = Color(0xFFF59E0B);
  static const warning600 = Color(0xFFD97706);
}

class AppRadius {
  AppRadius._();
  static const lg = 12.0; // var(--radius) = 0.75rem
  static const md = 10.0;
  static const sm = 8.0;
  static const panel = 14.0; // 0.875rem
  static const pill = 999.0;
}

class AppTheme {
  AppTheme._();

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        scaffoldBackgroundColor: AppColors.background,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          onPrimary: AppColors.primaryForeground,
          secondary: AppColors.secondary,
          onSecondary: AppColors.secondaryForeground,
          surface: AppColors.card,
          onSurface: AppColors.foreground,
          error: AppColors.destructive,
        ),
        cardTheme: CardThemeData(
          color: AppColors.card,
          elevation: 2,
          shadowColor: Colors.black.withValues(alpha: 0.08),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.panel),
            side: const BorderSide(color: AppColors.border),
          ),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.card,
          foregroundColor: AppColors.foreground,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.emergency600,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.pill),
            ),
            textStyle: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.secondary,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.md),
            borderSide: BorderSide.none,
          ),
        ),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: AppColors.backgroundDark,
        fontFamily: 'Inter',
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          onPrimary: AppColors.primaryForeground,
          secondary: AppColors.cardDark,
          surface: AppColors.cardDark,
          onSurface: AppColors.foregroundDark,
          error: AppColors.destructive,
        ),
        cardTheme: CardThemeData(
          color: AppColors.cardDark,
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.panel),
            side: const BorderSide(color: AppColors.borderDark),
          ),
        ),
      );

  /// Matches `bg-gradient-to-br from-emergency-50 to-emergency-100`
  static const backgroundGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.emergency50, AppColors.emergency100],
  );
}
