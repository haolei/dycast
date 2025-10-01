import { defineConfig } from 'vite';

/**
 * Vite configuration for direct proxy to Douyin servers
 * This mimics the root project's proxy configuration
 */
export default defineConfig({
  server: {
    port: Number(process.env.CLIENT_PORT) || 5176,
    strictPort: true,
    open: true,
    proxy: {
      '/dylive': {
        target: 'https://live.douyin.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dylive/, ''),
        // Important: allow receiving Set-Cookie
        configure: proxy => {
          // Intercept request
          proxy.on('proxyReq', (proxyReq, req) => {
            const ua = req.headers['user-agent'] || '';
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            if (isMobile) {
              // Set User-Agent header identifier
              // Prevent mobile 302 redirect
              proxyReq.setHeader(
                'User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
              );
            }
            // Force modify Referer (may be invalid but doesn't affect)
            proxyReq.setHeader('Referer', 'https://live.douyin.com/');
          });
          // Intercept response
          proxy.on('proxyRes', proxyRes => {
            // Ensure set-cookie can be set normally to current domain
            const setCookie = proxyRes.headers['set-cookie'];
            if (setCookie) {
              // Remove Domain or replace with current domain
              const newCookie = setCookie.map(cookie =>
                cookie
                  .replace(/; Domain=[^;]+/i, '')
                  .replace(/; SameSite=None/, '')
                  .replace(/; Secure=true/i, '')
              );
              proxyRes.headers['set-cookie'] = newCookie;
            }
          });
        }
      },
      '/socket': {
        target: 'wss://webcast5-ws-web-lf.douyin.com',
        changeOrigin: true, // Keep original Host, beneficial for server to identify Cookie
        secure: true,
        ws: true, // Enable WebSocket proxy
        rewrite: path => path.replace(/^\/socket/, ''),
        configure: proxy => {
          proxy.on('proxyReqWs', (proxyReq, req) => {
            const ua = req.headers['user-agent'] || '';
            const isMobile = /mobile|android|iphone|ipad/i.test(ua);
            // Here you can choose not to set it
            if (isMobile) {
              // Set User-Agent header identifier
              proxyReq.setHeader(
                'User-Agent',
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0'
              );
            }
          });
        }
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});