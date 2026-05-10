// UI state type definitions

export interface TrailerModalState {
  isOpen: boolean;
  trailerUrl: string | null;
  animeTitle: string;
}

export interface UIState {
  // Modal states
  trailerModal: TrailerModalState;

  // Navigation states
  mobileNavOpen: boolean;
  searchFocused: boolean;

  // Theme
  theme: "dark" | "light";

  // Actions
  openTrailerModal: (url: string, title: string) => void;
  closeTrailerModal: () => void;
  toggleMobileNav: () => void;
  setSearchFocused: (focused: boolean) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}
