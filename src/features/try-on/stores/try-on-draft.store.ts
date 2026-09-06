"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TryOnDraftState = {
  garmentId: string | null;
  bodyTemplateId: string | null;
  setGarmentId: (garmentId: string) => void;
  setBodyTemplateId: (bodyTemplateId: string) => void;
  clear: () => void;
};

export const useTryOnDraftStore = create<TryOnDraftState>()(
  persist(
    (set) => ({
      garmentId: null,
      bodyTemplateId: null,
      setGarmentId: (garmentId) => set({ garmentId, bodyTemplateId: null }),
      setBodyTemplateId: (bodyTemplateId) => set({ bodyTemplateId }),
      clear: () => set({ garmentId: null, bodyTemplateId: null }),
    }),
    {
      name: "fitly-web-try-on-draft-v1",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ bodyTemplateId, garmentId }) => ({ bodyTemplateId, garmentId }),
    },
  ),
);
