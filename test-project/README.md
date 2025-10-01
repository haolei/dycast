# DyCast Core Test Project

This lightweight playground lets you exercise `@dycast/core` end-to-end:

- A Node-based proxy server (powered by `@dycast/core/server`) that handles Douyin live APIs and WebSocket relays.
- A Vite + TypeScript front-end that uses the browser SDK to connect to a live room and inspect realtime messages.

## Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

## Install dependencies

```bash
pnpm install
```

## Start the proxy server

```bash
pnpm run proxy
```

Environment variables:

- `PORT` (default `3001`) – HTTP/WebSocket port for the proxy server.
- `HOST` (default `127.0.0.1`) – bind host.
- `DEBUG=true` – enable verbose logging.

## Launch the client playground

With the proxy running in another terminal:

```bash
pnpm run dev
```

This starts Vite on `http://localhost:5175`. The dev server automatically proxies `/dylive` and `/socket` requests to the proxy server so the browser SDK can complete its handshake.

## Build for production

```bash
pnpm run build
```

The compiled assets are emitted to `dist/`.

## How it works

1. The proxy server exposes `/dylive` and `/socket` endpoints that forward traffic to Douyin, handling headers, cookies, and WebSocket bridging.
2. The client app spins up a `DyCast` instance, listens for events (open, message, close, reconnect, error), and streams structured logs straight to the UI.
3. Use any public Douyin room number to verify the end-to-end flow. Toggle auto-scroll, disconnect, or clear the log as needed.
