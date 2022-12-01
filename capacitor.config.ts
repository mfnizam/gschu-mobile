import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gschu.app',
  appName: 'GSCHU',
  webDir: 'www',
  bundledWebRuntime: false,
  backgroundColor: '#00000000',
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    // LocalNotifications: {
    //   smallIcon: "ic_stat_icon_config_sample",
    //   iconColor: "#488AFF",
    //   sound: "beep.wav"
    // }
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#00ffffff",
    }
  },
};

export default config;
