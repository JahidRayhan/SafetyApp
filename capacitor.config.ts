
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.42871f4c4d7240dba5b25777dc7760eb',
  appName: 'SafeGuard',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://42871f4c-4d72-40db-a5b2-5777dc7760eb.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    },
    App: {
      launchUrl: 'https://42871f4c-4d72-40db-a5b2-5777dc7760eb.lovableproject.com?forceHideBadge=true'
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  android: {
    buildOptions: {
      keystorePath: null,
      keystoreAlias: null
    },
    allowMixedContent: true
  },
  ios: {
    scheme: 'SafeGuard',
    contentInset: 'automatic',
    backgroundColor: '#ffffffff'
  }
};

export default config;
