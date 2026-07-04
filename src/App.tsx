import React from 'react';
import Globe from './components/Globe';
import { UI } from './components/UI';
import { useAppStore } from './store';
import { Loader2 } from 'lucide-react';

function App() {
  const { isLoading } = useAppStore();

  return (
    <>
      <Globe />
      <div className="reticle"></div>
      <UI />
      
      {isLoading && (
        <div className="loader-wrapper">
          <div className="loader-spinner"></div>
          <p className="font-display text-lg font-semibold text-gradient animate-pulse-soft">
            Tuning into frequencies...
          </p>
        </div>
      )}
    </>
  );
}

export default App;
