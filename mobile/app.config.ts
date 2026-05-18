import type { ConfigContext, ExpoConfig } from "expo/config";

const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? "odat";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Odat",
  slug: "odat-habit",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: appScheme,
  userInterfaceStyle: "dark",
  newArchEnabled: true,
  backgroundColor: "#000000",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.odat.habit",
    googleServicesFile: "./GoogleService-Info.plist",
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      GIDClientID:
        "904803756017-8p3vg9o1oqsj5tf2bfoe9ml94f927itf.apps.googleusercontent.com",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.odat.habit",
    versionCode: 1,
    googleServicesFile: "./android/app/google-services.json",
    permissions: [
      "INTERNET",
      "ACCESS_NETWORK_STATE",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "SCHEDULE_EXACT_ALARM",
    ],
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-secure-store",
    "@react-native-google-signin/google-signin",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "18.0",
        },
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#0A84FF",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "odat-habit",
    },
  },
});
