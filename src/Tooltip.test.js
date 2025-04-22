import React from 'react';
import {render, screen} from '@testing-library/react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  const mockBooking = {
    id: '1',
    from: '2023-01-01',
    to: '2023-01-05',
    familyMember: {
      name: 'Test User'
    }
  };

  it('renders booking information correctly', () => {
    render(<Tooltip booking={mockBooking} />);

    expect(screen.getByText('Bokad av: Test User')).toBeInTheDocument();
    expect(screen.getByText('Från: 2023-01-01')).toBeInTheDocument();
    expect(screen.getByText('Tom: 2023-01-05')).toBeInTheDocument();
  });

  it('adds active class after mounting', () => {
    const { container } = render(<Tooltip booking={mockBooking} />);

    // The tooltip should have the active class
    expect(container.querySelector('.tooltip')).toHaveClass('active');
  });

  it('applies custom styles when provided', () => {
    const customStyle = { backgroundColor: 'red', width: '200px' };

    const { container } = render(
      <Tooltip booking={mockBooking} style={customStyle} />
    );

    const tooltip = container.querySelector('.tooltip');
    expect(tooltip).toHaveStyle('background-color: red');
    expect(tooltip).toHaveStyle('width: 200px');
  });

  it('formats dates correctly', () => {
    const bookingWithDifferentDates = {
      ...mockBooking,
      from: '2023-02-15T12:00:00Z',
      to: '2023-03-20T18:30:00Z'
    };

    render(<Tooltip booking={bookingWithDifferentDates} />);

    // The dates should be formatted as YYYY-MM-DD
    expect(screen.getByText('Från: 2023-02-15')).toBeInTheDocument();
    expect(screen.getByText('Tom: 2023-03-20')).toBeInTheDocument();
  });
});
