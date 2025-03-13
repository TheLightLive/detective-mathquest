
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.19297fd1dc2a4231a40e21ab664f92c2',
  appName: 'detective-mathquest',
  webDir: 'dist',
  server: {
    url: 'https://19297fd1-dc2a-4231-a40e-21ab664f92c2.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#121212",
      showSpinner: true,
      spinnerColor: "#00e5ff"
    }
  }
};

export default config;
