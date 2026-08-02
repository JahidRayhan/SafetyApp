
package app.lovable.42871f4c4d7240dba5b25777dc7760eb;

import android.os.Bundle;
import android.view.KeyEvent;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class MainActivity extends BridgeActivity {
    private static final int POWER_BUTTON_PRESS_COUNT = 3;
    private static final long POWER_BUTTON_TIMEOUT = 2000; // 2 seconds
    
    private int powerButtonPressCount = 0;
    private Handler powerButtonHandler = new Handler(Looper.getMainLooper());
    private Runnable powerButtonRunnable;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_POWER) {
            handlePowerButtonPress();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    private void handlePowerButtonPress() {
        powerButtonPressCount++;
        
        // Remove any existing timeout
        if (powerButtonRunnable != null) {
            powerButtonHandler.removeCallbacks(powerButtonRunnable);
        }
        
        // Check if we've reached the target count
        if (powerButtonPressCount >= POWER_BUTTON_PRESS_COUNT) {
            triggerSOS();
            powerButtonPressCount = 0;
            return;
        }
        
        // Set timeout to reset counter
        powerButtonRunnable = new Runnable() {
            @Override
            public void run() {
                powerButtonPressCount = 0;
            }
        };
        
        powerButtonHandler.postDelayed(powerButtonRunnable, POWER_BUTTON_TIMEOUT);
    }
    
    private void triggerSOS() {
        // Send event to the web app
        JSObject data = new JSObject();
        data.put("source", "power_button");
        
        if (getBridge() != null) {
            getBridge().triggerWindowJSEvent("powerButtonSOS", data);
        }
    }
}
