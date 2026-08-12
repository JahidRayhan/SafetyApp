package com.yourcompany.safeguard // TODO: change to your actual applicationId

import android.content.Intent
import android.os.Bundle
import android.view.KeyEvent
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * Two SOS entry points live here:
 *
 * 1. dispatchKeyEvent — foreground-only volume-triple-press (works whenever
 *    the app already has window focus).
 *
 * 2. checkAutoSosLaunch — the lock-screen/background path. When
 *    SosAccessibilityService detects a triple-press system-wide, it starts
 *    this Activity with an "auto_sos" intent extra and flags that make it
 *    appear over the lock screen. Dart asks (via the method channel,
 *    pull-based to avoid any race with push timing) whether this launch
 *    was an auto-SOS one, and if so immediately starts the countdown.
 */
class MainActivity : FlutterActivity() {
    private val CHANNEL = "safeguard/volume_sos"
    private var methodChannel: MethodChannel? = null
    private var pendingAutoSos = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Allow this Activity to show over the lock screen and wake the
        // screen, so an SOS triggered while locked is immediately visible
        // rather than silently launching in the background. Manifest-level
        // android:showWhenLocked / android:turnScreenOn (API 27+) cover
        // most devices; these window flags are a broader-compatibility
        // fallback for older API levels.
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
        )

        checkIntentForAutoSos(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        checkIntentForAutoSos(intent)
    }

    private fun checkIntentForAutoSos(intent: Intent?) {
        if (intent?.getBooleanExtra("auto_sos", false) == true) {
            pendingAutoSos = true
            intent.removeExtra("auto_sos") // consume so a later resume doesn't re-trigger
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        methodChannel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        methodChannel?.setMethodCallHandler { call, result ->
            when (call.method) {
                "checkAutoSosLaunch" -> {
                    result.success(pendingAutoSos)
                    pendingAutoSos = false
                }
                else -> result.notImplemented()
            }
        }
    }

    private val pressTimestamps = mutableListOf<Long>()
    private val WINDOW_MS = 1500L
    private val REQUIRED_PRESSES = 3

    override fun dispatchKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN &&
            (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)
        ) {
            val now = System.currentTimeMillis()
            pressTimestamps.add(now)
            pressTimestamps.removeAll { now - it > WINDOW_MS }

            if (pressTimestamps.size >= REQUIRED_PRESSES) {
                pressTimestamps.clear()
                methodChannel?.invokeMethod("tripleVolumePress", null)
                return true
            }
        }
        return super.dispatchKeyEvent(event)
    }
}
