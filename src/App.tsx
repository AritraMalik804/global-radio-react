import { useEffect } from 'react';
import Globe from './components/Globe';
import { UI } from './components/UI';
import { useAppStore } from './store';

function App() {
  const { isLoading, theme } = useAppStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

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
