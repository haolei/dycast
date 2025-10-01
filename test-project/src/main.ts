import './style.css';
import { DyCast, type DyMessage, type DyLiveInfo } from '@dycast/core';

const form = document.getElementById('connect-form') as HTMLFormElement;
const roomInput = document.getElementById('room-input') as HTMLInputElement;
const connectBtn = document.getElementById('connect-btn') as HTMLButtonElement;
const disconnectBtn = document.getElementById('disconnect-btn') as HTMLButtonElement;
const clearLogBtn = document.getElementById('clear-log-btn') as HTMLButtonElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const logEl = document.getElementById('log') as HTMLPreElement;
const autoScrollToggle = document.getElementById('auto-scroll') as HTMLInputElement;
const roomInfoEl = document.getElementById('room-info') as HTMLDivElement;

let client: DyCast | null = null;
type EventMap = {
  open: (event?: Event, info?: DyLiveInfo) => void;
  close: (code: number, reason: string) => void;
  error: (error: Error) => void;
  message: (messages: DyMessage[]) => void;
  reconnecting: (count?: number, code?: number, reason?: string) => void;
  reconnect: (event?: Event) => void;
};

let listeners: Array<{ event: keyof EventMap; handler: EventMap[keyof EventMap] }> = [];
let connecting = false;

const resetListeners = () => {
  if (!client) {
    listeners = [];
    return;
  }
  for (const { event, handler } of listeners) {
    client.off(event as never, handler as never);
  }
  listeners = [];
};

const attachListener = <K extends keyof EventMap>(event: K, handler: EventMap[K]) => {
  if (!client) return;
  client.on(event as never, handler as never);
  listeners.push({ event, handler });
};

const setStatus = (text: string) => {
  statusText.textContent = text;
};

const formatMessage = (messages: DyMessage[]) => {
  return messages
    .map((message) => {
      const prefix = `[${new Date().toLocaleTimeString()}] ${message.method}`;
      if (message.content) {
        return `${prefix}: ${message.content}`;
      }
      return `${prefix}: ${JSON.stringify(message, null, 2)}`;
    })
    .join('\n');
};

const appendLog = (text: string) => {
  const entry = text.trim();
  if (!entry) return;
  logEl.textContent = `${logEl.textContent ? `${logEl.textContent}\n` : ''}${entry}`;
  if (autoScrollToggle.checked) {
    logEl.scrollTop = logEl.scrollHeight;
  }
};

const summariseRoomInfo = (info: DyLiveInfo) => {
  const details = [
    info.roomNum && `Room: ${info.roomNum}`,
    info.nickname && `Host: ${info.nickname}`,
    info.title && `Title: ${info.title}`,
    info.roomId && `Room ID: ${info.roomId}`,
    info.uniqueId && `Unique ID: ${info.uniqueId}`
  ].filter(Boolean);
  roomInfoEl.textContent = details.join(' \u2022 ');
};

const cleanupClient = () => {
  if (client) {
    resetListeners();
    client.close();
    client = null;
  }
  roomInfoEl.textContent = '';
};

const handleConnect = async (room: string) => {
  cleanupClient();
  client = new DyCast(room);
  connecting = true;
  setStatus('Connecting…');
  appendLog(`Attempting connection to room ${room}`);

  attachListener('open', (_event, info) => {
    connecting = false;
    setStatus('Connected');
    appendLog('Connection established. Listening for events…');
    if (info) {
      summariseRoomInfo(info);
    }
  });

  attachListener('message', (messages) => {
    appendLog(formatMessage(messages));
  });

  attachListener('error', (error) => {
    appendLog(`Error: ${error.message}`);
  });

  attachListener('close', (code, reason) => {
    connecting = false;
    setStatus(`Disconnected (code ${code})`);
    appendLog(`Connection closed: ${reason}`);
  });

  attachListener('reconnecting', (count, code, reason) => {
    setStatus(`Reconnecting (attempt ${count})`);
    appendLog(`Reconnecting… count=${count} code=${code ?? ''} reason=${reason ?? ''}`.trim());
  });

  attachListener('reconnect', () => {
    setStatus('Reconnected');
    appendLog('Reconnected to live room.');
  });

  try {
    await client.connect();
  } catch (error) {
    connecting = false;
    setStatus('Connection failed');
    appendLog(`Failed to connect: ${(error as Error).message}`);
  }
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const room = roomInput.value.trim();
  if (!room) {
    appendLog('Please enter a valid room number.');
    return;
  }
  connectBtn.disabled = true;
  handleConnect(room).finally(() => {
    connectBtn.disabled = false;
  });
});

disconnectBtn.addEventListener('click', () => {
  if (connecting) {
    appendLog('Cancelling connection attempt…');
  }
  cleanupClient();
  connecting = false;
  setStatus('Idle');
  appendLog('Disconnected from live room.');
});

clearLogBtn.addEventListener('click', () => {
  logEl.textContent = '';
});

appendLog('Ready. Enter a Douyin room number and press Connect.');
