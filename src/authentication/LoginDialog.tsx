import React, {useState} from 'react';
import './../ModalDialogCommon.css';
import {useAuth} from "./AuthContext";

enum Operations {
    LoginOp = 'login',
    CreateOp = 'enroll',
}

const LoginDialog = () => {
    const {login, signedIn, signup} = useAuth();
    const [error, setError] = useState<boolean>(false);
    const [credentials, setCredentials] = useState<Credentials>({username: '', password: '', familyPhrase: ''});
    const [selectedOperation, setSelectedOperation] = useState<Operations>(Operations.LoginOp);
    const [isPasswordValid, setPasswordValid] = useState(true);
    const handleLogin = async () => {
        setError(false);
        try {
            if (selectedOperation === Operations.LoginOp) {
                await login(credentials);
            } else {
                await signup(credentials);
            }
        } catch (e) {
            setError(true);
            console.error('Error fetching data:', error);
        }

    }

    const handleInputFocus = () => {
        // Clear the error message when either input receives focus after 300ms
        setTimeout(() => {
            setError(false);
            setPasswordValid(true);
        }, 300);
    }
    const handleRadioChange = (value: Operations) => {
        setSelectedOperation(value);
        console.log("radio button changed");
    }

    function validPassword(password:string) {
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
    const handlePasswordChange = (e:any) => {
        const newPassword = e.target.value;
        setCredentials({...credentials, password: newPassword})
        if (selectedOperation===Operations.CreateOp && newPassword.length > 4) {
            setTimeout(() => {
                setPasswordValid(validPassword(newPassword));
            }, 500)
        }
    };

    if (signedIn) {
        return;
    }

    return (
        <div>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="radio-container">
                        <label className="radio-label">
                            <input
                                type="radio"
                                value={Operations.LoginOp}
                                checked={selectedOperation === Operations.LoginOp}
                                onChange={() => handleRadioChange(Operations.LoginOp)}
                            />
                            <span>Login</span>
                        </label>
                        <label className="radio-label">
                            <input
                                type="radio"
                                value={Operations.CreateOp}
                                checked={selectedOperation === Operations.CreateOp}
                                onChange={() => handleRadioChange(Operations.CreateOp)}
                            />
                            <span>Skapa Konto</span>
                        </label>
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
                               onChange={handlePasswordChange}
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
                </div>
            </div>
        </div>
    );
};

export default LoginDialog;
