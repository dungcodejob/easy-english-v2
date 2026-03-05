import { create } from 'zustand';

interface SearchStore {
  query: string;
  debouncedQuery: string;
  setQuery: (query: string) => void;
  setDebouncedQuery: (query: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: '',
  debouncedQuery: '',
  setQuery: (query) => set({ query }),
  setDebouncedQuery: (debouncedQuery) => set({ debouncedQuery }),
}));
