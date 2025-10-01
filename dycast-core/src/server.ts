/**
 * DyCast Server - Proxy server for handling Douyin live streaming APIs
 *
 * This server provides proxy functionality for:
 * - /dylive: Douyin live API proxy
 * - /socket: WebSocket proxy for real-time messaging
 *
 * Uses Node.js native modules for robust proxy handling
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { request as httpsRequest } from 'https';
import { request as httpRequest } from 'http';
import { URL } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

export interface ServerConfig {
  port?: number;
  host?: string;
  dyliveTarget?: string;
  socketTarget?: string;
  cors?: boolean;
  debug?: boolean;
}

export class DyCastServer {
  private server: any;
  private wss: WebSocketServer | null = null;
  private config: Required<ServerConfig>;

  constructor(config: ServerConfig = {}) {
    this.config = {
      port: config.port || 3001,
      host: config.host || '0.0.0.0',
      dyliveTarget: config.dyliveTarget || 'https://live.douyin.com',
      socketTarget: config.socketTarget || 'wss://webcast5-ws-web-lf.douyin.com',
      cors: config.cors !== false,
      debug: config.debug || false
    };
  }

  private log(message: string, ...args: any[]) {
    if (this.config.debug) {
      console.log(`[DyCastServer] ${message}`, ...args);
    }
  }

  private setupCORS(res: ServerResponse) {
    if (this.config.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Referer');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }

  private getDesktopUserAgent(userAgent?: string): string {
    if (!userAgent) {
      return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0';
    }

    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    if (isMobile) {
      return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36 Edg/136.0.0.0';
    }

    return userAgent;
  }

  private proxyRequest(req: IncomingMessage, res: ServerResponse, targetUrl: string) {
    const url = new URL(targetUrl + (req.url?.replace(/^\/dylive/, '') || ''));
    const isHttps = url.protocol === 'https:';
    const requestModule = isHttps ? httpsRequest : httpRequest;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: req.method,
      headers: {
        ...req.headers,
        host: url.hostname,
        'User-Agent': this.getDesktopUserAgent(req.headers['user-agent'] as string),
        'Referer': 'https://live.douyin.com/'
      }
    };

    this.log('Proxying HTTP request:', req.method, url.toString());

    const proxyReq = requestModule(options, (proxyRes) => {
      // Handle set-cookie headers
      if (proxyRes.headers['set-cookie']) {
        const newCookies = proxyRes.headers['set-cookie'].map((cookie: string) =>
          cookie
            .replace(/; Domain=[^;]+/i, '')
            .replace(/; SameSite=None/, '')
            .replace(/; Secure=true/i, '')
        );
        proxyRes.headers['set-cookie'] = newCookies;
      }

      // Set up CORS headers before writing response headers
      if (this.config.cors) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, User-Agent, Referer';
        proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
      }

      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res);

      this.log('Proxy response:', proxyRes.statusCode);
    });

    proxyReq.on('error', (error) => {
      console.error('Proxy request error:', error);
      if (this.config.cors) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, User-Agent, Referer');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy error', message: error.message }));
    });

    req.pipe(proxyReq);
  }

  private setupWebSocketProxy() {
    this.wss = new WebSocketServer({ noServer: true });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      this.log('WebSocket connection established');
      this.log('Client WebSocket headers:', req.headers);

      // Create connection to target WebSocket server
      // Preserve the full path and query parameters from the original request
      // The client sends: /socket/webcast/im/push/v2/?params...
      // We need to map this to: /webcast/im/push/v2/?params...
      const originalPath = req.url?.replace(/^\/socket/, '') || '';
      const targetUrl = this.config.socketTarget + originalPath;

      this.log('Original request URL:', req.url);
      this.log('Original path after replacement:', originalPath);
      this.log('Target WebSocket URL:', targetUrl);

      // Enhanced headers for WebSocket connection - preserve all authentication headers
      // Remove conflicting headers from original request before merging
      const { origin, referer, ...filteredHeaders } = req.headers;
      const enhancedHeaders = {
        ...filteredHeaders,
        'User-Agent': this.getDesktopUserAgent(req.headers['user-agent'] as string),
        'Origin': 'https://live.douyin.com',
        'Referer': 'https://live.douyin.com/',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'Sec-WebSocket-Version': '13'
      };

      // Ensure cookies are preserved for authentication
      if (req.headers.cookie) {
        enhancedHeaders['cookie'] = req.headers.cookie;
      }

      this.log('WebSocket connection headers:', enhancedHeaders);

      const targetWs = new WebSocket(targetUrl, {
        headers: enhancedHeaders,
        perMessageDeflate: false
      });

      // Enhanced logging for WebSocket lifecycle
      targetWs.on('open', () => {
        this.log('✅ Connected to target WebSocket server');
      });

      // Forward messages from client to target
      ws.on('message', (data) => {
        if (targetWs.readyState === WebSocket.OPEN) {
          targetWs.send(data);
          this.log('📤 Message sent to target WebSocket');
        } else {
          this.log('⚠️  Cannot send message - target WebSocket not open, state:', targetWs.readyState);
        }
      });

      // Forward messages from target to client
      targetWs.on('message', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
          this.log('📥 Message received from target WebSocket');
        } else {
          this.log('⚠️  Cannot forward message - client WebSocket not open, state:', ws.readyState);
        }
      });

      // Handle errors with detailed logging
      targetWs.on('error', (error) => {
        console.error('❌ Target WebSocket error:', error);
        this.log('❌ Target WebSocket error details:', {
          message: error.message,
          stack: error.stack,
          targetUrl: targetUrl,
          headers: enhancedHeaders
        });
        ws.close(1011, 'Target WebSocket error');
      });

      ws.on('error', (error) => {
        console.error('❌ Client WebSocket error:', error);
        targetWs.close();
      });

      // Handle disconnections
      ws.on('close', (code, reason) => {
        this.log('🔌 Client WebSocket disconnected:', { code, reason: reason.toString() });
        targetWs.close();
      });

      targetWs.on('close', (code, reason) => {
        this.log('🔌 Target WebSocket disconnected:', { code, reason: reason.toString() });
        this.log('Target WebSocket close details:', {
          code,
          reason: reason.toString(),
          targetUrl,
          timestamp: new Date().toISOString()
        });
        ws.close();
      });
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.setupWebSocketProxy();

        this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
          const url = new URL(req.url || '', `http://${req.headers.host}`);

          // Handle CORS preflight requests
          if (req.method === 'OPTIONS') {
            this.setupCORS(res);
            res.writeHead(200);
            res.end();
            return;
          }

          // Route dylive requests
          if (url.pathname.startsWith('/dylive')) {
            this.proxyRequest(req, res, this.config.dyliveTarget);
            return;
          }

          // Health check endpoint
          if (url.pathname === '/health') {
            this.setupCORS(res);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'ok',
              timestamp: new Date().toISOString(),
              config: {
                port: this.config.port,
                host: this.config.host,
                dyliveTarget: this.config.dyliveTarget,
                socketTarget: this.config.socketTarget
              }
            }));
            return;
          }

          // Default 404 response
          this.setupCORS(res);
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Not found' }));
        });

        // Handle WebSocket upgrade
        this.server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
          const url = new URL(request.url || '', `http://${request.headers.host}`);

          if (url.pathname.startsWith('/socket')) {
            this.wss?.handleUpgrade(request, socket, head, (ws) => {
              this.wss?.emit('connection', ws, request);
            });
          } else {
            socket.destroy();
          }
        });

        this.server.listen(this.config.port, this.config.host, () => {
          console.log(`🚀 DyCast Server started on http://${this.config.host}:${this.config.port}`);
          console.log(`📡 Proxy endpoints:`);
          console.log(`   - /dylive -> ${this.config.dyliveTarget}`);
          console.log(`   - /socket -> ${this.config.socketTarget}`);
          console.log(`📊 Health check: http://${this.config.host}:${this.config.port}/health`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          console.error('Server error:', error);
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
        this.wss = null;
      }

      if (this.server) {
        this.server.close(() => {
          console.log('🛑 DyCast Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getServerInfo() {
    return {
      config: this.config,
      running: !!this.server?.listening
    };
  }
}

// Export default instance creator
export function createDyCastServer(config?: ServerConfig): DyCastServer {
  return new DyCastServer(config);
}

// CLI support
if (process.argv[1] && (process.argv[1].endsWith('server.js') || process.argv[1]?.endsWith('server.mjs'))) {
  const server = new DyCastServer({
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || '0.0.0.0',
    debug: process.env.DEBUG === 'true'
  });

  server.start().catch(console.error);

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.stop().then(() => process.exit(0));
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.stop().then(() => process.exit(0));
  });
}