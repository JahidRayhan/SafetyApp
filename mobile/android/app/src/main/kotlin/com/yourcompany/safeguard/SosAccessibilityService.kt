package com.yourcompany.safeguard // TODO: match your actual applicationId

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent

/**
 * Detects 3x volume-button presses SYSTEM-WIDE — including while the phone
 * is locked or SafeGuard isn't running — and launches the app over the
 * lock screen with an "auto_sos" flag so it starts the SOS countdown
 * immediately.
 *
 * WHY THIS NEEDS ACCESSIBILITY: Android's normal app-level key-event
 * handling (what MainActivity.kt's dispatchKeyEvent does) only fires while
 * an app has window focus. An AccessibilityService with
 * FLAG_REQUEST_FILTER_KEY_EVENTS is the one exception — it can intercept
 * hardware key events regardless of what's in the foreground, which is
 * exactly why it's the standard technique legitimate personal-safety apps
 * use for this. It's also why it requires the person to manually grant
 * Accessibility permission in system Settings — Android intentionally
 * doesn't let apps request this silently, since it's powerful.
 *
 * BEHAVIOR: consumes (returns true, blocking normal volume-change UI) only
 * on the 3rd press within the window; the 1st and 2nd presses pass through
 * normally so ordinary volume adjustment still works everywhere else.
 */
class SosAccessibilityService : AccessibilityService() {

    private val pressTimestamps = mutableListOf<Long>()
    private val WINDOW_MS = 1500L
    private val REQUIRED_PRESSES = 3

    override fun onServiceConnected() {
        super.onServiceConnected()
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onKeyEvent(event: KeyEvent): Boolean {
        if (event.action == KeyEvent.ACTION_DOWN &&
            (event.keyCode == KeyEvent.KEYCODE_VOLUME_UP || event.keyCode == KeyEvent.KEYCODE_VOLUME_DOWN)
        ) {
            val now = System.currentTimeMillis()
            pressTimestamps.add(now)
            pressTimestamps.removeAll { now - it > WINDOW_MS }

            if (pressTimestamps.size >= REQUIRED_PRESSES) {
                pressTimestamps.clear()
                launchAppWithAutoSos()
                return true // consume only the triggering press
            }
        }
        return false // let every other press behave normally
    }

    private fun launchAppWithAutoSos() {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK or
                Intent.FLAG_ACTIVITY_CLEAR_TOP or
                Intent.FLAG_ACTIVITY_SINGLE_TOP
            )
            putExtra("auto_sos", true)
        }
        startActivity(intent)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Not used — this service exists purely for onKeyEvent. Required
        // override since AccessibilityService is abstract on this method.
    }

    override fun onInterrupt() {}
}
