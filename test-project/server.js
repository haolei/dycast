// Test server using DyCast Core server-only functionality
const { createDyCastServer } = require('@dycast/core/server');

const server = createDyCastServer({
  port: 3001,
  host: '0.0.0.0',
  debug: true,
  dyliveTarget: 'https://live.douyin.com',
  socketTarget: 'wss://webcast5-ws-web-lf.douyin.com'
});

console.log('🚀 Starting DyCast Proxy Server...');
console.log('📋 This server provides proxy endpoints only - DyCast client runs in browser');

server.start()
  .then(() => {
    console.log('✅ Proxy server started successfully!');
    console.log('');
    console.log('📡 Available endpoints:');
    console.log('  - Health check: http://localhost:3001/health');
    console.log('  - Live API proxy: http://localhost:3001/dylive/[room_id]');
    console.log('  - WebSocket proxy: ws://localhost:3001/socket/webcast/im/push/v2/');
    console.log('');
    console.log('🌐 Test the web interface:');
    console.log('  1. Start web server: npm run serve');
    console.log('  2. Open: http://localhost:8080');
    console.log('');
    console.log('💡 The DyCast client will run in the browser and use these proxy endpoints');
  })
  .catch((error) => {
    console.error('❌ Failed to start proxy server:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down proxy server...');
  server.stop().then(() => {
    console.log('✅ Proxy server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down proxy server...');
  server.stop().then(() => {
    console.log('✅ Proxy server stopped');
    process.exit(0);
  });
});