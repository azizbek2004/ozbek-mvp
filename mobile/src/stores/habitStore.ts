import { create } from "zustand";
import { MMKV } from "react-native-mmkv";
import { getToday } from "../utils/date";

const storage = new MMKV({ id: "ozbek-habit-store" });
const SELECTED_DATE_KEY = "selected_date";

interface HabitState {
  selectedDate: string;
  needsRefetch: number;
  setSelectedDate: (date: string) => void;
  triggerRefetch: () => void;
  hydrate: () => Promise<void>;
}

export const useHabitStore = create<HabitState>((set) => ({
  selectedDate: getToday(),
  needsRefetch: 0,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    try {
      storage.set(SELECTED_DATE_KEY, date);
    } catch {
      // silently fail persistence
    }
  },

  triggerRefetch: () => {
    set((s) => ({ needsRefetch: s.needsRefetch + 1 }));
  },

  hydrate: async () => {
    try {
      const stored = storage.getString(SELECTED_DATE_KEY);
      if (stored) {
        set({ selectedDate: stored });
      }
    } catch {
      // silently fail
    }
  },
}));
