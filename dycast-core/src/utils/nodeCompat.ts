/**
 * Node.js compatibility utilities
 * 
 * This module provides compatibility shims for running DyCast in Node.js environments
 * where browser APIs like WebSocket might not be available or need polyfills.
 */

// Global WebSocket polyfill for Node.js
export function setupNodeEnvironment() {
  // Check if we're in Node.js environment
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    try {
      // Try to use ws library if available
      const WebSocketLib = require('ws');
      
      // Polyfill WebSocket for Node.js if not already available
      if (typeof global.WebSocket === 'undefined') {
        global.WebSocket = WebSocketLib;
      }
      
    } catch (error: any) {
      console.warn('Failed to setup Node.js environment:', error?.message || 'Unknown error');
      console.warn('Make sure "ws" package is installed for WebSocket support in Node.js');
    }
  }
}