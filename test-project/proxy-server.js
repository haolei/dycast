import net from 'node:net';

let createDyCastServer;
const originalArgv1 = process.argv[1];
if (originalArgv1 && /server\.(cjs|mjs|js)$/i.test(originalArgv1)) {
  process.argv[1] = originalArgv1.replace(/server\.(cjs|mjs|js)$/i, 'proxy.$1');
}
try {
  ({ createDyCastServer } = await import('@dycast/core/server'));
} finally {
  process.argv[1] = originalArgv1;
}

const desiredPort = Number(process.env.PORT ?? process.env.PROXY_PORT) || 3001;
const host = process.env.HOST || process.env.PROXY_HOST || '0.0.0.0';
const debug = process.env.DEBUG === 'true' || process.env.DYCAST_DEBUG === 'true';

/**
 * @param {number} port
 * @param {string} bindHost
 * @returns {Promise<number>}
 */
async function findAvailablePort(port, bindHost) {
  let candidate = port;
  while (candidate < port + 50) {
    try {
      await new Promise((resolve, reject) => {
        const tester = net.createServer();
        tester.once('error', (err) => {
          tester.close();
          reject(err);
        });
        tester.once('listening', () => {
          tester.close(() => resolve());
        });
        tester.listen(candidate, bindHost);
      });
      return candidate;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'EADDRINUSE') {
        candidate += 1;
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Unable to find free port in range ${port}-${port + 49}`);
}

const activePort = await findAvailablePort(desiredPort, host);
if (activePort !== desiredPort) {
  console.warn(`⚠️  Port ${desiredPort} is busy. Using ${activePort} instead.`);
}

const server = createDyCastServer({
  port: activePort,
  host,
  debug
});

server
  .start()
  .then(() => {
    console.log(`✅ DyCast proxy server is running at http://${host}:${activePort}`);
    console.log(`🔍 [DEBUG] Debug mode: ${debug}`);

    // Add WebSocket connection debugging after server starts
    server.wss.on('connection', (ws, req) => {
      console.log('🔍 [DEBUG] WebSocket connection received');
      console.log('🔍 [DEBUG] Request URL:', req.url);
      console.log('🔍 [DEBUG] Request headers:', req.headers);

      // Add additional debugging for WebSocket URL construction
      const originalPath = req.url?.replace(/^\/socket/, '') || '';
      const targetUrl = server.config.socketTarget + originalPath;
      console.log('🔍 [DEBUG] Original path after replacement:', originalPath);
      console.log('🔍 [DEBUG] Target WebSocket URL:', targetUrl);
    });
  })
  .catch((error) => {
    console.error('Failed to start DyCast proxy server:', error);
    process.exit(1);
  });

const shutdown = () => {
  console.log('\n🛑 Stopping DyCast proxy server...');
  server.stop().then(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
