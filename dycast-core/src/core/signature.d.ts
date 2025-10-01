/**
 * 获取链接签名
 * @param roomId - 房间ID
 * @param uniqueId - 用户唯一ID
 * @returns signature string
 */
export declare function getSignature(roomId: string, uniqueId: string): string;

/**
 * 获取一个 msToken
 * @param length - token长度，默认182
 * @returns msToken string
 */
export declare function getMsToken(length?: number): string;