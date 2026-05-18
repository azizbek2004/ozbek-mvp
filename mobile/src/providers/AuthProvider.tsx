import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { getFirebaseAuth } from "../lib/firebase";
import { env, isAuthConfigured, isFirebaseConfigured } from "../lib/env";

export interface AppAuthUser {
  uid: string;
  name?: string | null;
  email?: string | null;
  picture?: string | null;
}

interface AuthContextValue {
  user: AppAuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
  getAccessToken: async () => undefined,
});

export const useAppAuth = () => useContext(AuthContext);

function mapFirebaseUser(user: FirebaseUser | null): AppAuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    picture: user.photoURL,
  };
}

function configureGoogleSignIn() {
  if (!env.google.webClientId) {
    if (__DEV__) {
      console.warn(
        "[Odat] Google Web Client ID is not set in environment variables.",
      );
    }
    return;
  }

  // Validate the Client ID format to prevent native crash
  if (!env.google.webClientId.includes("apps.googleusercontent.com")) {
    if (__DEV__) {
      console.warn(
        `[Odat] Invalid Google Web Client ID format: "${env.google.webClientId}". ` +
          `Expected a standard Google OAuth client ID ending with ".apps.googleusercontent.com". ` +
          `Ensure you aren't accidentally using the Firebase Web App ID.`,
      );
    }
    return;
  }

  try {
    const config: {
      webClientId: string;
      iosClientId?: string;
      offlineAccess: boolean;
    } = {
      webClientId: env.google.webClientId,
      offlineAccess: false,
    };
    if (env.google.iosClientId) {
      config.iosClientId = env.google.iosClientId;
    }
    GoogleSignin.configure(config);
  } catch (error) {
    console.error("[Odat] Failed to configure Google Sign-In:", error);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthConfigured()) {
      setIsLoading(false);
      return;
    }

    configureGoogleSignIn();
    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(mapFirebaseUser(firebaseUser));
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    if (!isAuthConfigured()) {
      throw new Error("AUTH_NOT_CONFIGURED");
    }

    configureGoogleSignIn();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    try {
      const result = await GoogleSignin.signIn();
      const idToken = result.data?.idToken;
      if (!idToken) {
        throw new Error("NO_ID_TOKEN");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(getFirebaseAuth(), credential);
    } catch (error: unknown) {
      const code =
        error && typeof error === "object" && "code" in error
          ? String((error as { code: string }).code)
          : error instanceof Error
            ? error.message
            : "UNKNOWN";

      if (
        code === statusCodes.SIGN_IN_CANCELLED ||
        code === "SIGN_IN_CANCELLED" ||
        code === "-5"
      ) {
        throw new Error("USER_CANCELLED");
      }
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    try {
      if (isFirebaseConfigured()) {
        await firebaseSignOut(getFirebaseAuth());
      }
    } catch (e) {
      console.error("[Odat] Firebase sign out error:", e);
    }

    try {
      if (
        env.google.webClientId &&
        env.google.webClientId.includes("apps.googleusercontent.com")
      ) {
        await GoogleSignin.signOut();
      }
    } catch (e) {
      console.error("[Odat] Google sign out error:", e);
    }
  }, []);

  const getAccessToken = useCallback(async () => {
    try {
      const current = getFirebaseAuth().currentUser;
      if (!current) return undefined;
      return await current.getIdToken();
    } catch (e) {
      console.error("[Odat] getAccessToken error:", e);
      return undefined;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signOut,
      getAccessToken,
    }),
    [user, isLoading, signIn, signOut, getAccessToken],
  );

  if (!isAuthConfigured()) {
    if (__DEV__) {
      console.warn(
        "[Odat] Firebase Auth requires EXPO_PUBLIC_FIREBASE_* and EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.",
      );
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
