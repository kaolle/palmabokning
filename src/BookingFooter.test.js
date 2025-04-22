import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import BookingFooter from './BookingFooter';
import * as AuthContext from './authentication/AuthContext';
import * as BookingService from './rest/booking';

// Mock date-fns to avoid locale issues in tests
jest.mock('date-fns', () => {
  const actual = jest.requireActual('date-fns');
  return {
    ...actual,
    format: jest.fn().mockImplementation((date, formatStr, options) => {
      if (formatStr === 'dd-MMMM') {
        const dateObj = new Date(date);
        return `${dateObj.getDate()}-${options.locale.months[dateObj.getMonth()]}`;
      }
      return actual.format(date, formatStr, options);
    })
  };
});

// Mock AuthContext
jest.mock('./authentication/AuthContext', () => ({
  isFamilyUberhead: jest.fn().mockReturnValue(false)
}));

// Mock BookingService
jest.mock('./rest/booking', () => ({
  getFamilyMembersRequest: jest.fn().mockResolvedValue({ data: [] })
}));

describe('BookingFooter', () => {
  const mockOnBookClick = jest.fn();
  const mockOnBookAbort = jest.fn();
  const mockOnBookDeleteClick = jest.fn();

  const startDate = new Date('2023-01-01');
  const endDate = new Date('2023-01-05');

  const mockYourBooking = {
    id: '1',
    from: '2023-02-01',
    to: '2023-02-05',
    familyMember: {
      name: 'Test User'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when no dates or booking are provided', () => {
    const { container } = render(
      <BookingFooter
        onBookClick={mockOnBookClick}
        onBookAbort={mockOnBookAbort}
        onBookDeleteClick={mockOnBookDeleteClick}
        startDate={null}
        endDate={null}
        yourBooking={null}
      />
    );

    // The footer panel should be empty
    expect(container.querySelector('.buttonRow')).not.toBeInTheDocument();
  });

  // it('renders booking controls when start and end dates are provided', () => {
  //   render(
  //     <BookingFooter
  //       onBookClick={mockOnBookClick}
  //       onBookAbort={mockOnBookAbort}
  //       onBookDeleteClick={mockOnBookDeleteClick}
  //       startDate={startDate}
  //       endDate={endDate}
  //       yourBooking={mockYourBooking}
  //     />
  //   );
  //
  //   // Check that the booking controls are rendered
  //   expect(screen.getByText('Boka')).toBeInTheDocument();
  //   expect(screen.getByText('Tabort')).toBeInTheDocument();
  //
  //   // Check that the date range is displayed
  //   // Use a function matcher to handle text split across multiple elements
  //   const datePanel = screen.getByText((content, element) => {
  //     return element.className === 'footer-date-panel' &&
  //            element.textContent.includes('1-januari') &&
  //            element.textContent.includes('5-januari');
  //   });
  //   expect(datePanel).toBeInTheDocument();
  // });

  // it('renders delete booking control when yourBooking is provided', () => {
  //   render(
  //     <BookingFooter
  //       onBookClick={mockOnBookClick}
  //       onBookAbort={mockOnBookAbort}
  //       onBookDeleteClick={mockOnBookDeleteClick}
  //       startDate={startDate}
  //       endDate={endDate}
  //       yourBooking={mockYourBooking}
  //     />
  //   );
  //
  //   // Check that the delete booking control is rendered
  //   expect(screen.getByText('Tabort din bokning')).toBeInTheDocument();
  //
  //   // Check that the date range is displayed
  //   // Use a function matcher to handle text split across multiple elements
  //   const datePanel = screen.getByText((content, element) => {
  //     return element.className === 'footer-date-panel' &&
  //            element.textContent.includes('1-februari') &&
  //            element.textContent.includes('5-februari');
  //   });
  //   expect(datePanel).toBeInTheDocument();
  // });
  //
  it('calls onBookClick when Book button is clicked', () => {
    render(
      <BookingFooter
        onBookClick={mockOnBookClick}
        onBookAbort={mockOnBookAbort}
        onBookDeleteClick={mockOnBookDeleteClick}
        startDate={startDate}
        endDate={endDate}
        yourBooking={null}
      />
    );

    fireEvent.click(screen.getByText('Boka'));
    expect(mockOnBookClick).toHaveBeenCalledTimes(1);
    expect(mockOnBookClick).toHaveBeenCalledWith();
  });

  it('renders family member selector when user is FAMILY_UBERHEAD', async () => {
    // Mock isFamilyUberhead to return true
    AuthContext.isFamilyUberhead.mockReturnValue(true);

    // Mock family members data
    const mockFamilyMembers = [
      { uuid: '1', name: 'Family Member 1' },
      { uuid: '2', name: 'Family Member 2' }
    ];
    BookingService.getFamilyMembersRequest.mockResolvedValue({ data: mockFamilyMembers });

    render(
      <BookingFooter
        onBookClick={mockOnBookClick}
        onBookAbort={mockOnBookAbort}
        onBookDeleteClick={mockOnBookDeleteClick}
        startDate={startDate}
        endDate={endDate}
        yourBooking={null}
      />
    );

    // Wait for family members to load
    await waitFor(() => {
      expect(screen.getByText('Välj familjemedlem')).toBeInTheDocument();
    });

    // Check that the family member selector is rendered
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();

    // Navigate to the first family member
    fireEvent.click(screen.getByText('→'));
    expect(screen.getByText('Family Member 1')).toBeInTheDocument();

    // Navigate to the second family member
    fireEvent.click(screen.getByText('→'));
    expect(screen.getByText('Family Member 2')).toBeInTheDocument();

    // Book for the selected family member
    fireEvent.click(screen.getByText('Boka'));
    expect(mockOnBookClick).toHaveBeenCalledTimes(1);
    expect(mockOnBookClick).toHaveBeenCalledWith('2');

    // Reset the mock for other tests
    AuthContext.isFamilyUberhead.mockReturnValue(false);
  });

  it('calls onBookAbort when Remove button is clicked', () => {
    render(
      <BookingFooter
        onBookClick={mockOnBookClick}
        onBookAbort={mockOnBookAbort}
        onBookDeleteClick={mockOnBookDeleteClick}
        startDate={startDate}
        endDate={endDate}
        yourBooking={null}
      />
    );

    fireEvent.click(screen.getByText('Tabort'));
    expect(mockOnBookAbort).toHaveBeenCalledTimes(1);
  });

  it('calls onBookDeleteClick when Remove your booking button is clicked', () => {
    render(
      <BookingFooter
        onBookClick={mockOnBookClick}
        onBookAbort={mockOnBookAbort}
        onBookDeleteClick={mockOnBookDeleteClick}
        startDate={null}
        endDate={null}
        yourBooking={mockYourBooking}
      />
    );

    fireEvent.click(screen.getByText('Tabort din bokning'));
    expect(mockOnBookDeleteClick).toHaveBeenCalledTimes(1);
  });
});
