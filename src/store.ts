import { create } from 'zustand';

export interface Station {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  url: string;
  favicon: string;
  tags: string[];
  geo_lat?: number;
  geo_long?: number;
}

interface AppState {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number;
  isLoading: boolean;
  stationsByCountry: Record<string, Station[]>;
  stations: Station[];
  activeCountry: string | null;
  theme: 'light' | 'dark';
  
  setStation: (station: Station) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setLoading: (loading: boolean) => void;
  setStationsByCountry: (country: string, stations: Station[]) => void;
  setStations: (stations: Station[]) => void;
  setActiveCountry: (country: string | null) => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStation: null,
  isPlaying: false,
  volume: 0.7,
  isLoading: false,
  stationsByCountry: {},
  stations: [],
  activeCountry: null,
  theme: 'light',

  setStation: (station) => set({ currentStation: station, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setLoading: (loading) => set({ isLoading: loading }),
  setStationsByCountry: (country, stations) => 
    set((state) => ({ 
      stationsByCountry: { ...state.stationsByCountry, [country]: stations } 
    })),
  setStations: (stations) => set({ stations }),
  setActiveCountry: (country) => set({ activeCountry: country }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
}));
