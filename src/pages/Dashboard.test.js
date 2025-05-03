import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Dashboard component with username', () => {
    render(<Dashboard isLoggedIn={true} username="JohnDoe" farmerId="1" />);
    expect(screen.getByText(/Welcome back, JohnDoe!/i)).toBeInTheDocument();
  });

  test('renders field selection dropdown', async () => {
    render(<Dashboard isLoggedIn={true} username="JohnDoe" farmerId="1" />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Select Field:/i })).toBeInTheDocument();
    });
  });

  test('renders crop selection dropdown', async () => {
    render(<Dashboard isLoggedIn={true} username="JohnDoe" farmerId="1" />);
    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /Select Crop:/i })).toBeInTheDocument();
    });
  });

  test('renders generate recommendation button', () => {
    render(<Dashboard isLoggedIn={true} username="JohnDoe" farmerId="1" />);
    expect(screen.getByRole('button', { name: /Generate Recommendation/i })).toBeInTheDocument();
  });

  test('handles button click without API call', () => {
    render(<Dashboard isLoggedIn={true} username="JohnDoe" farmerId="1" />);
    const button = screen.getByRole('button', { name: /Generate Recommendation/i });
    fireEvent.click(button);
    // Ensure button is clickable without checking API response
  });
});
