import React, {useState} from 'react';
import './LoginDialog.css';
import {useAuth} from "./AuthContext";
import WalkingPerson from "../WalkingPerson";

enum Operations {
    LoginOp = 'login',
    CreateOp = 'enroll',
}
type OperationTypes = typeof Operations[keyof typeof Operations]; // recommended for performance reason otherwhice genereated code kan become "huge"

const LoginDialog = () => {
    const {login, signedIn, signup} = useAuth();
    const [error, setError] = useState<boolean>(false);
    const [credentials, setCredentials] = useState<Credentials>({username: '', password: '', familyPhrase: ''});
    const [selectedOperation, setSelectedOperation] = useState<OperationTypes>(Operations.LoginOp);
    const [isPasswordValid, setPasswordValid] = useState(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleLogin = async () => {
        setError(false);
        try {
            setIsLoading(true);
            if (selectedOperation === Operations.LoginOp) {
                await login(credentials);
            } else {
                if (validPassword(credentials.password)) {
                    await signup(credentials);
                } else {
                    setPasswordValid(false);
                }
            }
        } catch (e) {
            setError(true);
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }

    }

    const handleInputFocus = () => {
        // Clear the error message when either input receives focus after 300ms
        setTimeout(() => {
            setError(false);
            setPasswordValid(true);
        }, 300);
    }
    const handleCreateAccount = () => {
        setSelectedOperation(selectedOperation===Operations.LoginOp?Operations.CreateOp:Operations.LoginOp);
        console.log("radio button changed");
    }

    function validPassword(password: string) {
        // Minimum length of 8 characters
        const minLength = 8;

        // Regular expressions for digit and special character
        const digitRegex = /\d/;
        const specialCharRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/;

        // Check for minimum length
        if (password.length < minLength) {
            return false;
        }

        // Check for at least 1 digit
        if (!digitRegex.test(password)) {
            return false;
        }

        // Check for at least 1 special character
        if (!specialCharRegex.test(password)) {
            return false;
        }

        // If all conditions are met, the password is valid
        return true;
    }

    const validatePassword = () => {
        if (selectedOperation === Operations.CreateOp) {
            setTimeout(() => {
                setPasswordValid(validPassword(credentials.password));
            }, 300)
        }
    };

    if (signedIn) {
        return;
    }

    return (
        <div>
            <div className="modal-overlay">
                <div className={`modal-content ${selectedOperation=== Operations.LoginOp ? 'login-modal' : 'create-account-modal'}`}>
                    <div className="account-question-container">
                        <span>Har du konto?</span>
                        <button className="modal-button __default"
                                onClick={handleCreateAccount}>{selectedOperation===Operations.LoginOp?'Nej':'Ja'}</button>
                    </div>
                    {error && (
                        <div className={`error-panel ${error ? '' : 'hidden'}`}>
                            {selectedOperation===Operations.LoginOp && (<p className="error-text">Något gick fel vid inloggningen, kan du ha skrivit fel lösenord
                                eller rent av fel användarnamn.</p>)}
                            {selectedOperation===Operations.CreateOp && (<p className="error-text">Något gick fel när kontot skulle skapas, kanske du angav fel familjefras, kolla med Stefan att den stämmer</p>)}
                        </div>
                    )}
                    {selectedOperation === Operations.CreateOp && (<div className="form-group">
                        <label htmlFor="familyPhrase">Din familjefras:</label>
                        <input type="text" id="familyPhrase" name="familyPhrase" required
                               value={credentials.familyPhrase}
                               onFocus={handleInputFocus}
                               onBlur={validatePassword}
                               onChange={(e) => setCredentials({...credentials, familyPhrase: e.target.value})}
                        />
                    </div>)}
                    <div className="form-group">
                        <label
                            htmlFor="username">{selectedOperation === Operations.LoginOp ? 'Användarnamn:' : 'Önskat användarnamn:'}</label>
                        <input type="text" id="username" name="username" required
                               value={credentials.username}
                               onFocus={handleInputFocus}
                               onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label
                            htmlFor="password">{selectedOperation === Operations.LoginOp ? 'Lösenord:' : 'Önskat lösenord:'}</label>
                        <input type="password" id="password" name="password" required
                               value={credentials.password}
                               onFocus={handleInputFocus}
                               onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                               style={{borderColor: isPasswordValid ? 'initial' : 'red'}}
                        />
                        {!isPasswordValid && (
                            <p style={{color: 'red'}}>
                                Lösenordet måste vara minst 8 tecken långt med minst en siffra och ett special tecken.
                            </p>
                        )}
                    </div>
                    <div className="button-row">
                        <button className="modal-button __default"
                                onClick={handleLogin}>{selectedOperation === Operations.LoginOp ? 'Login' : 'Skapa konto'}</button>
                    </div>

                    {isLoading && (<div className="button-row">
                            <WalkingPerson action = {selectedOperation===Operations.LoginOp? 'Loggar in...' : 'Skapar ditt konto...'} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginDialog;
