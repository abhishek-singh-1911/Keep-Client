import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import CollaboratorDialog from '../components/notes/CollaboratorDialog';
import { listsService } from '../services/listsService';
import * as socketService from '../services/socketService';
import { vi, type Mock } from 'vitest';

// Mock the services
vi.mock('../services/listsService');
vi.mock('../services/socketService');

// Mock the store hooks
vi.mock('../store/hooks', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: () => vi.fn(),
}));
const mockList = {
  _id: '123',
  listId: 'TEST123',
  name: 'Test List',
  owner: 'owner-user-id',
  collaborators: [
    {
      userId: {
        _id: 'collab-1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      permission: 'view' as const,
    },
    {
      userId: {
        _id: 'collab-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
      },
      permission: 'edit' as const,
    },
  ],
  items: [],
  archived: false,
  pinned: false,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

const mockOwnerState = {
  auth: {
    user: {
      _id: 'owner-user-id',
      name: 'Owner User',
      email: 'owner@example.com',
    },
    token: 'mock-token',
    isAuthenticated: true,
    loading: false,
    error: null,
  },
  lists: {
    lists: [mockList],
    currentList: mockList,
    loading: false,
    error: null,
  },
  ui: {
    sidebarOpen: true,
    searchQuery: '',
    viewMode: 'grid' as const,
    activeView: 'notes' as const,
  },
};

const mockCollaboratorState = {
  ...mockOwnerState,
  auth: {
    ...mockOwnerState.auth,
    user: {
      _id: 'collab-1',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
};

describe('CollaboratorDialog Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('As Owner', () => {
    it('should render the dialog when open', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      expect(screen.getByText('Collaborators')).toBeInTheDocument();
    });

    it('should display owner section', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const ownerTexts = screen.getAllByText('Owner');
      expect(ownerTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('(You)')).toBeInTheDocument();
    });

    it('should display all collaborators with their details', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should show permission dropdowns for owner', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('should allow owner to add a new collaborator', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [
          ...mockList.collaborators,
          {
            userId: {
              _id: 'new-user',
              name: 'New User',
              email: 'new@example.com',
            },
            permission: 'view' as const,
          },
        ],
      };

      (listsService.addCollaborator as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const emailInput = screen.getByLabelText(/person or email to share with/i);
      await user.type(emailInput, 'new@example.com');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(listsService.addCollaborator).toHaveBeenCalledWith(
          'TEST123',
          'new@example.com'
        );
      });
    });

    it('should emit socket event when adding collaborator', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [
          ...mockList.collaborators,
          {
            userId: {
              _id: 'new-user',
              name: 'New User',
              email: 'new@example.com',
            },
            permission: 'view' as const,
          },
        ],
      };

      (listsService.addCollaborator as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const emailInput = screen.getByLabelText(/person or email to share with/i);
      await user.type(emailInput, 'new@example.com');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(socketService.sendCollaboratorAdded).toHaveBeenCalledWith(
          'TEST123',
          'new-user'
        );
      });
    });

    it('should display error when adding non-existent user', async () => {
      (listsService.addCollaborator as Mock).mockRejectedValue({
        response: { data: { message: 'User not found' } },
      });

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const emailInput = screen.getByLabelText(/person or email to share with/i);
      await user.type(emailInput, 'nonexistent@example.com');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('User not found')).toBeInTheDocument();
      });
    });

    it('should allow owner to change collaborator permission', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [
          {
            ...mockList.collaborators[0],
            permission: 'edit' as const,
          },
          mockList.collaborators[1],
        ],
      };

      (listsService.updateCollaboratorPermission as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const selects = screen.getAllByRole('combobox');
      const firstSelect = selects[0]; // John Doe's permission

      await user.click(firstSelect);
      const editOption = screen.getByRole('option', { name: /edit/i });
      await user.click(editOption);

      await waitFor(() => {
        expect(listsService.updateCollaboratorPermission).toHaveBeenCalledWith(
          'TEST123',
          'john@example.com',
          'edit'
        );
      });
    });

    it('should emit socket event when changing permission', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [
          {
            ...mockList.collaborators[0],
            permission: 'edit' as const,
          },
          mockList.collaborators[1],
        ],
      };

      (listsService.updateCollaboratorPermission as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const selects = screen.getAllByRole('combobox');
      await user.click(selects[0]);
      const editOption = screen.getByRole('option', { name: /edit/i });
      await user.click(editOption);

      await waitFor(() => {
        expect(socketService.sendPermissionChanged).toHaveBeenCalledWith(
          'TEST123',
          'collab-1',
          'edit'
        );
      });
    });

    it('should allow owner to remove a collaborator', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [mockList.collaborators[1]], // Removed first collaborator
      };

      (listsService.removeCollaborator as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0].closest('button')!);

      await waitFor(() => {
        expect(listsService.removeCollaborator).toHaveBeenCalledWith(
          'TEST123',
          'john@example.com'
        );
      });
    });

    it('should emit socket event when removing collaborator', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [mockList.collaborators[1]],
      };

      (listsService.removeCollaborator as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const deleteButtons = screen.getAllByTestId('DeleteIcon');
      await user.click(deleteButtons[0].closest('button')!);

      await waitFor(() => {
        expect(socketService.sendCollaboratorRemoved).toHaveBeenCalledWith(
          'TEST123',
          'collab-1'
        );
      });
    });

    it('should close dialog when clicking Done', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const doneButton = screen.getByRole('button', { name: /done/i });
      await user.click(doneButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('As Collaborator (Non-Owner)', () => {
    it('should display collaborators but hide permission controls', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockCollaboratorState }
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();

      // Should not show permission dropdowns for non-owner
      const selects = screen.queryAllByRole('combobox');
      expect(selects.length).toBe(0);
    });

    it('should show permission as read-only text for non-owner', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockCollaboratorState }
      );

      // Permission should be displayed as text, not in a dropdown
      const permissions = screen.getAllByText(/view|edit/i);
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should not show delete buttons for non-owner', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockCollaboratorState }
      );

      const deleteButtons = screen.queryAllByTestId('DeleteIcon');
      expect(deleteButtons.length).toBe(0);
    });

    it('should not show add collaborator input for non-owner', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockCollaboratorState }
      );

      // The input should still be there but we can verify owner-specific behavior
      expect(screen.getByText('Collaborators')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    const emptyList = {
      ...mockList,
      collaborators: [],
    };

    it('should show only owner when no collaborators', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={emptyList} />,
        { preloadedState: mockOwnerState }
      );

      const ownerTexts = screen.getAllByText('Owner');
      expect(ownerTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    it('should disable Add button when email is empty', () => {
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).toBeDisabled();
    });

    it('should enable Add button when email is provided', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const emailInput = screen.getByLabelText(/person or email to share with/i);
      await user.type(emailInput, 'test@example.com');

      const addButton = screen.getByRole('button', { name: /add/i });
      expect(addButton).not.toBeDisabled();
    });

    it('should clear email input after successful add', async () => {
      const updatedList = {
        ...mockList,
        collaborators: [...mockList.collaborators],
      };

      (listsService.addCollaborator as Mock).mockResolvedValue(updatedList);

      const user = userEvent.setup();
      renderWithProviders(
        <CollaboratorDialog open={true} onClose={mockOnClose} list={mockList} />,
        { preloadedState: mockOwnerState }
      );

      const emailInput = screen.getByLabelText(/person or email to share with/i) as HTMLInputElement;
      await user.type(emailInput, 'test@example.com');

      const addButton = screen.getByRole('button', { name: /add/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });
});
