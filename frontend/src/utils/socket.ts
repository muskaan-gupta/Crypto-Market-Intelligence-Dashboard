import io, { Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(): Socket {
  if (!socket) {
    socket = io('http://localhost:4000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
}

export function getSocket(): Socket {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
