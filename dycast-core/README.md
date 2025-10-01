# @dycast/core

Core library for DyCast - Douyin live streaming message handling with server proxy support.

## Features

- 🚀 Real-time connection to Douyin live streams
- 💬 Parse chat messages, gifts, likes, and social interactions
- 🔄 Event-driven architecture with built-in emitter
- 🖥️ Built-in proxy server for handling CORS and API access
- 📦 TypeScript support with full type definitions
- 🛠 Modular design for easy integration

## Installation

```bash
npm install @dycast/core
# or
yarn add @dycast/core
# or
pnpm add @dycast/core
```

## Quick Start

### Client Usage

```typescript
import { DyCast } from '@dycast/core';

const dycast = new DyCast();

// Connect to a live room
dycast.connect('room_id_here').then(() => {
  console.log('Connected to live room!');
});

// Listen for chat messages
dycast.on('chat', (message) => {
  console.log(`${message.user?.nickname}: ${message.content}`);
});

// Listen for gifts
dycast.on('gift', (gift) => {
  console.log(`${gift.user?.nickname} sent ${gift.giftName}`);
});
```

### Server Usage (Proxy for Web Applications)

```typescript
import { createDyCastServer } from '@dycast/core/server';

const server = createDyCastServer({
  port: 3001,
  host: '0.0.0.0',
  debug: true
});

server.start().then(() => {
  console.log('🚀 DyCast proxy server started!');
  console.log('📡 /dylive -> https://live.douyin.com');
  console.log('📡 /socket -> wss://webcast5-ws-web-lf.douyin.com');
});
```

### Web Integration

Include `mssdk.js` in your HTML and use the proxy endpoints:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="./node_modules/@dycast/core/public/mssdk.js"></script>
</head>
<body>
    <script>
        // Use proxy endpoints for web development
        fetch('http://localhost:3001/dylive/148108118778')
          .then(response => response.text())
          .then(data => console.log('Live room data:', data));

        // WebSocket connection through proxy
        const ws = new WebSocket('ws://localhost:3001/socket/webcast/im/push/v2/');
    </script>
</body>
</html>
```

## API Documentation

### Core Classes

- **DyCast**: Main class for connecting to live streams
- **DyCastServer**: Proxy server for web applications
- **Emitter**: Event emitter for handling real-time messages
- **RelayCast**: WebSocket relay functionality

### Message Types

- Chat messages
- Gift messages
- Like messages
- Member join/leave messages
- Social interactions
- Room statistics

### Server Configuration

```typescript
interface ServerConfig {
  port?: number;           // Default: 3001
  host?: string;           // Default: '0.0.0.0'
  dyliveTarget?: string;   // Default: 'https://live.douyin.com'
  socketTarget?: string;   // Default: 'wss://webcast5-ws-web-lf.douyin.com'
  cors?: boolean;          // Default: true
  debug?: boolean;         // Default: false
}
```

### Proxy Endpoints

When running the server, the following endpoints are available:

- **Health Check**: `GET /health`
- **Live API Proxy**: `GET /dylive/*` → `https://live.douyin.com/*`
- **WebSocket Proxy**: `ws://host:port/socket/*` → `wss://webcast5-ws-web-lf.douyin.com/*`

## Assets

The library includes the following public assets:

- `public/mssdk.js`: Required JavaScript SDK for web integration

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build:all

# Type checking
npm run type-check
```

## License

MIT
