import { create } from 'zustand';

type UIState = {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
};

export const useUIStore = create<UIState>((set) => ({
  themeMode: 'dark', // Default theme
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
}));
