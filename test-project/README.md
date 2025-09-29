# DyCast Test Project

This is a test project demonstrating the usage of `@dycast/core` library for connecting to Douyin live streams.

## Features

- ✅ Proxy server for `/dylive` and `/socket` endpoints
- ✅ Web interface for testing live stream connections
- ✅ Real-time message handling simulation
- ✅ Health check endpoints
- ✅ CORS support for web development

## Quick Start

### 1. Build the core library

```bash
# From the dycast-fork root directory
cd dycast-core
npm install
npm run build
```

### 2. Install test project dependencies

```bash
cd ../test-project
npm install
```

### 3. Start the proxy server

```bash
npm start
```

This will start the DyCast proxy server on `http://localhost:3001`

### 4. Start the web interface (in another terminal)

```bash
npm run serve
```

This will start a static file server on `http://localhost:8080`

## Testing the Connection

1. Open `http://localhost:8080` in your browser
2. Enter a live room ID (e.g., `148108118778`)
3. Click "连接" (Connect) to test the connection
4. Monitor the message flow and connection status

## API Endpoints

### Proxy Server (localhost:3001)

- **Health Check**: `GET /health`
- **Live API Proxy**: `GET /dylive/{room_id}` → `https://live.douyin.com/{room_id}`
- **WebSocket Proxy**: `ws://localhost:3001/socket/*` → `wss://webcast5-ws-web-lf.douyin.com/*`

### Web Interface (localhost:8080)

- **Main Page**: `http://localhost:8080/`
- **Static Assets**: All files in the `public/` directory

## Architecture

```
┌─────────────────┐    HTTP/WS     ┌──────────────────┐    HTTPS/WSS    ┌─────────────────┐
│   Web Browser   │ ──────────────► │  DyCast Server   │ ───────────────► │ Douyin Live API │
│  (localhost:8080) │                │ (localhost:3001) │                  │                 │
└─────────────────┘                └──────────────────┘                  └─────────────────┘
```

The DyCast Server acts as a proxy, handling CORS issues and providing a unified interface for both HTTP API calls and WebSocket connections to Douyin's live streaming services.

## Environment Variables

You can customize the server configuration using environment variables:

```bash
export PORT=3001          # Server port
export HOST=0.0.0.0       # Server host
export DEBUG=true         # Enable debug logging
```

## Troubleshooting

### Connection Issues

1. **Proxy server not responding**: Check if the server is running on port 3001
2. **CORS errors**: Make sure you're accessing the web interface through the static server
3. **Live room not found**: Verify the room ID is correct and the stream is active

### Debug Mode

Enable debug mode to see detailed request/response logs:

```bash
DEBUG=true npm start
```

This will show all proxy requests and WebSocket message exchanges in the console.

## Integration Example

Here's how to use the DyCast Core library in your own projects:

```javascript
const { createDyCastServer, DyCast } = require('@dycast/core');

// Start proxy server
const server = createDyCastServer({
  port: 3001,
  debug: true
});

server.start().then(() => {
  console.log('Proxy server started');
  
  // Use DyCast client with the proxy
  const dycast = new DyCast();
  dycast.on('chat', (message) => {
    console.log(`${message.user?.nickname}: ${message.content}`);
  });
  
  dycast.connect('148108118778').then(() => {
    console.log('Connected to live room');
  });
});
```

## Next Steps

- Customize the web interface for your specific needs
- Integrate with your existing applications
- Add authentication and rate limiting as needed
- Deploy to production with proper security measures