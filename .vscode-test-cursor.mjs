import { defineConfig } from '@vscode/test-cli';
import process from 'process';

// Resolve Cursor executable path. Override with CURSOR_EXECUTABLE_PATH env var if needed.
const cursorPath =
  process.env.CURSOR_EXECUTABLE_PATH ||
  // Windows default install location
  (process.platform === 'win32'
    ? `${process.env.LOCALAPPDATA}/Programs/cursor/Cursor.exe`
    : process.platform === 'darwin'
    ? '/Applications/Cursor.app/Contents/MacOS/Cursor'
    : '/usr/bin/cursor');

export default defineConfig([
  {
    files: 'dist/test/e2e/suite/**/*.test.js',
    useInstallation: { fromPath: cursorPath },
    mocha: {
      ui: 'tdd',
      timeout: 20000,
    },
  },
]);
