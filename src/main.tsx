import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OfflineIndicator } from './components/OfflineIndicator';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
    <OfflineIndicator />
  </ErrorBoundary>
);

