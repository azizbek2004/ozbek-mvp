import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import * as Crypto from "expo-crypto";

const storage = new MMKV({ id: "auth-store" });

function getOrCreateDeviceId(): string {
  const existing = storage.getString("deviceId");
  if (existing) return existing;
  const newId = Crypto.randomUUID();
  storage.set("deviceId", newId);
  return newId;
}

interface AuthState {
  deviceId: string;
  userId: string | null;
  isOnboarded: boolean;
  userName: string | null;
  userEmail: string | null;
  userAvatar: string | null;
  setProfile: (data: {
    userId: string;
    userName: string;
    userEmail: string;
    userAvatar?: string;
  }) => void;
  setOnboarded: (value: boolean) => void;
  clearLocalSession: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  deviceId: getOrCreateDeviceId(),
  userId: null,
  isOnboarded: false,
  userName: null,
  userEmail: null,
  userAvatar: null,

  setProfile: (data) => {
    storage.set("userId", data.userId);
    storage.set("userName", data.userName);
    storage.set("userEmail", data.userEmail);
    if (data.userAvatar) storage.set("userAvatar", data.userAvatar);
    set({
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userAvatar: data.userAvatar ?? null,
    });
  },

  setOnboarded: (value) => {
    storage.set("isOnboarded", value);
    set({ isOnboarded: value });
  },

  clearLocalSession: () => {
    storage.delete("userId");
    storage.delete("userName");
    storage.delete("userEmail");
    storage.delete("userAvatar");
    storage.delete("isOnboarded");
    set({
      userId: null,
      isOnboarded: false,
      userName: null,
      userEmail: null,
      userAvatar: null,
    });
  },

  loadFromStorage: () => {
    set({
      deviceId: getOrCreateDeviceId(),
      userId: storage.getString("userId") ?? null,
      isOnboarded: storage.getBoolean("isOnboarded") ?? false,
      userName: storage.getString("userName") ?? null,
      userEmail: storage.getString("userEmail") ?? null,
      userAvatar: storage.getString("userAvatar") ?? null,
    });
  },
}));
