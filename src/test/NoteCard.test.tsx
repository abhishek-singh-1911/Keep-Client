import { screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NoteCard from '../components/notes/NoteCard';
import { renderWithProviders } from './test-utils';

const mockList = {
  _id: '1',
  listId: 'list-1',
  name: 'Test Note Title',
  owner: 'user-1',
  collaborators: [],
  items: [
    { itemId: '1', text: 'Buy milk', completed: false, order: 0 },
    { itemId: '2', text: 'Walk dog', completed: true, order: 1 },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('NoteCard Component', () => {
  it('renders title and items', () => {
    renderWithProviders(<NoteCard list={mockList} />);

    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Walk dog')).toBeInTheDocument();
  });

  it('shows completed items with strikethrough style', () => {
    renderWithProviders(<NoteCard list={mockList} />);

    const completedItem = screen.getByText('Walk dog');
    expect(completedItem).toHaveStyle({ textDecoration: 'line-through' });

    const activeItem = screen.getByText('Buy milk');
    expect(activeItem).not.toHaveStyle({ textDecoration: 'line-through' });
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    renderWithProviders(<NoteCard list={mockList} onClick={handleClick} />);

    screen.getByText('Test Note Title').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
