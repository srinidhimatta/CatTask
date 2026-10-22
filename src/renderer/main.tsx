import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { initWebAdapter } from './utils/webAdapter.js';

// If running in a web browser without Electron preload, initialize web persistence
initWebAdapter();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
