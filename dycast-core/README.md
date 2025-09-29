# @dycast/core

Core library for DyCast - Douyin live streaming message handling.

## Features

- 🚀 Real-time connection to Douyin live streams
- 💬 Parse chat messages, gifts, likes, and social interactions
- 🔄 Event-driven architecture with built-in emitter
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

## API Documentation

### Core Classes

- **DyCast**: Main class for connecting to live streams
- **Emitter**: Event emitter for handling real-time messages
- **Relay**: WebSocket relay functionality

### Message Types

- Chat messages
- Gift messages
- Like messages
- Member join/leave messages
- Social interactions
- Room statistics

### Utilities

- Message encoding/decoding
- Signature generation
- Request helpers
- Logging utilities

## Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Type checking
npm run type-check
```

## License

MIT
