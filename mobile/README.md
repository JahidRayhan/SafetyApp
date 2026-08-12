# SafeGuard — Flutter port

Flutter scaffold of the original React + Capacitor "SafeGuard" app, covering
all screens/features found in `src/components/` and `src/pages/`, with the
same color system, layout, and responsive breakpoints. This is a **full
scaffold**: navigation, theming, the home dashboard, and the SOS flow (with
both requested native triggers) are built out; the rest of the feature
screens are clean stubs (`FeatureScreenStub`) ready to fill in one at a time.

## Why no `android/` or `ios/` folders yet

This was generated in an environment without the Flutter SDK installed, so I
couldn't run `flutter create` to generate the platform boilerplate. Do this
once, locally:

```bash
# From an EMPTY folder — flutter create refuses to run in a folder that
# already has a pubspec.yaml. So:
mkdir safeguard_flutter && cd safeguard_flutter
flutter create --org com.yourcompany --project-name safeguard .
# then copy this project's pubspec.yaml and lib/ OVER the generated ones
```

or, if you'd rather keep this folder as-is:

```bash
cd safeguard_flutter   # this folder
flutter create --org com.yourcompany --project-name safeguard --platforms android,ios .
# flutter create will merge android/ and ios/ into this folder without
# touching your existing lib/ and pubspec.yaml
flutter pub get
```

Then:
1. Copy `android_native_snippets/MainActivity.kt` over the generated
   `android/app/src/main/kotlin/<your/package/path>/MainActivity.kt`, and
   update the `package` line to match your `applicationId`.
2. No iOS native changes are required — shake detection is implemented in
   Dart via `sensors_plus` (see below).
3. `flutter pub get`, then `flutter run`.

## SOS triggers — what's implemented and why

**Android — volume-button triple-press** (`android_native_snippets/MainActivity.kt`
+ `lib/services/volume_button_sos_service.dart`): `dispatchKeyEvent` counts
3 volume-key presses within 1.5s and pings Dart over a `MethodChannel`.

> ⚠️ **Power button was not implementable.** Android does not deliver
> `KEYCODE_POWER` events to any third-party app — the OS intercepts it before
> app code ever sees it, for security reasons (this is true for Capacitor too;
> your original React project's `usePowerButtonSOS.ts` hook only listens for
> a custom `powerButtonSOS` window event, which would need to come from
> somewhere — and there's no public native path to actually dispatch it from
> a real power-button press). Volume buttons **are** deliverable to a
> foregrounded app, which is why that's the substitute.
>
> Limitation to know about: this only fires while the app is open/resumed
> with window focus — not from the lock screen or fully backgrounded. If you
> need that, the only real options are an `AccessibilityService` (works in
> background, but adds Play Store review scrutiny) or a home-screen
> widget/notification quick-action as a fallback trigger.

**iOS — shake to trigger** (`lib/services/shake_sos_service.dart`): pure Dart,
via `sensors_plus`'s accelerometer stream — detects a short burst of
high-magnitude motion samples, the same technique behind UIKit's native
shake gesture. No native Swift changes needed. Tunables (`_shakeThresholdG`,
`_minShakesInWindow`, `_window`, `_cooldown`) are at the top of that file.

Both triggers feed into `EmergencySosScreen`'s same 3-second countdown as
tapping the SOS button directly, so the UX is consistent regardless of which
trigger fires.

## Project structure

```
lib/
  core/
    theme.dart              # colors ported 1:1 from index.css / tailwind.config.ts
    navigation_items.dart   # per-role nav + home dashboard feature lists
  state/
    app_state.dart          # auth/role/active-tab state (Provider/ChangeNotifier)
  services/
    volume_button_sos_service.dart   # Android trigger
    shake_sos_service.dart           # iOS trigger
  widgets/
    app_shell.dart          # responsive top-tab-bar (>=1024px) / bottom-nav (mobile)
    feature_card.dart       # dashboard grid tile
    core_features_grid.dart # responsive 2/3/4-col grid, matches Tailwind breakpoints
  screens/
    landing_page.dart       # LandingPage.tsx
    auth_screen.dart        # AuthForm.tsx
    home_shell.dart         # pages/Index.tsx (role-based dashboard)
    content_router.dart     # dashboard/ContentRenderer.tsx (tab id -> screen)
    sos/emergency_sos_screen.dart   # EmergencyButton + EmergencyCountdown
    features/feature_screen_stub.dart  # shared template for stubbed screens
```

Every stubbed screen in `content_router.dart` corresponds 1:1 to a component
in the original `src/components/` folder (contacts, recording, incident
report, fake call, safe zones, chatbot, resources, activity history/log,
alerts, community, admin/govt panels, settings). Swap `FeatureScreenStub(...)`
for real UI + logic as you build each one out — I kept the mapping close to
`ContentRenderer.tsx` so it's easy to cross-reference.

## Backend

The original app uses Supabase (`@supabase/supabase-js`, see its `.env`).
`supabase_flutter` is already in `pubspec.yaml`; wire up
`Supabase.initialize(...)` in `main.dart` and swap the `// TODO` in
`auth_screen.dart` for real `signInWithPassword` / `signUp` calls using the
same project URL/anon key from the original `.env`.

## Fonts

`theme.dart` references `fontFamily: 'Inter'` (matching the web app's default
font stack) but no font asset is bundled here. Either add Inter's `.ttf`
files under `assets/fonts/` and declare them in `pubspec.yaml`, or swap to
the `google_fonts` package for a zero-asset solution.

## Not yet ported (by design, per your "stub everything" choice)

Location sharing/tracking map UI, emergency contacts CRUD, evidence
recording + upload queue, incident reporting form, fake call scheduler,
safe zone map picker (`SafeZoneMapPicker.tsx` → `flutter_map` is already in
`pubspec.yaml` for this), chatbot support, safety resource directory,
activity history/log, community + community management, all admin/govt-admin
panels (`AdminHome`, `GovernmentRequests`, `SOSAlertsPanel`,
`ActivityMonitoring`, `StoriesModeration`, etc.), and account settings.
