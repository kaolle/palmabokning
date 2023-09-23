// Calendar.__test__.js
import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import MockDate from 'mockdate';
import {fromDate, server, toDate, famillyMember} from './mockServiceWorker';

// Import your Calendar component
import Calendar from './Calendar';


describe('Calendar', () => {
    const theDayIWasBorn = '1963-01-16';
    beforeEach(() => MockDate.set(theDayIWasBorn + 'T00:00:00Z'))
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        MockDate.reset();}
    );
    afterAll(() => server.close());

    it('fetches and displays data', async () => {
        const { container } = render(<Calendar />);

        expect(screen.getByText('Laddar sidan...')).toBeInTheDocument();

        // Wait for the data to be loaded and displayed
        await waitFor(() => {
            expect(screen.getByText('Palma Bokningskalender')).toBeInTheDocument();
        });

        // Use getByDisplayValue to find the input with the specific date
        const myBirthDay = screen.getByDisplayValue(theDayIWasBorn);
        const bookingFromDate = screen.getByDisplayValue(fromDate);
        const bookingToDate = screen.getByDisplayValue(toDate);

        // Verify that current date and booking dates are included
        expect(myBirthDay).toBeInTheDocument();
        expect(bookingFromDate).toBeInTheDocument();
        expect(bookingToDate).toBeInTheDocument();

        // verify that booked dates are colour marked with grey
        expect(window.getComputedStyle(bookingFromDate).backgroundColor).toBe('rgb(171, 163, 162)');
        expect(window.getComputedStyle(bookingToDate).backgroundColor).toBe('rgb(171, 163, 162)');

        fireEvent.click(myBirthDay);
        fire.hover(bookingFromDate);

        const bookingInfo = await screen.getByText('Eskilera har bokat detta datum');
        await waitFor(() => {

            const selectedMyBirthDay = screen.getByDisplayValue(theDayIWasBorn);
            // Get the computed style of the input element
            const computedStyle = window.getComputedStyle(selectedMyBirthDay);

            // Verify the background color of the input element
            const backgroundColor = computedStyle.backgroundColor;

            // Assert that the background color matches the expected color
            // TODO find out why this does not work, expect(backgroundColor).toBe('rgba(140, 210, 152, 0.54)');
        })

    });

    it('on mouse enter for booked date tooltip is displayed', async () => {
        const { container } = render(<Calendar />);

        // Wait for the data to be loaded and displayed
        await waitFor(() => {
            expect(screen.getByText('Palma Bokningskalender')).toBeInTheDocument();
        });

        const bookingFromDate = screen.getByDisplayValue(fromDate);

        // Verify that current date and booking dates are included
        expect(bookingFromDate).toBeInTheDocument();

        // verify that booked dates are colour marked with grey

        fireEvent.mouseEnter(bookingFromDate);
        expect(await screen.getByDisplayValue(`Bokad av: ${famillyMember}`)).toBeInTheDocument();
        // expect(await screen.getByDisplayValue(`Från: ${fromDate}`)).toBeInTheDocument();
        // expect(await screen.getByDisplayValue(`Tom: ${toDate}`)).toBeInTheDocument();

    });

    // Add more __test__ cases as needed
});
