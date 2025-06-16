import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.safeguard.app',
  appName: 'SafeGuard',
  webDir: 'dist',

  plugins: {
    SplashScreen: {
      launchShowDuration: 0
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