import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listsService } from '../services/listsService';
import api from '../services/api';
import type { List } from '../store/slices/listsSlice';

// Mock the api module
vi.mock('../services/api');

describe('listsService - Delete, Archive, Pin', () => {
  const mockList: List = {
    _id: '123',
    listId: 'TEST123',
    name: 'Test List',
    owner: 'user1',
    collaborators: [],
    items: [],
    archived: false,
    pinned: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('deleteList', () => {
    it('should call DELETE endpoint with correct listId', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });

      await listsService.deleteList('TEST123');

      expect(api.delete).toHaveBeenCalledWith('/lists/TEST123');
      expect(api.delete).toHaveBeenCalledTimes(1);
    });

    it('should handle successful deletion', async () => {
      vi.mocked(api.delete).mockResolvedValue({ data: undefined });

      await expect(listsService.deleteList('TEST123')).resolves.toBeUndefined();
    });

    it('should throw error when deletion fails', async () => {
      const error = new Error('Failed to delete');
      vi.mocked(api.delete).mockRejectedValue(error);

      await expect(listsService.deleteList('TEST123')).rejects.toThrow('Failed to delete');
    });

    it('should handle 404 error for non-existent list', async () => {
      const error = { response: { status: 404, data: { message: 'List not found' } } };
      vi.mocked(api.delete).mockRejectedValue(error);

      await expect(listsService.deleteList('INVALID')).rejects.toEqual(error);
    });

    it('should handle 403 error for unauthorized deletion', async () => {
      const error = { response: { status: 403, data: { message: 'Not authorized' } } };
      vi.mocked(api.delete).mockRejectedValue(error);

      await expect(listsService.deleteList('TEST123')).rejects.toEqual(error);
    });
  });

  describe('archiveList', () => {
    it('should call PUT endpoint with correct listId and archived=true', async () => {
      const archivedList = { ...mockList, archived: true };
      vi.mocked(api.put).mockResolvedValue({ data: archivedList });

      const result = await listsService.archiveList('TEST123', true);

      expect(api.put).toHaveBeenCalledWith('/lists/TEST123/archive', { archived: true });
      expect(result).toEqual(archivedList);
    });

    it('should call PUT endpoint with archived=false to unarchive', async () => {
      const unarchivedList = { ...mockList, archived: false };
      vi.mocked(api.put).mockResolvedValue({ data: unarchivedList });

      const result = await listsService.archiveList('TEST123', false);

      expect(api.put).toHaveBeenCalledWith('/lists/TEST123/archive', { archived: false });
      expect(result).toEqual(unarchivedList);
    });

    it('should return updated list with archived status', async () => {
      const archivedList = { ...mockList, archived: true };
      vi.mocked(api.put).mockResolvedValue({ data: archivedList });

      const result = await listsService.archiveList('TEST123', true);

      expect(result.archived).toBe(true);
      expect(result.listId).toBe('TEST123');
    });

    it('should preserve other list properties when archiving', async () => {
      const archivedList = { ...mockList, archived: true, pinned: true };
      vi.mocked(api.put).mockResolvedValue({ data: archivedList });

      const result = await listsService.archiveList('TEST123', true);

      expect(result.pinned).toBe(true);
      expect(result.name).toBe('Test List');
      expect(result.items).toEqual([]);
    });

    it('should throw error when archiving fails', async () => {
      const error = new Error('Failed to archive');
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.archiveList('TEST123', true)).rejects.toThrow('Failed to archive');
    });

    it('should handle 404 error for non-existent list', async () => {
      const error = { response: { status: 404, data: { message: 'List not found' } } };
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.archiveList('INVALID', true)).rejects.toEqual(error);
    });

    it('should handle 403 error for unauthorized archive', async () => {
      const error = { response: { status: 403, data: { message: 'Not authorized' } } };
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.archiveList('TEST123', true)).rejects.toEqual(error);
    });
  });

  describe('pinList', () => {
    it('should call PUT endpoint with correct listId and pinned=true', async () => {
      const pinnedList = { ...mockList, pinned: true };
      vi.mocked(api.put).mockResolvedValue({ data: pinnedList });

      const result = await listsService.pinList('TEST123', true);

      expect(api.put).toHaveBeenCalledWith('/lists/TEST123/pin', { pinned: true });
      expect(result).toEqual(pinnedList);
    });

    it('should call PUT endpoint with pinned=false to unpin', async () => {
      const unpinnedList = { ...mockList, pinned: false };
      vi.mocked(api.put).mockResolvedValue({ data: unpinnedList });

      const result = await listsService.pinList('TEST123', false);

      expect(api.put).toHaveBeenCalledWith('/lists/TEST123/pin', { pinned: false });
      expect(result).toEqual(unpinnedList);
    });

    it('should return updated list with pinned status', async () => {
      const pinnedList = { ...mockList, pinned: true };
      vi.mocked(api.put).mockResolvedValue({ data: pinnedList });

      const result = await listsService.pinList('TEST123', true);

      expect(result.pinned).toBe(true);
      expect(result.listId).toBe('TEST123');
    });

    it('should preserve other list properties when pinning', async () => {
      const pinnedList = { ...mockList, pinned: true, archived: true };
      vi.mocked(api.put).mockResolvedValue({ data: pinnedList });

      const result = await listsService.pinList('TEST123', true);

      expect(result.archived).toBe(true);
      expect(result.name).toBe('Test List');
      expect(result.items).toEqual([]);
    });

    it('should throw error when pinning fails', async () => {
      const error = new Error('Failed to pin');
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.pinList('TEST123', true)).rejects.toThrow('Failed to pin');
    });

    it('should handle 404 error for non-existent list', async () => {
      const error = { response: { status: 404, data: { message: 'List not found' } } };
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.pinList('INVALID', true)).rejects.toEqual(error);
    });

    it('should handle 403 error for unauthorized pin', async () => {
      const error = { response: { status: 403, data: { message: 'Not authorized' } } };
      vi.mocked(api.put).mockRejectedValue(error);

      await expect(listsService.pinList('TEST123', true)).rejects.toEqual(error);
    });
  });

  describe('Combined Operations', () => {
    it('should handle archiving a pinned list', async () => {
      const archivedPinnedList = { ...mockList, archived: true, pinned: true };
      vi.mocked(api.put).mockResolvedValue({ data: archivedPinnedList });

      const result = await listsService.archiveList('TEST123', true);

      expect(result.archived).toBe(true);
      expect(result.pinned).toBe(true);
    });

    it('should handle pinning an archived list', async () => {
      const pinnedArchivedList = { ...mockList, pinned: true, archived: true };
      vi.mocked(api.put).mockResolvedValue({ data: pinnedArchivedList });

      const result = await listsService.pinList('TEST123', true);

      expect(result.pinned).toBe(true);
      expect(result.archived).toBe(true);
    });

    it('should handle sequential operations correctly', async () => {
      // First pin
      const pinnedList = { ...mockList, pinned: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: pinnedList });

      const result1 = await listsService.pinList('TEST123', true);
      expect(result1.pinned).toBe(true);

      // Then archive
      const archivedPinnedList = { ...mockList, pinned: true, archived: true };
      vi.mocked(api.put).mockResolvedValueOnce({ data: archivedPinnedList });

      const result2 = await listsService.archiveList('TEST123', true);
      expect(result2.pinned).toBe(true);
      expect(result2.archived).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors for delete', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(api.delete).mockRejectedValue(networkError);

      await expect(listsService.deleteList('TEST123')).rejects.toThrow('Network Error');
    });

    it('should handle network errors for archive', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(api.put).mockRejectedValue(networkError);

      await expect(listsService.archiveList('TEST123', true)).rejects.toThrow('Network Error');
    });

    it('should handle network errors for pin', async () => {
      const networkError = new Error('Network Error');
      vi.mocked(api.put).mockRejectedValue(networkError);

      await expect(listsService.pinList('TEST123', true)).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const timeoutError = { code: 'ECONNABORTED', message: 'timeout of 5000ms exceeded' };
      vi.mocked(api.put).mockRejectedValue(timeoutError);

      await expect(listsService.archiveList('TEST123', true)).rejects.toEqual(timeoutError);
    });

    it('should handle server errors (500)', async () => {
      const serverError = { response: { status: 500, data: { message: 'Internal Server Error' } } };
      vi.mocked(api.delete).mockRejectedValue(serverError);

      await expect(listsService.deleteList('TEST123')).rejects.toEqual(serverError);
    });
  });
});
