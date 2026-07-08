module.exports = {
  apps: [
    {
      name: 'popup-api',
      cwd: './',
      script: 'dist/server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
    },
    {
      name: 'popup-web',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 5173',
      env: {
        NODE_ENV: 'production',
      },
      instances: 1,
      autorestart: true,
    },
  ],
};
