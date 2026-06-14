import { create } from 'zustand';

// ─── Types ──────────────────────────────────────────────────────────────────

type ActiveView = 'grid' | 'list';

interface UIState {
  sidebarCollapsed: boolean;
  copilotOpen: boolean;
  commandPaletteOpen: boolean;
  searchOpen: boolean;
  activeView: ActiveView;
}

interface UIActions {
  toggleSidebar: () => void;
  toggleCopilot: () => void;
  toggleCommandPalette: () => void;
  toggleSearch: () => void;
  setActiveView: (view: ActiveView) => void;
}

type UIStore = UIState & UIActions;

// ─── Store ──────────────────────────────────────────────────────────────────

export const useUIStore = create<UIStore>((set) => ({
  // State
  sidebarCollapsed: false,
  copilotOpen: false,
  commandPaletteOpen: false,
  searchOpen: false,
  activeView: 'grid',

  // Actions
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleCopilot: () =>
    set((state) => ({ copilotOpen: !state.copilotOpen })),

  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),

  toggleSearch: () =>
    set((state) => ({ searchOpen: !state.searchOpen })),

  setActiveView: (view) =>
    set({ activeView: view }),
}));
