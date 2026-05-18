/**
 * Centralized environment configuration for production builds.
 * All values use EXPO_PUBLIC_* so they are inlined at build time.
 */

function cleanEnvValue(value: string | undefined): string | undefined {
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function requireInProduction(name: string, value: string | undefined): string {
  if (value) return value;
  if (__DEV__) {
    console.warn(`[Odat] Missing ${name}; set it in .env before release.`);
    return "";
  }
  throw new Error(
    `[Odat] Missing required environment variable: ${name}. See mobile/.env.example.`,
  );
}

export const env = {
  appScheme: cleanEnvValue(process.env.EXPO_PUBLIC_APP_SCHEME) ?? "odat",
  google: {
    webClientId: requireInProduction(
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
      cleanEnvValue(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID),
    ),
    iosClientId: cleanEnvValue(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID),
  },
  firebase: {
    apiKey: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_API_KEY",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_API_KEY),
    ),
    authDomain: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN),
    ),
    projectId: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID),
    ),
    storageBucket: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET),
    ),
    messagingSenderId: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    ),
    appId: requireInProduction(
      "EXPO_PUBLIC_FIREBASE_APP_ID",
      cleanEnvValue(process.env.EXPO_PUBLIC_FIREBASE_APP_ID),
    ),
    measurementId: cleanEnvValue(
      process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    ),
  },
} as const;

export function isFirebaseConfigured(): boolean {
  const { firebase } = env;
  return Boolean(
    firebase.apiKey &&
    firebase.authDomain &&
    firebase.projectId &&
    firebase.storageBucket &&
    firebase.messagingSenderId &&
    firebase.appId,
  );
}

export function isAuthConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(env.google.webClientId);
}
