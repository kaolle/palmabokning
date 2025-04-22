import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

// Mock the child components to isolate App component testing
jest.mock('./authentication/LoginDialog', () => () => <div data-testid="login-dialog">Login Dialog</div>);
jest.mock('./Calendar', () => () => <div data-testid="calendar">Calendar</div>);
jest.mock('./authentication/AuthContext', () => ({
  AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>
}));

describe('App', () => {
  it('renders LoginDialog and Calendar components inside AuthProvider', () => {
    render(<App />);

    // Check that the AuthProvider is rendered
    const authProvider = screen.getByTestId('auth-provider');
    expect(authProvider).toBeInTheDocument();

    // Check that LoginDialog is rendered
    const loginDialog = screen.getByTestId('login-dialog');
    expect(loginDialog).toBeInTheDocument();

    // Check that Calendar is rendered
    const calendar = screen.getByTestId('calendar');
    expect(calendar).toBeInTheDocument();
  });
});
