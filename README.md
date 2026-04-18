# RuuviTag Sniffer 1.0

A modern, robust Node.js application for sniffing local RuuviTag BLE broadcasts and forwarding the data to a remote API. It includes a beautiful web-based administrative dashboard for real-time tag viewing and dynamic configuration.

## Features
- **BLE Sniffing**: Uses `node-ruuvitag` to continuously read and decipher sensors.
- **Web Dashboard**: Modern glassmorphism UI offering real-time auto-updating previews of local tags using Server-Sent Events (SSE).
- **Persistent Configuration**: Change intervals, update target endpoints, and configure basic auth passwords seamlessly from the dashboard.
- **Dry Run Mode**: Test sensor reading and UI functionality natively without forwarding any HTTP payloads.

---

## Prerequisites

- Node.js version 24 (Latest Stable LTS). If you use `nvm`, simply run `nvm use` in the project root to load the correct version defined in `.nvmrc`.
- `npm` (Node Package Manager)
- Bluetooth capabilities on the host hardware
- On Linux, Node.js needs proper BLE permissions to access the raw Bluetooth stack without running as root:
  ```bash
  sudo setcap cap_net_raw+eip $(eval readlink -f `which node`)
  ```

---

## 🛠 Development Mode

When working on the application, use development mode to enable automatic hot-reloading using `nodemon`. The process will restart automatically if you change any files.

1. Ensure the correct Node.js version is active:
   ```bash
   nvm install
   nvm use
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate your browser to `http://localhost:8005`. (Note: The default credentials for the web panel are `admin:admin`)

---

## 🚀 Production Mode

For persistent setups (like a Raspberry Pi or a Linux server), it is highly recommended to use **PM2** process manager. This ensures the application runs quietly in the background and starts automatically on system boot.

1. Install PM2 globally (if you haven't already):
   ```bash
   npm install -g pm2
   ```

2. Start the service using the provided Ecosystem file:
   ```bash
   pm2 start ecosystem.config.cjs --env production
   ```

3. Save the process list so it respawns on device reboot:
   ```bash
   pm2 save
   pm2 startup
   ```

### Other Helpful PM2 Commands

- **View Logs**: `pm2 logs ruuvit-sniffer`
- **Restart Application**: `pm2 restart ruuvit-sniffer`
- **Stop Application**: `pm2 stop ruuvit-sniffer`
- **Monitor Dashboard**: `pm2 monit`

---

## Configuration Reference
Under the hood, all settings applied via the Web Panel are saved to `config.json`. If you need to manually modify it (or if you lose your Basic Auth password), you can safely edit or delete the file. The server will recreate a fresh default configuration on next startup if the file is missing.
