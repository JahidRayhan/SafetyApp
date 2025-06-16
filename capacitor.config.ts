import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safeguard.app',
  appName: 'SafeGuard',
  webDir: 'dist',

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
      keystorePath: undefined,
      keystoreAlias: undefined
    }
  }
};

export default config;