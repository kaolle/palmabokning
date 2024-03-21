/**
 * @jest-environment jsdom
 */
import Calendar from "../src/Calendar";
import {render} from "@testing-library/react";

describe('<Calendar/>', () => {
    it('selects an option in the dropdown', async () => {
        render(<Calendar />);

        screen.debug();

        // Find the select element
//    const selectElement = screen.getByRole('combobox');

        // Fire the change event with the new value
//    fireEvent.change(selectElement, { target: { value: 'valueOfOption' } });

        // Assert that the option is selected
//    expect(screen.getByRole('option', { name: 'Option Text' }).selected).toBe(true);
    });

})
