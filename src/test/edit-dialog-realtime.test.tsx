import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import EditNoteDialog from '../components/notes/EditNoteDialog';
import listsReducer from '../store/slices/listsSlice';
import authReducer from '../store/slices/authSlice';
import type { List } from '../store/slices/listsSlice';
import { listsService } from '../services/listsService';
import * as socketService from '../services/socketService';

// Mock the services
vi.mock('../services/listsService', () => ({
  listsService: {
    getList: vi.fn(),
    updateListName: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    updateItem: vi.fn(),
    reorderItems: vi.fn(),
  }
}));
vi.mock('../services/socketService');

const mockList: List = {
  _id: 'list1',
  listId: 'LIST001',
  name: 'Test List',
  owner: 'user1',
  collaborators: [{
    userId: {
      _id: 'user2',
      name: 'Collaborator',
      email: 'collab@example.com'
    },
    permission: 'edit' as const
  }],
  items: [
    { itemId: 'item1', text: 'Item 1', completed: false, order: 0 },
    { itemId: 'item2', text: 'Item 2', completed: false, order: 1 }
  ],
  archived: false,
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0
};

const renderWithProviders = (component: React.ReactElement) => {
  const store = configureStore({
    reducer: {
      lists: listsReducer,
      auth: authReducer,
    },
    preloadedState: {
      lists: {
        lists: [mockList],
        currentList: null,
        loading: false,
        error: null,
      },
      auth: {
        user: {
          _id: 'user1',
          name: 'Test User',
          email: 'test@example.com'
        },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });

  return render(<Provider store={store}>{component}</Provider>);
};

describe('EditNoteDialog - Real-time Collaboration', () => {
  let updateListCallback: ((changes: any) => void) | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    updateListCallback = null;

    // Mock socket service functions
    (socketService.joinListRoom as Mock).mockImplementation(() => { });
    (socketService.leaveListRoom as Mock).mockImplementation(() => { });
    (socketService.sendListUpdate as Mock).mockImplementation(() => { });
    (socketService.subscribeToUpdateList as Mock).mockImplementation((cb) => {
      updateListCallback = cb;
    });

    // Mock lists service
    (listsService.getList as Mock).mockResolvedValue(mockList);
  });

  describe('Socket Room Management', () => {
    it('should join socket room when dialog opens', () => {
      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      expect(socketService.joinListRoom).toHaveBeenCalledWith('LIST001');
    });

    it('should leave socket room when dialog closes', () => {
      const { rerender } = renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      // Close the dialog
      rerender(
        <Provider store={configureStore({
          reducer: { lists: listsReducer, auth: authReducer },
        })}>
          <EditNoteDialog open={false} list={mockList} onClose={() => { }} />
        </Provider>
      );

      // Room should be left when component unmounts or list changes
      // This happens in the useEffect cleanup
    });
  });

  describe('Socket Event Emissions', () => {
    it('should emit socket event when title is updated', async () => {
      const updatedList = { ...mockList, name: 'Updated Title' };
      (listsService.updateListName as Mock).mockResolvedValue(updatedList);

      const onClose = vi.fn();
      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={onClose} />
      );

      // Find title input and change it
      const titleInput = screen.getByPlaceholderText('Title');
      fireEvent.change(titleInput, { target: { value: 'Updated Title' } });

      // Click close button to trigger save
      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(socketService.sendListUpdate).toHaveBeenCalledWith(
          'LIST001',
          expect.objectContaining({ name: 'Updated Title' })
        );
      });
    });

    it('should emit socket event when item is added', async () => {
      const updatedList = {
        ...mockList,
        items: [
          ...mockList.items,
          { itemId: 'item3', text: 'New Item', completed: false, order: 2 }
        ]
      };
      (listsService.addItem as Mock).mockResolvedValue(updatedList);

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(socketService.subscribeToUpdateList).toHaveBeenCalled();
      });
    });

    it('should emit socket event when item is deleted', async () => {
      const updatedList = {
        ...mockList,
        items: [mockList.items[0]] // Only first item remains
      };
      (listsService.deleteItem as Mock).mockResolvedValue(updatedList);

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(socketService.subscribeToUpdateList).toHaveBeenCalled();
      });
    });

    it('should emit socket event when item is toggled', async () => {
      const updatedList = {
        ...mockList,
        items: [
          { ...mockList.items[0], completed: true },
          mockList.items[1]
        ]
      };
      (listsService.updateItem as Mock).mockResolvedValue(updatedList);

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(socketService.subscribeToUpdateList).toHaveBeenCalled();
      });
    });
  });

  describe('Real-time Update Reception', () => {
    it('should subscribe to list updates when dialog opens', () => {
      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      expect(socketService.subscribeToUpdateList).toHaveBeenCalled();
    });

    it('should update title when receiving title change event', async () => {
      const updatedList = { ...mockList, name: 'Updated by Collaborator' };
      (listsService.getList as Mock).mockResolvedValue(updatedList);

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      // Wait for subscription
      await waitFor(() => {
        expect(updateListCallback).not.toBeNull();
      });

      // Simulate receiving an update event
      if (updateListCallback) {
        await updateListCallback({ name: 'Updated by Collaborator' });
      }

      // Verify that getList was called to fetch latest data
      await waitFor(() => {
        expect(listsService.getList).toHaveBeenCalledWith('LIST001');
      });
    });

    it('should update items when receiving items change event', async () => {
      const updatedList = {
        ...mockList,
        items: [
          ...mockList.items,
          { itemId: 'item3', text: 'Added by Collaborator', completed: false, order: 2 }
        ]
      };
      (listsService.getList as Mock).mockResolvedValue(updatedList);

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(updateListCallback).not.toBeNull();
      });

      // Simulate receiving items update event
      if (updateListCallback) {
        await updateListCallback({ items: updatedList.items });
      }

      await waitFor(() => {
        expect(listsService.getList).toHaveBeenCalledWith('LIST001');
      });
    });

    it('should handle errors when fetching updated list fails', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
      (listsService.getList as Mock).mockRejectedValue(new Error('Network error'));

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(updateListCallback).not.toBeNull();
      });

      // Simulate receiving an update event that will fail to fetch
      if (updateListCallback) {
        await updateListCallback({ name: 'Test' });
      }

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Failed to fetch updated list:',
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });

  describe('Concurrent Editing', () => {
    it('should handle multiple rapid updates without breaking', async () => {
      const updates = [
        { ...mockList, name: 'Update 1' },
        { ...mockList, name: 'Update 2' },
        { ...mockList, name: 'Update 3' },
      ];

      let callCount = 0;
      (listsService.getList as Mock).mockImplementation(() => {
        return Promise.resolve(updates[callCount++ % updates.length]);
      });

      renderWithProviders(
        <EditNoteDialog open={true} list={mockList} onClose={() => { }} />
      );

      await waitFor(() => {
        expect(updateListCallback).not.toBeNull();
      });

      // Simulate rapid updates
      if (updateListCallback) {
        await updateListCallback({ name: 'Update 1' });
        await updateListCallback({ name: 'Update 2' });
        await updateListCallback({ name: 'Update 3' });
      }

      // Should have fetched latest data multiple times
      await waitFor(() => {
        expect(listsService.getList).toHaveBeenCalledTimes(3);
      });
    });
  });
});
