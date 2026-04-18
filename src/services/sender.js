import axios from 'axios';
import { getConfig } from './config.js';
import { getLatestTagsData } from './sniffer.js';

let intervalTimer = null;

// Helper to start or restart the timer based on config
export function startSender() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
  }

  const config = getConfig();
  const intervalMs = config.interval * 60 * 1000;

  console.log(`[SENDER] Starting sender loop with interval: ${config.interval} minutes`);
  
  // Initial run after interval
  intervalTimer = setInterval(processPush, intervalMs);
}

export function stopSender() {
  if (intervalTimer) {
    clearInterval(intervalTimer);
    intervalTimer = null;
    console.log('[SENDER] Stopped sender loop');
  }
}

async function processPush() {
  const config = getConfig();
  const tagsData = getLatestTagsData();

  if (tagsData.length === 0) {
    console.log('[SENDER] No tag data available to send.');
    return;
  }

  if (config.dryRun) {
    console.log('[DRY RUN - SENDER] Would have sent the following data:');
    console.log(JSON.stringify(tagsData, null, 2));
    return;
  }

  if (!config.mahtiruuviFunctionHost) {
    console.log('[SENDER] Cannot send data: "mahtiruuviFunctionHost" is not configured.');
    return;
  }

  for (const tag of tagsData) {
    try {
      const payload = {
        mac: tag.id,
        temperature: tag.temperature,
        pressure: tag.pressure,
        humidity: tag.humidity,
        battery: tag.battery,
        timestamp: tag.timestamp,
      };

      const url = `http://${config.mahtiruuviFunctionHost}/tagmeasurement/${tag.id}`;
      
      await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        }
      });
      console.log(`[SENDER] Successfully sent data for MAC: ${tag.id}`);
    } catch (error) {
      console.error(`[SENDER] Failed to send data for MAC: ${tag.id}. Error: ${error.message}`);
    }
  }
}
