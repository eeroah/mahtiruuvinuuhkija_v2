import { EventEmitter } from 'events';

const MAX_LOGS = 1000;
const logs = [];

export const loggerEvents = new EventEmitter();

export function addLog(message, level = 'info') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message
  };

  logs.push(logEntry);

  if (logs.length > MAX_LOGS) {
    logs.shift(); // Remove oldest
  }

  // Also print to console
  if (level === 'error') {
    console.error(`[${logEntry.timestamp}] ERROR: ${message}`);
  } else {
    console.log(`[${logEntry.timestamp}] ${message}`);
  }

  loggerEvents.emit('newLog', logEntry);
}

export function getLogs() {
  return logs;
}
