import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import LoginDialog from './LoginDialog';
import {useAuth} from './AuthContext';
import WalkingPerson from '../WalkingPerson';

// Mock the useAuth hook
jest.mock('./AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock the WalkingPerson component
jest.mock('../WalkingPerson', () => {
  return jest.fn(({ action }) => <div data-testid="walking-person">{action}</div>);
});

describe('LoginDialog', () => {
  const mockLogin = jest.fn();
  const mockSignup = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup the mock implementation for useAuth
    useAuth.mockReturnValue({
      login: mockLogin,
      signup: mockSignup,
      signedIn: false
    });
  });

  it('renders the login form by default', () => {
    render(<LoginDialog />);

    // Check that the login form elements are rendered
    expect(screen.getByText('Har du konto?')).toBeInTheDocument();
    expect(screen.getByText('Nej')).toBeInTheDocument();
    expect(screen.getByLabelText('Användarnamn:')).toBeInTheDocument();
    expect(screen.getByLabelText('Lösenord:')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();

    // Family phrase should not be visible in login mode
    expect(screen.queryByLabelText('Din familjefras:')).not.toBeInTheDocument();
  });

  it('switches to create account form when "Nej" button is clicked', () => {
    render(<LoginDialog />);

    // Click the "Nej" button to switch to create account mode
    fireEvent.click(screen.getByText('Nej'));

    // Check that the create account form elements are rendered
    expect(screen.getByText('Har du konto?')).toBeInTheDocument();
    expect(screen.getByText('Ja')).toBeInTheDocument();
    expect(screen.getByLabelText('Din familjefras:')).toBeInTheDocument();
    expect(screen.getByLabelText('Önskat användarnamn:')).toBeInTheDocument();
    expect(screen.getByLabelText('Önskat lösenord:')).toBeInTheDocument();
    expect(screen.getByText('Skapa konto')).toBeInTheDocument();
  });

  it('calls login function with credentials when Login button is clicked', async () => {
    render(<LoginDialog />);

    // Fill in the login form
    fireEvent.change(screen.getByLabelText('Användarnamn:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Lösenord:'), { target: { value: 'password123!' } });

    // Click the Login button
    fireEvent.click(screen.getByText('Login'));

    // Check that the login function was called with the correct credentials
    expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123!', familyPhrase: '' });

    // Check that the loading indicator is shown
    expect(WalkingPerson).toHaveBeenCalledWith({ action: 'Loggar in...' }, {});
  });

  it('calls signup function with credentials when Skapa konto button is clicked with valid password', async () => {
    render(<LoginDialog />);

    // Switch to create account mode
    fireEvent.click(screen.getByText('Nej'));

    // Fill in the create account form with valid password
    fireEvent.change(screen.getByLabelText('Din familjefras:'), { target: { value: 'secretphrase' } });
    fireEvent.change(screen.getByLabelText('Önskat användarnamn:'), { target: { value: 'newuser' } });
    fireEvent.change(screen.getByLabelText('Önskat lösenord:'), { target: { value: 'Password123!' } });

    // Click the Skapa konto button
    fireEvent.click(screen.getByText('Skapa konto'));

    // Check that the signup function was called with the correct credentials
    expect(mockSignup).toHaveBeenCalledWith({ username: 'newuser', password: 'Password123!', familyPhrase: 'secretphrase' });

    // Check that the loading indicator is shown
    expect(WalkingPerson).toHaveBeenCalledWith({ action: 'Skapar ditt konto...' }, {});
  });

  it('shows password validation error when password is invalid', async () => {
    render(<LoginDialog />);

    // Switch to create account mode
    fireEvent.click(screen.getByText('Nej'));

    // Fill in the create account form with invalid password (too short)
    fireEvent.change(screen.getByLabelText('Önskat lösenord:'), { target: { value: 'pass' } });

    // Trigger validation by clicking outside the input
    fireEvent.change(screen.getByLabelText('Önskat lösenord:'), { target: { value: 'invalid' } });

    fireEvent.click((screen.getByText('Skapa konto')));

    // Wait for the validation message to appear
    await waitFor(() => {
      expect(screen.getByText('Lösenordet måste vara minst 8 tecken långt med minst en siffra och ett special tecken.')).toBeInTheDocument();
    });

    // Click the Skapa konto button
    fireEvent.click(screen.getByText('Skapa konto'));

    // Check that the signup function was not called
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('shows error message when login fails', async () => {
    // Make the login function throw an error
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginDialog />);

    // Fill in the login form
    fireEvent.change(screen.getByLabelText('Användarnamn:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Lösenord:'), { target: { value: 'password123!' } });

    // Click the Login button
    fireEvent.click(screen.getByText('Login'));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Något gick fel vid inloggningen/)).toBeInTheDocument();
    });
  });

  it('clears error message when input receives focus', async () => {
    // Make the login function throw an error
    mockLogin.mockRejectedValueOnce(new Error('Login failed'));

    render(<LoginDialog />);

    // Fill in the login form
    fireEvent.change(screen.getByLabelText('Användarnamn:'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Lösenord:'), { target: { value: 'password123!' } });

    // Click the Login button to trigger error
    fireEvent.click(screen.getByText('Login'));

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Något gick fel vid inloggningen/)).toBeInTheDocument();
    });

    // Focus on an input
    fireEvent.focus(screen.getByLabelText('Användarnamn:'));

    // Wait for the error message to disappear
    await waitFor(() => {
      expect(screen.queryByText(/Något gick fel vid inloggningen/)).not.toBeInTheDocument();
    }, { timeout: 400 }); // Slightly longer than the 300ms timeout in the component
  });

  it('does not render anything when user is signed in', () => {
    // Set signedIn to true
    useAuth.mockReturnValue({
      login: mockLogin,
      signup: mockSignup,
      signedIn: true
    });

    const { container } = render(<LoginDialog />);

    // The component should not render anything
    expect(container.firstChild).toBeNull();
  });
});
