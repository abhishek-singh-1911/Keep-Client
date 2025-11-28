import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import EditNoteDialog from '../components/notes/EditNoteDialog';
import listsReducer from '../store/slices/listsSlice';
import authReducer from '../store/slices/authSlice';
import type { List } from '../store/slices/listsSlice';
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

const mockOwner = {
  _id: 'owner1',
  name: 'Owner',
  email: 'owner@example.com'
};

const mockViewer = {
  _id: 'viewer1',
  name: 'Viewer',
  email: 'viewer@example.com'
};

const mockEditor = {
  _id: 'editor1',
  name: 'Editor',
  email: 'editor@example.com'
};

const mockList: List = {
  _id: 'list1',
  listId: 'LIST001',
  name: 'Test List',
  owner: mockOwner._id,
  collaborators: [
    {
      userId: mockViewer,
      permission: 'view'
    },
    {
      userId: mockEditor,
      permission: 'edit'
    }
  ],
  items: [
    { itemId: 'item1', text: 'Item 1', completed: false, order: 0 }
  ],
  archived: false,
  pinned: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0
};

const renderWithUser = (component: React.ReactElement, user: any) => {
  const store = configureStore({
    reducer: {
      lists: listsReducer,
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: user,
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    },
  });

  return render(<Provider store={store}>{component}</Provider>);
};

describe('EditNoteDialog Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (socketService.joinListRoom as Mock).mockImplementation(() => { });
    (socketService.leaveListRoom as Mock).mockImplementation(() => { });
  });

  it('should allow owner to edit title', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockOwner
    );

    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).not.toHaveAttribute('readonly');
  });

  it('should allow editor to edit title', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockEditor
    );

    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).not.toHaveAttribute('readonly');
  });

  it('should NOT allow viewer to edit title', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockViewer
    );

    const titleInput = screen.getByPlaceholderText('Title');
    expect(titleInput).toHaveAttribute('readonly');
  });

  it('should allow owner to add items', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockOwner
    );

    const itemInput = screen.getByPlaceholderText('List item');
    expect(itemInput).toBeInTheDocument();
  });

  it('should NOT allow viewer to add items', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockViewer
    );

    const itemInput = screen.queryByPlaceholderText('List item');
    expect(itemInput).not.toBeInTheDocument();
  });

  it('should allow owner to delete items', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockOwner
    );

    // Close icon button should be present
    const deleteButtons = screen.getAllByRole('button').filter(
      btn => btn.querySelector('svg[data-testid="CloseIcon"]')
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('should NOT allow viewer to delete items', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockViewer
    );

    // Close icon button should NOT be present (except for the main dialog close button)
    const deleteButtons = screen.queryAllByRole('button').filter(
      btn => btn.querySelector('svg[data-testid="CloseIcon"]')
    );
    expect(deleteButtons.length).toBe(0);
  });

  it('should NOT allow viewer to toggle items', () => {
    renderWithUser(
      <EditNoteDialog open={true} list={mockList} onClose={() => { }} />,
      mockViewer
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });
});
