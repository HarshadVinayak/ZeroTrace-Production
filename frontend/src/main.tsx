import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import MobileApp from './mobile/MobileApp.tsx'

function AppSwitcher() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileApp /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSwitcher />
  </StrictMode>,
)
