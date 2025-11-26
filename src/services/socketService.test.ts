import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { initiateSocketConnection, joinListRoom, leaveListRoom, sendListUpdate, disconnectSocket } from './socketService';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client');

describe('Socket Service', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Setup mock socket
    mockSocket = {
      emit: vi.fn(),
      on: vi.fn(),
      disconnect: vi.fn(),
    };
    // @ts-ignore
    (io as any).mockReturnValue(mockSocket);

    initiateSocketConnection();
  });

  afterEach(() => {
    disconnectSocket();
    vi.clearAllMocks();
  });

  it('should emit join_list event with correct listId', () => {
    const listId = 'test-list-123';
    joinListRoom(listId);
    expect(mockSocket.emit).toHaveBeenCalledWith('join_list', listId);
  });

  it('should emit leave_list event with correct listId', () => {
    const listId = 'test-list-123';
    leaveListRoom(listId);
    expect(mockSocket.emit).toHaveBeenCalledWith('leave_list', listId);
  });

  it('should emit update_list event with correct data', () => {
    const listId = 'test-list-123';
    const changes = { content: 'New content' };
    sendListUpdate(listId, changes);
    expect(mockSocket.emit).toHaveBeenCalledWith('update_list', { listId, ...changes });
  });
});
