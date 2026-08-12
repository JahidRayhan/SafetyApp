import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/supabase_client.dart';
import 'core/theme.dart';
import 'screens/auth_screen.dart';
import 'screens/home_shell.dart';
import 'screens/landing_page.dart';
import 'state/app_state.dart';
import 'widgets/root_shell.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await initSupabase();

  final appState = AppState();
  appState.bootstrap(); // fire-and-forget: bootstrap() calls notifyListeners() itself when done

  runApp(
    ChangeNotifierProvider.value(
      value: appState,
      child: const SafeGuardApp(),
    ),
  );
}

class SafeGuardApp extends StatelessWidget {
  const SafeGuardApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeGuard',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      darkTheme: AppTheme.dark,
      home: const RootShell(child: _RootRouter()),
    );
  }
}

/// Ported from the top of src/pages/Index.tsx: loading -> landing -> auth ->
/// authenticated shell.
class _RootRouter extends StatefulWidget {
  const _RootRouter();

  @override
  State<_RootRouter> createState() => _RootRouterState();
}

class _RootRouterState extends State<_RootRouter> {
  bool _showAuth = false;

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();

    if (appState.loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (!appState.isAuthenticated && !_showAuth) {
      return LandingPage(onGetStarted: () => setState(() => _showAuth = true));
    }

    if (!appState.isAuthenticated && _showAuth) {
      return const AuthScreen();
    }

    return const HomeShell();
  }
}
