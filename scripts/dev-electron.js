import { spawn } from 'node:child_process';
import http from 'node:http';
import electronPath from 'electron';

const VITE_PORT = process.env.VITE_DEV_PORT || 5173;
const VITE_URL = `http://localhost:${VITE_PORT}`;

function checkViteReady() {
  return new Promise((resolve) => {
    const req = http.get(VITE_URL, (res) => {
      if (res.statusCode && res.statusCode < 500) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function start() {
  console.log(`[CatTask] Waiting for Vite development server at ${VITE_URL}...`);
  let attempts = 0;
  while (attempts < 60) {
    const ready = await checkViteReady();
    if (ready) {
      console.log(`[CatTask] Vite server is ready! Launching Electron companion...`);
      break;
    }
    await new Promise((r) => setTimeout(r, 500));
    attempts++;
  }

  const child = spawn(electronPath, ['dist/main/main.js'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: VITE_URL,
      NODE_ENV: 'development'
    }
  });

  child.on('close', (code) => {
    process.exit(code || 0);
  });
}

start();
