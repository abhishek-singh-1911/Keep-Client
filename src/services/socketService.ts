import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5002';

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

// Collaboration events
export const subscribeToCollaboratorAdded = (cb: (data: { listId: string }) => void) => {
  if (!socket) return;
  socket.on('collaborator_added', (data) => {
    console.log('Collaborator added event received:', data);
    cb(data);
  });
};

export const subscribeToCollaboratorRemoved = (cb: (data: { listId: string }) => void) => {
  if (!socket) return;
  socket.on('collaborator_removed', (data) => {
    console.log('Collaborator removed event received:', data);
    cb(data);
  });
};

export const subscribeToPermissionChanged = (cb: (data: { listId: string }) => void) => {
  if (!socket) return;
  socket.on('permission_changed', (data) => {
    console.log('Permission changed event received:', data);
    cb(data);
  });
};

export const sendCollaboratorAdded = (listId: string, userId: string) => {
  if (socket) socket.emit('collaborator_added', { listId, userId });
};

export const sendCollaboratorRemoved = (listId: string, userId: string) => {
  if (socket) socket.emit('collaborator_removed', { listId, userId });
};

export const sendPermissionChanged = (listId: string, userId: string, permission: string) => {
  if (socket) socket.emit('permission_changed', { listId, userId, permission });
};

