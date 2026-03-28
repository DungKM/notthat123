import { io } from 'socket.io-client';
import { api_url } from './constants';
import { authService } from '@/src/auth/services/authService';

// Backend production socket URL
const SOCKET_URL = 'https://noithathochi.duckdns.org';

// Initialize socket
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket'],
});

export const connectSocket = () => {
  if (socket.connected) return;
  const token = authService.getToken();
  if (token) {
    socket.auth = { token };
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
