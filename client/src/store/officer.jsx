import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useOfficerStore = create(
  persist(
    (set) => ({
      officer: null,
      setOfficer: (officer) => set({ officer }),
      clearOfficer: () => set({ user: null }),
    }),
    {
      name: "officer-storage",
    }
  )
);
