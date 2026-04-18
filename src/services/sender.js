import axios from 'axios';
import { getConfig } from './config.js';
import { snifferEvents } from './sniffer.js';
import { addLog } from './logger.js';

// Map to track when each tag was last sent
// Key: mac, Value: timestamp (Date.now())
const lastSentMap = new Map();

// Helper flag so we don't spam duplicate bindings
let isRunning = false;

export function startSender() {
  if (isRunning) return;
  
  const config = getConfig();
  addLog(`[SENDER] Event-driven sender started with interval constraint: ${config.interval} minutes`);
  
  snifferEvents.on('updated', handleTagUpdate);
  isRunning = true;
}

export function stopSender() {
  if (!isRunning) return;
  
  snifferEvents.off('updated', handleTagUpdate);
  isRunning = false;
  addLog('[SENDER] Stopped sender event listener');
}

async function handleTagUpdate(tagData) {
  const config = getConfig();
  const intervalMs = config.interval * 60 * 1000;
  const now = Date.now();
  const lastSent = lastSentMap.get(tagData.id) || 0;

  // Check if enough time has passed since this specific tag was last sent
  // (or if it has never been sent, in which case lastSent is 0)
  if (now - lastSent >= intervalMs) {
    if (config.dryRun) {
      addLog(`[DRY RUN - SENDER] Would have sent data for newly discovered or updated tag MAC: ${tagData.id}`);
      lastSentMap.set(tagData.id, now);
      return;
    }

    if (!config.mahtiruuviFunctionHost) {
      addLog('[SENDER] Cannot send data: "mahtiruuviFunctionHost" is not configured.', 'error');
      // Intentionally NOT updating lastSentMap so it retries as soon as host is configured
      return;
    }

    // Set it immediately to prevent duplicate concurrent triggers for the same tag
    lastSentMap.set(tagData.id, now);

    try {
      const payload = {
        mac: tagData.id,
        temperature: tagData.temperature,
        pressure: tagData.pressure,
        humidity: tagData.humidity,
        battery: tagData.battery,
        timestamp: tagData.timestamp,
      };

      const url = config.mahtiruuviFunctionHost;
      
      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        }
      });
      addLog(`[SENDER] Successfully sent data for MAC: ${tagData.id}`);
    } catch (error) {
      addLog(`[SENDER] Failed to send data for MAC: ${tagData.id}. Error: ${error.message}`, 'error');
      // If it fails, maybe we want to reset the timer to try again earlier? 
      // For now, it will just wait for the next interval to retry.
    }
  }
}
