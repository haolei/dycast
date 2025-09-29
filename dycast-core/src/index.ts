/**
 * @dycast/core - Core library for DyCast
 * 
 * This library provides core functionality for connecting to Douyin live streams
 * and handling real-time messages including chat, gifts, likes, and more.
 */

// Core classes and types
export { DyCast } from './core/dycast';
export type { 
  ConnectStatus, 
  LiveRoom, 
  DyLiveInfo, 
  DyImInfo 
} from './core/dycast';

// Event emitter
export { Emitter } from './core/emitter';
export type { EventMap } from './core/emitter';

// Message types and decoders
export type {
  Message,
  User,
  GiftStruct,
  Text,
  RoomRankMessage_RoomRank,
  RoomUserSeqMessage_Contributor
} from './core/model';

export {
  decodeChatMessage,
  decodeControlMessage,
  decodeEmojiChatMessage,
  decodeGiftMessage,
  decodeLikeMessage,
  decodeMemberMessage,
  decodePushFrame,
  decodeResponse,
  decodeRoomRankMessage,
  decodeRoomStatsMessage,
  decodeRoomUserSeqMessage,
  decodeSocialMessage,
  encodePushFrame
} from './core/model';

// Utility functions
export { 
  makeUrlParams, 
  parseLiveHtml 
} from './core/util';

// Request helpers
export { 
  fetchLiveInfo, 
  getLiveInfo, 
  getImInfo 
} from './core/request';

// Signature utilities
export { 
  getSignature, 
  getMsToken 
} from './core/signature';

// Relay functionality
export { RelayCast } from './core/relay';

// Long integer utilities
export { Long } from './core/Long';

// Logger utilities
export { CLog, printInfo, printSKMCJ } from './utils/logUtil';
