module.exports = {
  apps: [{
    name: "ruuvit-sniffer",
    script: "./main.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
};
