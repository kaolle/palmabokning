import React from 'react';
import {render, screen} from '@testing-library/react';
import WalkingPerson from './WalkingPerson';

describe('WalkingPerson', () => {
  it('renders the action message', () => {
    const actionMessage = 'Loading...';
    render(<WalkingPerson action={actionMessage} />);

    expect(screen.getByText(actionMessage)).toBeInTheDocument();
  });

  it('renders the walking person image', () => {
    render(<WalkingPerson action="Loading..." />);

    const image = screen.getByAltText('Walking Person');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://media.giphy.com/media/l41lIZZLqfJqDCvYY/giphy.gif');
  });

  it('applies the correct styles to the image', () => {
    render(<WalkingPerson action="Loading..." />);

    const image = screen.getByAltText('Walking Person');
    expect(image).toHaveStyle('width: 90%');
    expect(image).toHaveStyle('height: 85%');
  });

  it('renders within a loading overlay container', () => {
    const { container } = render(<WalkingPerson action="Loading..." />);

    expect(container.querySelector('.loading-overlay')).toBeInTheDocument();
  });
});
