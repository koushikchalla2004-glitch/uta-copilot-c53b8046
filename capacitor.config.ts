import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e8fe46559dde42519c9c7cae68759a8c',
  appName: 'uta-copilot',
  webDir: 'dist',
  server: {
    url: 'https://e8fe4655-9dde-4251-9c9c-7cae68759a8c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    }
  }
};

export default config;