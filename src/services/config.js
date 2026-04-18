import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '..', '..', 'config.json');

const DEFAULT_CONFIG = {
  apiToken: '',
  mahtiruuviFunctionHost: '',
  interval: 5, // minutes
  username: 'admin',
  password: 'admin',
  dryRun: true,
  port: 8005,
};

let currentConfig = { ...DEFAULT_CONFIG };

export async function loadConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8');
    const userConfig = JSON.parse(data);
    currentConfig = { ...DEFAULT_CONFIG, ...userConfig };
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Create default config file if it doesn't exist
      await saveConfig(DEFAULT_CONFIG);
    } else {
      console.error('Error loading config:', error);
    }
  }
  return currentConfig;
}

export async function saveConfig(newConfig) {
  try {
    currentConfig = { ...currentConfig, ...newConfig };
    
    // Ensure interval format constraints
    if (currentConfig.interval < 5) currentConfig.interval = 5;
    if (currentConfig.interval > 60) currentConfig.interval = 60;

    await fs.writeFile(CONFIG_FILE, JSON.stringify(currentConfig, null, 2), 'utf-8');
    return currentConfig;
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

export function getConfig() {
  return currentConfig;
}
