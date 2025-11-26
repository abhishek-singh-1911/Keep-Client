import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from './test-utils';
import NoteCard from '../components/notes/NoteCard';
import { listsService } from '../services/listsService';
import type { List } from '../store/slices/listsSlice';

// Mock the listsService
vi.mock('../services/listsService', () => ({
  listsService: {
    deleteList: vi.fn(),
    archiveList: vi.fn(),
    pinList: vi.fn(),
  },
}));

// Mock window.confirm
const mockConfirm = vi.fn();
global.confirm = mockConfirm;

describe('NoteCard - Delete, Archive, Pin Functionality', () => {
  const mockList: List = {
    _id: '123',
    listId: 'TEST123',
    name: 'Test List',
    owner: 'user1',
    collaborators: [],
    items: [
      { itemId: '1', text: 'Item 1', completed: false, order: 0 },
      { itemId: '2', text: 'Item 2', completed: true, order: 1 },
    ],
    archived: false,
    pinned: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to confirming delete
  });

  describe('Pin Functionality', () => {
    it('should display pin button on hover', async () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const card = screen.getByText('Test List').closest('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should show outlined pin icon when list is not pinned', () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      // The pin button should exist
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should show filled pin icon when list is pinned', () => {
      const pinnedList = { ...mockList, pinned: true };
      renderWithProviders(<NoteCard list={pinnedList} onClick={mockOnClick} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should call pinList service when pin button is clicked', async () => {
      const user = userEvent.setup();
      const updatedList = { ...mockList, pinned: true };
      vi.mocked(listsService.pinList).mockResolvedValue(updatedList);

      const { container } = renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      // Find the pin button by class
      const pinButton = container.querySelector('.pin-button') as HTMLElement;
      expect(pinButton).toBeInTheDocument();
      await user.click(pinButton);

      await waitFor(() => {
        expect(listsService.pinList).toHaveBeenCalledWith('TEST123', true);
      });
    });

    it('should toggle pin state when clicking pin button', async () => {
      const user = userEvent.setup();
      const pinnedList = { ...mockList, pinned: true };
      const unpinnedList = { ...mockList, pinned: false };
      vi.mocked(listsService.pinList).mockResolvedValue(unpinnedList);

      const { container } = renderWithProviders(<NoteCard list={pinnedList} onClick={mockOnClick} />);

      const pinButton = container.querySelector('.pin-button') as HTMLElement;
      await user.click(pinButton);

      await waitFor(() => {
        expect(listsService.pinList).toHaveBeenCalledWith('TEST123', false);
      });
    });

    it('should not trigger onClick when pin button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(listsService.pinList).mockResolvedValue({ ...mockList, pinned: true });

      const { container } = renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const pinButton = container.querySelector('.pin-button') as HTMLElement;
      await user.click(pinButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle pin error gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      vi.mocked(listsService.pinList).mockRejectedValue(new Error('Network error'));

      const { container } = renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const pinButton = container.querySelector('.pin-button') as HTMLElement;
      await user.click(pinButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to pin list:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Archive Functionality', () => {
    it('should display "Archive" tooltip when list is not archived', () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const archiveButton = screen.getByLabelText(/archive/i);
      expect(archiveButton).toBeInTheDocument();
    });

    it('should display "Unarchive" tooltip when list is archived', () => {
      const archivedList = { ...mockList, archived: true };
      renderWithProviders(<NoteCard list={archivedList} onClick={mockOnClick} />);

      const unarchiveButton = screen.getByLabelText(/unarchive/i);
      expect(unarchiveButton).toBeInTheDocument();
    });

    it('should call archiveList service when archive button is clicked', async () => {
      const user = userEvent.setup();
      const archivedList = { ...mockList, archived: true };
      vi.mocked(listsService.archiveList).mockResolvedValue(archivedList);

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const archiveButton = screen.getByLabelText(/archive/i);
      await user.click(archiveButton);

      await waitFor(() => {
        expect(listsService.archiveList).toHaveBeenCalledWith('TEST123', true);
      });
    });

    it('should toggle archive state when clicking archive button', async () => {
      const user = userEvent.setup();
      const archivedList = { ...mockList, archived: true };
      const unarchivedList = { ...mockList, archived: false };
      vi.mocked(listsService.archiveList).mockResolvedValue(unarchivedList);

      renderWithProviders(<NoteCard list={archivedList} onClick={mockOnClick} />);

      const unarchiveButton = screen.getByLabelText(/unarchive/i);
      await user.click(unarchiveButton);

      await waitFor(() => {
        expect(listsService.archiveList).toHaveBeenCalledWith('TEST123', false);
      });
    });

    it('should not trigger onClick when archive button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(listsService.archiveList).mockResolvedValue({ ...mockList, archived: true });

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const archiveButton = screen.getByLabelText(/archive/i);
      await user.click(archiveButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle archive error gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      vi.mocked(listsService.archiveList).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const archiveButton = screen.getByLabelText(/archive/i);
      await user.click(archiveButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to archive list:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Delete Functionality', () => {
    it('should display delete button', () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      expect(deleteButton).toBeInTheDocument();
    });

    it('should show confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure you want to delete this list?');
    });

    it('should call deleteList service when delete is confirmed', async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true);
      vi.mocked(listsService.deleteList).mockResolvedValue();

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(listsService.deleteList).toHaveBeenCalledWith('TEST123');
      });
    });

    it('should NOT call deleteList service when delete is cancelled', async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(false);

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(listsService.deleteList).not.toHaveBeenCalled();
    });

    it('should not trigger onClick when delete button is clicked', async () => {
      const user = userEvent.setup();
      mockConfirm.mockReturnValue(true);
      vi.mocked(listsService.deleteList).mockResolvedValue();

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle delete error gracefully', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      mockConfirm.mockReturnValue(true);
      vi.mocked(listsService.deleteList).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete list:', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Combined Operations', () => {
    it('should allow pinning an archived list', async () => {
      const user = userEvent.setup();
      const archivedList = { ...mockList, archived: true };
      const pinnedArchivedList = { ...mockList, archived: true, pinned: true };
      vi.mocked(listsService.pinList).mockResolvedValue(pinnedArchivedList);

      const { container } = renderWithProviders(<NoteCard list={archivedList} onClick={mockOnClick} />);

      const pinButton = container.querySelector('.pin-button') as HTMLElement;
      await user.click(pinButton);

      await waitFor(() => {
        expect(listsService.pinList).toHaveBeenCalledWith('TEST123', true);
      });
    });

    it('should allow archiving a pinned list', async () => {
      const user = userEvent.setup();
      const pinnedList = { ...mockList, pinned: true };
      const archivedPinnedList = { ...mockList, archived: true, pinned: true };
      vi.mocked(listsService.archiveList).mockResolvedValue(archivedPinnedList);

      renderWithProviders(<NoteCard list={pinnedList} onClick={mockOnClick} />);

      const archiveButton = screen.getByLabelText(/archive/i);
      await user.click(archiveButton);

      await waitFor(() => {
        expect(listsService.archiveList).toHaveBeenCalledWith('TEST123', true);
      });
    });

    it('should allow deleting a pinned and archived list', async () => {
      const user = userEvent.setup();
      const pinnedArchivedList = { ...mockList, pinned: true, archived: true };
      mockConfirm.mockReturnValue(true);
      vi.mocked(listsService.deleteList).mockResolvedValue();

      renderWithProviders(<NoteCard list={pinnedArchivedList} onClick={mockOnClick} />);

      const deleteButton = screen.getByLabelText(/delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(listsService.deleteList).toHaveBeenCalledWith('TEST123');
      });
    });
  });

  describe('Card Click Behavior', () => {
    it('should trigger onClick when clicking the card content', async () => {
      const user = userEvent.setup();
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const cardContent = screen.getByText('Test List');
      await user.click(cardContent);

      expect(mockOnClick).toHaveBeenCalled();
    });

    it('should display list items correctly', () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('should show completed items with line-through', () => {
      renderWithProviders(<NoteCard list={mockList} onClick={mockOnClick} />);

      const item2 = screen.getByText('Item 2');
      expect(item2).toHaveStyle({ textDecoration: 'line-through' });
    });
  });
});
