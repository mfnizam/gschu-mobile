import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gschu.app',
  appName: 'GS CHU',
  webDir: 'www',
  bundledWebRuntime: false,
  backgroundColor: '#00000000',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    // SplashScreen: {
    //   launchShowDuration: 3000,
    //   launchAutoHide: true,
    //   backgroundColor: "#ffffff",
    // }
  },
};

export default config;
