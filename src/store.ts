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
  activeCountry: string | null;
  
  setStation: (station: Station) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  setLoading: (loading: boolean) => void;
  setStationsByCountry: (country: string, stations: Station[]) => void;
  setActiveCountry: (country: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentStation: null,
  isPlaying: false,
  volume: 0.7,
  isLoading: false,
  stationsByCountry: {},
  activeCountry: null,

  setStation: (station) => set({ currentStation: station, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setLoading: (loading) => set({ isLoading: loading }),
  setStationsByCountry: (country, stations) => 
    set((state) => ({ 
      stationsByCountry: { ...state.stationsByCountry, [country]: stations } 
    })),
  setActiveCountry: (country) => set({ activeCountry: country }),
}));
