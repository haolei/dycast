/**
 * Signature utilities for Douyin live stream authentication
 */

/**
 * Generate signature for Douyin WebSocket connection using ByteDance acrawler
 * @param roomId - Room ID
 * @param uniqueId - Unique user ID
 * @returns Promise that resolves to generated signature string
 */
export function getSignature(roomId: string, uniqueId: string): Promise<string>;

/**
 * Generate MS token for API requests
 * @param length - Token length (default: 182)
 * @returns Generated MS token string
 */
export function getMsToken(length?: number): string;
