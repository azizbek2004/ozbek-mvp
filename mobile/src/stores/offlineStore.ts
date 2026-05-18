import { create } from "zustand";

interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  pendingCount: number;
  setOnline: (v: boolean) => void;
  setSyncing: (v: boolean) => void;
  setLastSynced: (date: string) => void;
  setPendingCount: (n: number) => void;
}

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: true,
  isSyncing: false,
  lastSyncedAt: null,
  pendingCount: 0,
  setOnline: (v) => set({ isOnline: v }),
  setSyncing: (v) => set({ isSyncing: v }),
  setLastSynced: (date) => set({ lastSyncedAt: date }),
  setPendingCount: (n) => set({ pendingCount: n }),
}));
