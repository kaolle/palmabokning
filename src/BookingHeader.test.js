import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import BookingHeader from './BookingHeader';
import {useAuth} from './authentication/AuthContext';

// Mock the useAuth hook
jest.mock('./authentication/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('BookingHeader', () => {
  const mockLogout = jest.fn().mockResolvedValue(undefined);
  const mockSetSignedIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the mock implementation for useAuth
    useAuth.mockReturnValue({
      logout: mockLogout,
      setSignedIn: mockSetSignedIn
    });
  });

  it('renders the title', () => {
    render(<BookingHeader title="Test Title" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders the logout button', () => {
    render(<BookingHeader title="Test Title" />);

    expect(screen.getByText('Logga ut')).toBeInTheDocument();
  });

  it('calls logout and setSignedIn when logout button is clicked', async () => {
    render(<BookingHeader title="Test Title" />);

    fireEvent.click(screen.getByText('Logga ut'));

    // Check that logout was called
    expect(mockLogout).toHaveBeenCalledTimes(1);

    // Wait for the async logout to complete
    await Promise.resolve();

    // Check that setSignedIn was called with false
    expect(mockSetSignedIn).toHaveBeenCalledTimes(1);
    expect(mockSetSignedIn).toHaveBeenCalledWith(false);
  });
});
