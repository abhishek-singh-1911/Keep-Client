import api from './api';
import type { List } from '../store/slices/listsSlice';

export const listsService = {
  async createList(name: string): Promise<{ listId: string; name: string }> {
    const response = await api.post('/lists', { name });
    return response.data;
  },

  async getAllLists(): Promise<List[]> {
    const response = await api.get<List[]>('/lists');
    return response.data;
  },

  async getList(listId: string): Promise<List> {
    const response = await api.get<List>(`/lists/${listId}`);
    return response.data;
  },

  async updateListName(listId: string, name: string): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}`, { name });
    return response.data;
  },

  async deleteList(listId: string): Promise<void> {
    await api.delete(`/lists/${listId}`);
  },

  async addCollaborator(listId: string, email: string): Promise<List> {
    const response = await api.post<List>(`/lists/${listId}/collaborators`, { email });
    return response.data;
  },

  async removeCollaborator(listId: string, email: string): Promise<List> {
    const response = await api.delete<List>(`/lists/${listId}/collaborators`, { data: { email } });
    return response.data;
  },

  async updateCollaboratorPermission(listId: string, email: string, permission: 'view' | 'edit'): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}/collaborators`, { email, permission });
    return response.data;
  },

  async addItem(listId: string, text: string): Promise<List> {
    const response = await api.post<List>(`/lists/${listId}/items`, { text });
    return response.data;
  },

  async updateItem(
    listId: string,
    itemId: string,
    updates: { text?: string; completed?: boolean }
  ): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}/items/${itemId}`, updates);
    return response.data;
  },

  async deleteItem(listId: string, itemId: string): Promise<List> {
    const response = await api.delete<List>(`/lists/${listId}/items/${itemId}`);
    return response.data;
  },

  async reorderItems(listId: string, itemIds: string[]): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}/items/reorder`, { itemIds });
    return response.data;
  },

  async archiveList(listId: string, archived: boolean): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}/archive`, { archived });
    return response.data;
  },

  async pinList(listId: string, pinned: boolean): Promise<List> {
    const response = await api.put<List>(`/lists/${listId}/pin`, { pinned });
    return response.data;
  },

  async reorderLists(listIds: string[]): Promise<List[]> {
    const response = await api.put<List[]>('/lists/reorder', { listIds });
    return response.data;
  },
};
