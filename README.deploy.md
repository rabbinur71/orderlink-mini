ORDERLINK-MINI — Deploy checklist

1. Build client:
   cd client
   npm ci
   npm run build

2. Build server:
   cd ../server
   npm ci
   npm run build

3. Copy files to server:
   - Copy `client/dist` to /var/www/orderlink/client/dist
   - Copy server `dist` and node_modules to /srv/orderlink/server

4. Configure nginx:
   - Use infra/nginx-orderlink.conf and set server_name
   - Enable site and reload nginx

5. Start server:
   - Install pm2
   - pm2 start ecosystem.config.js
   - pm2 save

6. Configure environment variables using OS-level secrets or service dashboard (DATABASE_URL, JWT_SECRET, FB/WA keys, etc.)

7. Set up domain with SSL (Certbot or your provider), ensure webhooks are reachable via HTTPS.