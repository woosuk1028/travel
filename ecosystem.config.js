// PM2 process manifest. Place repo at /var/www/travel and run:
//   pm2 start ecosystem.config.js
//   pm2 save
//   pm2 startup    # follow the printed sudo command to enable boot
module.exports = {
  apps: [
    {
      name: 'travel-api',
      cwd: './nest',
      script: 'dist/main.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
      // .env in nest/ is loaded by @nestjs/config at runtime
    },
    {
      name: 'travel-web',
      cwd: './next',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
  ],
};
