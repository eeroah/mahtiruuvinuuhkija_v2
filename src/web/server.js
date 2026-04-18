import express from 'express';
import basicAuth from 'express-basic-auth';
import mustacheExpress from 'mustache-express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getConfig, saveConfig } from '../services/config.js';
import { getLatestTagsData, snifferEvents } from '../services/sniffer.js';
import { startSender } from '../services/sender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function initWebServer() {
  const app = express();
  const config = getConfig();

  // Basic Auth setup
  app.use(basicAuth({
    users: { [config.username]: config.password },
    challenge: true,
    realm: 'RuuviTag Sniffer 2.0',
  }));

  // Express middleware
  app.use(express.urlencoded({ extended: true }));
  
  // Set up Mustache engine
  app.engine('mustache', mustacheExpress());
  app.set('view engine', 'mustache');
  app.set('views', path.join(__dirname, 'views'));

  // Serve static assets
  app.use('/public', express.static(path.join(__dirname, 'public')));

  // Routes
  app.get('/', (req, res) => {
    const currentConfig = getConfig();
    const tags = getLatestTagsData();
    
    // Format timestamp for display
    const formattedTags = tags.map(tag => ({
      ...tag,
      temperature: tag.temperature.toFixed(2),
      humidity: tag.humidity.toFixed(2),
      pressure: (tag.pressure / 100).toFixed(2), // typically hPa
      battery: (tag.battery / 1000).toFixed(2), // Volts
      timeFormatted: new Date(tag.timestamp).toLocaleTimeString(),
    }));

    res.render('index', {
      config: currentConfig,
      tags: formattedTags,
      hasTags: formattedTags.length > 0,
      dryRunChecked: currentConfig.dryRun ? 'checked' : ''
    });
  });

  // Server-Sent Events endpoint for live updates
  app.get('/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders(); // flush the headers to establish SSE

    const onUpdate = (measurement) => {
      // Format before sending via SSE
      const formatted = {
        ...measurement,
        temperature: measurement.temperature.toFixed(2),
        humidity: measurement.humidity.toFixed(2),
        pressure: (measurement.pressure / 100).toFixed(2),
        battery: (measurement.battery / 1000).toFixed(2),
        timeFormatted: new Date(measurement.timestamp).toLocaleTimeString(),
      };
      res.write(`data: ${JSON.stringify(formatted)}\n\n`);
    };

    snifferEvents.on('updated', onUpdate);

    req.on('close', () => {
      snifferEvents.off('updated', onUpdate);
      res.end();
    });
  });

  app.post('/update-config', async (req, res) => {
    const {
      apiToken,
      mahtiruuviFunctionHost,
      interval,
      username,
      password,
      dryRun
    } = req.body;

    try {
      await saveConfig({
        apiToken,
        mahtiruuviFunctionHost,
        interval: parseInt(interval, 10),
        username,
        password: password ? password : undefined, // only update if provided
        dryRun: dryRun === 'on'
      });
      
      // Update sender interval if needed
      startSender();

      res.redirect('/?success=1');
    } catch (error) {
      res.redirect('/?error=1');
    }
  });

  app.listen(config.port, () => {
    console.log(`[WEB] Admin panel running on port ${config.port}`);
  });
}
