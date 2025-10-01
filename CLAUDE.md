# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 + TypeScript application called "抖音弹幕姬" (Douyin Barrage姬) that captures and displays live chat messages from Douyin (TikTok) live streams. The application allows users to:

1. Connect to Douyin live rooms using room IDs
2. Receive real-time chat messages, gifts, likes, and other interactions
3. Display messages in categorized views
4. Forward messages to custom WebSocket endpoints

## Architecture

### Core Components

1. **Main Application** (`src/`)
   - Vue 3 application with TypeScript
   - Uses `vue-virtual-scroller` for efficient message rendering
   - Main view in `src/views/IndexView.vue`

2. **Core Library** (`src/core/`)
   - WebSocket connection handling (`dycast.ts`)
   - Protocol buffer message decoding (`model.ts`)
   - Signature generation for Douyin API (`signature.js`)
   - Event emitter system (`emitter.ts`)
   - HTTP request utilities (`request.ts`)
   - WebSocket relay functionality (`relay.ts`)

3. **Packaged Core Library** (`dycast-core/`)
   - Standalone NPM package built from `src/core/`
   - Contains build scripts in `scripts/package-core.js`
   - Can be published as `@dycast/core`

### Key Classes

1. **DyCast** (`src/core/dycast.ts`)
   - Main class for connecting to Douyin live streams
   - Handles WebSocket connection lifecycle
   - Manages reconnection logic
   - Emits events for different message types

2. **Message Types**
   - Chat messages (`WebcastChatMessage`)
   - Gift messages (`WebcastGiftMessage`)
   - Like messages (`WebcastLikeMessage`)
   - Member join/leave (`WebcastMemberMessage`)
   - Social interactions (`WebcastSocialMessage`)

## Development Commands

### Main Application

```bash
# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Build for production
pnpm run build

# Type checking
pnpm run type-check
```

### Core Library

```bash
# Package core library (copies src/core/ to dycast-core/)
node scripts/package-core.js

# Install core library dependencies
cd dycast-core && npm install

# Build core library (ESM + CJS + types)
cd dycast-core && npm run build:all

# Build with watch mode
cd dycast-core && npm run build:watch

# Type checking
cd dycast-core && npm run type-check

# Prepare for publishing
cd dycast-core && npm run prepublishOnly
```

### Test Project

```bash
# Navigate to test project
cd test-project

# Install dependencies
pnpm install

# Run development server
pnpm run dev

# Run proxy server (for testing core library)
pnpm run proxy
```

## Project Architecture

### Dual-Project Structure

The codebase consists of three main components:

1. **Main Application** (`/`): Vue 3 frontend application
2. **Core Library** (`/dycast-core/`): Standalone NPM package (`@dycast/core`)
3. **Test Project** (`/test-project/`): Integration testing environment

### Core Library Features

- **Browser & Server Support**: Built for both browser and Node.js environments
- **Proxy Server**: Built-in `DyCastServer` class for handling CORS and API routing
- **Multiple Entry Points**:
  - `@dycast/core` - Main browser library
  - `@dycast/core/server` - Server-only functionality
  - `@dycast/core/mssdk.js` - Microsoft SDK for signature generation

### Proxy Configuration

The application uses multiple proxy layers:

1. **Vite Development Proxy** (main app):
   - `/dylive` → `https://live.douyin.com`
   - `/socket` → Douyin WebSocket servers

2. **Standalone Proxy Server** (core library):
   - `DyCastServer` class provides proxy endpoints without Vite
   - Configurable ports and targets
   - Mobile User-Agent handling

This allows the application to bypass browser security restrictions when connecting to Douyin's services.

## Key Implementation Details

1. **Protocol Buffers**: Uses protobuf to decode binary WebSocket messages from Douyin
2. **Gzip Compression**: Handles compressed message payloads using the `pako` library
3. **Signature Generation**: Implements JavaScript-based signature generation for Douyin's WebSocket URLs using `mssdk.js`
4. **Message Parsing**: Converts raw protobuf messages to structured TypeScript objects
5. **Reconnection Logic**: Automatic reconnection with exponential backoff
6. **Heartbeat Monitoring**: Detects connection issues through periodic heartbeat checks
7. **Event-Driven Architecture**: Uses custom `Emitter` class for real-time message handling
8. **Message Relay**: `RelayCast` class for forwarding messages to external WebSocket endpoints

## Data Flow

1. User enters room ID in UI
2. Application fetches room information from Douyin API
3. Generates WebSocket URL with signature
4. Connects to WebSocket endpoint
5. Receives binary protobuf messages
6. Decodes messages using `model.ts` functions
7. Emits structured events through `Emitter`
8. UI displays messages in categorized views
9. Optionally forwards messages to custom WebSocket endpoints