import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5002';

let socket: Socket;

export const initiateSocketConnection = () => {
  if (socket) return;
  socket = io(SOCKET_URL, {
    withCredentials: true,
  });
  console.log('Connecting to socket...');
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    // @ts-ignore
    socket = null;
  }
};

export const joinListRoom = (listId: string) => {
  if (socket) socket.emit('join_list', listId);
};

export const leaveListRoom = (listId: string) => {
  if (socket) socket.emit('leave_list', listId);
};

export const subscribeToUpdateList = (cb: (changes: any) => void) => {
  if (!socket) return;
  socket.on('list_updated', (changes) => {
    console.log('List updated event received:', changes);
    cb(changes);
  });
};

export const sendListUpdate = (listId: string, changes: any) => {
  if (socket) socket.emit('update_list', { listId, ...changes });
};
