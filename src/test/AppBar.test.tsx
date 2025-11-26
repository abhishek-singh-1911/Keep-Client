import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import AppBar from '../components/layout/AppBar';
import { store } from '../store/store';

// Helper function to render with providers
const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </Provider>
  );
};

describe('AppBar Component', () => {
  it('renders the Keep logo text', () => {
    renderWithProviders(<AppBar />);
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    renderWithProviders(<AppBar />);
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });
});
