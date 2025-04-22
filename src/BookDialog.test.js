import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import BookDialog from './BookDialog';

describe('BookDialog', () => {
  const mockOnBookClick = jest.fn();
  const mockOnCancelClick = jest.fn();
  const mockExistingBooking = {
    id: '1',
    from: '2023-01-01',
    to: '2023-01-05',
    familyMember: {
      name: 'Test User'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with question and buttons', () => {
    render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={null}
      />
    );

    expect(screen.getByText('Vill du boka ?')).toBeInTheDocument();
    expect(screen.getByText('Ja')).toBeInTheDocument();
    expect(screen.getByText('Nej')).toBeInTheDocument();
  });

  it('calls onBookClick when Yes button is clicked', () => {
    render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={null}
      />
    );

    fireEvent.click(screen.getByText('Ja'));
    expect(mockOnBookClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCancelClick when No button is clicked', () => {
    render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={null}
      />
    );

    fireEvent.click(screen.getByText('Nej'));
    expect(mockOnCancelClick).toHaveBeenCalledTimes(1);
  });

  it('displays booking information when existingBooking is provided', () => {
    render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={mockExistingBooking}
      />
    );

    expect(screen.getByText('Blivit Bookad av: Test User')).toBeInTheDocument();
    expect(screen.getByText('Från: 2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('Tom: 2023-01-05')).toBeInTheDocument();
  });

  it('adds active class after delay', async () => {
    const { container } = render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={null}
      />
    );

    // Initially, the dialog should not have the active class
    expect(container.querySelector('.bookDialog')).not.toHaveClass('active');

    // After the delay, the dialog should have the active class
    await waitFor(() => {
      expect(container.querySelector('.bookDialog')).toHaveClass('active');
    }, { timeout: 1500 }); // Slightly longer than the 1000ms delay
  });

  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red', width: '200px' };

    const { container } = render(
      <BookDialog
        onBookClick={mockOnBookClick}
        onCancelClick={mockOnCancelClick}
        existingBooking={null}
        style={customStyle}
      />
    );

    const dialog = container.querySelector('.bookDialog');
    expect(dialog).toHaveStyle('background-color: red');
    expect(dialog).toHaveStyle('width: 200px');
  });
});
