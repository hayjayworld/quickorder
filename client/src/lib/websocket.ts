import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      withCredentials: true,
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
}

export function trackOrderSocket(publicToken: string, callback: (data: any) => void) {
  const socket = getSocket();
  socket.emit('track-order', publicToken);
  socket.on('order.status.updated', callback);
  return () => {
    socket.off('order.status.updated', callback);
  };
}

export function subscribeToOrderEvents(restaurantId: string, callback: (event: string, data: any) => void) {
  const socket = getSocket();
  const events = ['order.created', 'order.accepted', 'order.preparing', 'order.ready', 'order.completed', 'order.cancelled'];
  events.forEach(event => {
    socket.on(event, (data) => callback(event, data));
  });
  return () => {
    events.forEach(event => socket.off(event));
  };
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}