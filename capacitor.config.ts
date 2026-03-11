import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.almuezzin.app',
  appName: 'المؤذن العالمي',
  webDir: 'dist',
  server: {
    url: 'https://www.almuezzin.com',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    minWebViewVersion: '95.0',
  },
};

export default config;
