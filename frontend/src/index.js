import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import './index.css';
import App from './App';

if (process.env.NODE_ENV === 'production') {
  const shouldReloadForChunkError = (message) => {
    if (!message) return false;
    return /ChunkLoadError|Loading chunk .* failed|CSS_CHUNK_LOAD_FAILED/i.test(String(message));
  };

  const reloadOnce = () => {
    const key = 'thuto_chunk_reload_once';
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  window.addEventListener('error', (event) => {
    const message = event?.message || event?.error?.message;
    if (shouldReloadForChunkError(message)) reloadOnce();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = event?.reason?.message || event?.reason;
    if (shouldReloadForChunkError(message)) reloadOnce();
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <DataProvider>
    <App />
    </DataProvider>
    </BrowserRouter>
  </React.StrictMode>
);