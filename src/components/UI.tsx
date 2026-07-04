import React, { useState } from 'react';
import { Search, Globe2, RadioReceiver, MapPin, X } from 'lucide-react';
import { useAppStore } from '../store';
import type { Station } from '../store';
import { Player } from './Player';
import { fetchStationsForCountry } from '../services/radio';

export const UI = () => {
  const { currentStation, setStation, activeCountry, setActiveCountry } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [countryStations, setCountryStations] = useState<Station[]>([]);

  const handleCountrySearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    // Simple mock logic to search for a country Code by query string could be added,
    // but here we just fetch using it as a country code for simplicity
    const code = searchQuery.substring(0, 2).toUpperCase();
    const results = await fetchStationsForCountry(code, 20);
    setCountryStations(results);
    setActiveCountry(code);
    setIsSearching(false);
  };

  return (
    <div className="overlay-ui">
      <header className="pointer-events-auto">
        <div className="header-title">
          <h1 className="text-gradient font-display flex items-center gap-2">
            <Globe2 className="text-sky-400" /> GlobalRadio
          </h1>
          <p>Live Spatial Tuning</p>
        </div>

        <form className="search-bar hidden md:block" onSubmit={handleCountrySearch}>
          <Search className="icon" size={18} />
          <input 
            type="text" 
            placeholder="Search country code (e.g., US, JP, FR)..." 
            className="glass-panel"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="action-buttons">
          <button className="icon-btn glass-panel" title="Random Station">
            <RadioReceiver size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        {/* Left Side / Optional panels */}
        <div className="pointer-events-auto flex flex-col gap-4 mt-4">
            {/* Filters panel can go here */}
        </div>

        {/* Right Side Country Panel */}
        {activeCountry && (
          <div className="side-panel glass-panel pointer-events-auto animate-fade-in" style={{ animation: 'pulse-soft 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 className="font-display">Stations in {activeCountry}</h3>
              <button onClick={() => setActiveCountry(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            {isSearching ? (
              <div className="flex-center" style={{ height: '100px' }}>
                <span className="text-secondary">Loading...</span>
              </div>
            ) : (
              <div className="station-list">
                {countryStations.length === 0 ? (
                  <p className="text-secondary text-sm">No stations found.</p>
                ) : (
                  countryStations.map(station => (
                    <div 
                      key={station.id} 
                      className={`station-item ${currentStation?.id === station.id ? 'active' : ''}`}
                      onClick={() => setStation(station)}
                    >
                      <div className="station-name">{station.name}</div>
                      <div className="station-tags flex items-center gap-1">
                        <MapPin size={10} /> {station.country}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="pointer-events-auto">
        <Player />
      </footer>
    </div>
  );
};
