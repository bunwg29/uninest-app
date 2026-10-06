import { io, type Socket } from 'socket.io-client';
import { API_CONFIG, apiClient, tokenStorage } from '@core';
import type { SocketAck } from '../types';
import { CHAT_LIMITS, CHAT_SOCKET_NAMESPACE } from '../types';

const AUTH_FAILURE_PATTERN = /Phiên đăng nhập/;

let socket: Socket | null = null;
let isRecoveringAuth = false;

const getSocketUrl = () => `${API_CONFIG.WS_URL.replace(/\/$/, '')}/${CHAT_SOCKET_NAMESPACE}`;

const recoverFromAuthFailure = async (activeSocket: Socket) => {
  if (isRecoveringAuth) {
    return;
  }

  isRecoveringAuth = true;

  try {
    await apiClient.get('/conversations/summary');
    activeSocket.connect();
  } catch {
    activeSocket.disconnect();
  } finally {
    isRecoveringAuth = false;
  }
};

const createSocket = (): Socket => {
  const created = io(getSocketUrl(), {
    autoConnect: false,
    transports: ['websocket'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    auth: (callback) => {
      void tokenStorage.getAccessToken().then((token) => callback({ token }));
    },
  });

  created.on('connect_error', (error) => {
    if (AUTH_FAILURE_PATTERN.test(error.message)) {
      void recoverFromAuthFailure(created);
    }
  });

  created.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      void recoverFromAuthFailure(created);
    }
  });

  return created;
};

export const chatSocket = {
  getInstance(): Socket {
    if (!socket) {
      socket = createSocket();
    }

    return socket;
  },

  connect(): Socket {
    const instance = this.getInstance();

    if (!instance.connected && !instance.active) {
      instance.connect();
    }

    return instance;
  },

  disconnect(): void {
    socket?.disconnect();
    socket = null;
  },

  isConnected(): boolean {
    return socket?.connected ?? false;
  },

  emitWithAck<T>(event: string, payload: unknown): Promise<SocketAck<T>> {
    return new Promise((resolve, reject) => {
      if (!socket?.connected) {
        reject(new Error('SOCKET_OFFLINE'));

        return;
      }

      socket
        .timeout(CHAT_LIMITS.SOCKET_ACK_TIMEOUT_MS)
        .emit(event, payload, (error: Error | null, ack: SocketAck<T>) => {
          if (error) {
            reject(new Error('SOCKET_TIMEOUT'));

            return;
          }

          resolve(ack);
        });
    });
  },
};
