// UI state store with theme persistence

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UIState } from "@/types/ui";

const THEME_STORAGE_KEY = "codenime_theme";

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Modal states
      trailerModal: {
        isOpen: false,
        trailerUrl: null,
        animeTitle: "",
      },

      // Navigation states
      mobileNavOpen: false,
      searchFocused: false,

      // Theme (default to dark)
      theme: "dark",

      // Actions
      openTrailerModal: (url: string, title: string) => {
        set({
          trailerModal: {
            isOpen: true,
            trailerUrl: url,
            animeTitle: title,
          },
        });
      },

      closeTrailerModal: () => {
        set({
          trailerModal: {
            isOpen: false,
            trailerUrl: null,
            animeTitle: "",
          },
        });
      },

      toggleMobileNav: () => {
        const { mobileNavOpen } = get();
        set({ mobileNavOpen: !mobileNavOpen });
      },

      setSearchFocused: (focused: boolean) => {
        set({ searchFocused: focused });
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === "dark" ? "light" : "dark";
        set({ theme: newTheme });

        // Apply theme to document
        if (typeof document !== "undefined") {
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.classList.add(newTheme);
        }
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => {
        // Custom storage implementation with error handling and SSR support
        if (typeof window === "undefined") {
          // Return no-op storage for SSR
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }

        return {
          getItem: (name: string) => {
            try {
              const value = localStorage.getItem(name);
              return value;
            } catch (error) {
              console.error("Failed to read theme from localStorage:", error);
              return null;
            }
          },
          setItem: (name: string, value: string) => {
            try {
              localStorage.setItem(name, value);
            } catch (error) {
              console.error("Failed to save theme to localStorage:", error);
            }
          },
          removeItem: (name: string) => {
            try {
              localStorage.removeItem(name);
            } catch (error) {
              console.error("Failed to remove theme from localStorage:", error);
            }
          },
        };
      }),
      // Only persist theme, not modal/navigation states
      partialize: (state) => ({ theme: state.theme }),
      // Apply theme on rehydration
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== "undefined") {
          document.documentElement.classList.remove("dark", "light");
          document.documentElement.classList.add(state.theme);
        }
      },
    },
  ),
);

// Initialize theme on client side
if (typeof window !== "undefined") {
  const state = useUIStore.getState();
  document.documentElement.classList.add(state.theme);
}
