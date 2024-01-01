import React, {useState} from 'react';
import './../ModalDialogCommon.css';
import {useAuth} from "./AuthContext";

const LoginDialog = () => {
    const {login, signedIn} = useAuth();
    const [error, setError] = useState<boolean>(false);
    const [credentials, setCredentials] = useState<Credentials>({username: '', password: ''});
    const handleLogin = async () => {
        setError(false);
        await login(credentials)
            .catch((error) => {
                setError(true);
                console.error('Error fetching data:', error);
            });
    };

    const handleInputFocus = () => {
        // Clear the error message when either input receives focus after 300ms
        setTimeout(() => {
            setError(false);
        }, 300);
    };


    if (signedIn) {
        return;
    }

    return (
        <div>
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="header-container">
                        <h2>Login</h2>
                    </div>
                    {error && (
                        <div className={`error-panel ${error ? '' : 'hidden'}`}>
                            <p className="error-text">Något gick fel vid inloggningen, kan du ha skrivit fel lösenord eller rent av fel användarnamn.</p>
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" required
                               value={credentials.username}
                               onFocus={handleInputFocus}
                               onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" required
                               value={credentials.password}
                               onFocus={handleInputFocus}
                               onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    <div className="button-row">
                        <button className="modal-button __default" onClick={handleLogin}>Login</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginDialog;
