import { spawn } from 'node:child_process';
import electronPath from 'electron';

console.log('🐾 Launching CatTask in Electron for smoke testing...');

const child = spawn(electronPath, ['dist/main/main.js'], {
  stdio: 'pipe',
  env: {
    ...process.env,
    TEST_MODE: '1'
  }
});

let output = '';
child.stdout.on('data', (d) => {
  const text = d.toString();
  output += text;
  process.stdout.write(text);
});

child.stderr.on('data', (d) => {
  const text = d.toString();
  output += text;
  process.stderr.write(text);
});

// Give Electron 5 seconds to boot windows and initialize
const timer = setTimeout(() => {
  console.log('✅ CatTask companion successfully launched and ran for 5 seconds without crashing.');
  console.log('Stopping test process...');
  child.kill();
  process.exit(0);
}, 5000);

child.on('close', (code) => {
  clearTimeout(timer);
  if (code === 0 || code === null) {
    console.log('✅ Electron process closed cleanly.');
    process.exit(0);
  } else {
    console.error(`❌ Electron exited prematurely with code ${code}`);
    process.exit(code);
  }
});
