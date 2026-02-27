module.exports = {
  apps: [{
    name: "talent-iq",
    script: "./talent-iq/server.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}
