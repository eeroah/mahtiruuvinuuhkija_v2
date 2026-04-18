import { loadConfig } from './src/services/config.js';
import { initSniffer } from './src/services/sniffer.js';
import { startSender } from './src/services/sender.js';
import { initWebServer } from './src/web/server.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env variables first, which might override or set initials
dotenv.config({ path: path.join(__dirname, '.env') });

async function bootstrap() {
  console.log('--- Starting RuuviTag Sniffer 2.0 ---');
  
  // 1. Load configuration from file
  console.log('Loading configuration...');
  await loadConfig();
  
  // 2. Initialize RuuviTag sniffer
  console.log('Initializing BLE Sniffer...');
  initSniffer();
  
  // 3. Start interval-based sender
  console.log('Starting tag data sender service...');
  startSender();
  
  // 4. Start Web Server
  console.log('Initializing Web Admin Panel...');
  initWebServer();
  
  console.log('--- Setup Complete ---');
}

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION at:', promise, 'reason:', reason);
});

bootstrap();
