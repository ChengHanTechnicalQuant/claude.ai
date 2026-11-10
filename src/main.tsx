import '@fontsource/noto-sans-tc/chinese-traditional-400.css';
import '@fontsource/noto-sans-tc/chinese-traditional-500.css';
import '@fontsource/noto-sans-tc/chinese-traditional-700.css';
import '@fontsource/noto-sans-tc/latin-400.css';
import '@fontsource/noto-sans-tc/latin-500.css';
import '@fontsource/noto-sans-tc/latin-700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './styles.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App';
import { db } from './db/db';
import { purgeExpired, rolloverDb, seedIfFirstRun } from './db/maintenance';
import { todayISO } from './lib/dates';

async function boot() {
  try {
    await db.open();
    await purgeExpired(db);
    await seedIfFirstRun(db, todayISO());
    await rolloverDb(db, todayISO());
  } catch (e) {
    console.error('資料庫啟動失敗', e);
  }
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

boot();

if (import.meta.env.PROD) registerSW({ immediate: true });
