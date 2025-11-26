import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NoteInput from '../components/notes/NoteInput';
import { renderWithProviders } from './test-utils';

// Mock the listsService
vi.mock('../services/listsService', () => ({
  listsService: {
    createList: vi.fn(),
    addItem: vi.fn(),
    getList: vi.fn(),
  },
}));

describe('NoteInput Component', () => {
  it('renders collapsed initially', () => {
    renderWithProviders(<NoteInput />);
    expect(screen.getByText('Take a note...')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();
  });

  it('expands when clicked', () => {
    renderWithProviders(<NoteInput />);

    fireEvent.click(screen.getByText('Take a note...'));

    expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('List item')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('allows entering a title', () => {
    renderWithProviders(<NoteInput />);

    fireEvent.click(screen.getByText('Take a note...'));
    const titleInput = screen.getByPlaceholderText('Title');

    fireEvent.change(titleInput, { target: { value: 'New Test Note' } });
    expect(titleInput).toHaveValue('New Test Note');
  });

  it('adds list items', () => {
    renderWithProviders(<NoteInput />);

    fireEvent.click(screen.getByText('Take a note...'));
    const itemInput = screen.getByPlaceholderText('List item');

    // Add first item
    fireEvent.change(itemInput, { target: { value: 'Item 1' } });
    fireEvent.blur(itemInput); // Trigger add on blur

    expect(screen.getByDisplayValue('Item 1')).toBeInTheDocument();

    // Add second item
    fireEvent.change(itemInput, { target: { value: 'Item 2' } });
    fireEvent.keyDown(itemInput, { key: 'Enter', code: 'Enter' }); // Trigger add on Enter

    expect(screen.getByDisplayValue('Item 2')).toBeInTheDocument();
  });
});
