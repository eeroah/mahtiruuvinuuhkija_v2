import ruuvi from 'node-ruuvitag';
import { getConfig } from './config.js';

import { EventEmitter } from 'events';

// Map to hold the latest data for each tag
// Key: tag id (mac), Value: measurement data
const tagDataMap = new Map();
export const snifferEvents = new EventEmitter();

export function initSniffer() {
  ruuvi.on('found', tag => {
    // Initial entry
    if (!tagDataMap.has(tag.id)) {
      tagDataMap.set(tag.id, {
        id: tag.id,
        humidity: 0,
        pressure: 0,
        temperature: 0,
        battery: 0,
        timestamp: Date.now(),
      });
    }

    tag.on('updated', data => {
      // Update with latest data
      let macRaw = data.mac || tag.id;
      const mac = macRaw.replace(/:/g, '').toLowerCase();
      const measurement = {
        id: mac,
        humidity: data.humidity || 0,
        pressure: data.pressure || 0,
        temperature: data.temperature || 0,
        battery: data.battery || 0,
        timestamp: Date.now(),
      };
      tagDataMap.set(tag.id, measurement);
      
      // Emit event for SSE
      snifferEvents.emit('updated', measurement);
      
      const config = getConfig();
      if (config.dryRun) {
        console.log(`[DRY RUN - SNIFFER] Updated tag ${mac}: Temp ${data.temperature}°C, Hum ${data.humidity}%, Pres ${data.pressure}Pa`);
      }
    });
  });

  ruuvi.on('warning', message => {
    console.error('[SNIFFER] Warning:', message);
  });
}

export function getLatestTagsData() {
  // Return an array of the current tag data map
  return Array.from(tagDataMap.values());
}
