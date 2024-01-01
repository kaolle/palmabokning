import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import {loginRequest} from "../rest/authentication";
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const JWT_TOKEN = 'jwtToken';
export const TOKEN_TYPE = 'tokenType';
const JWT_EXPIRATION_TIMESTAMP = 'jwtExpirationTimestamp';
function getJwtToken() {
    // @ts-ignore
    return localStorage.getItem(JWT_TOKEN);
}

export default function useJwtTokenData() {
    const [jwtToken, setJwtToken] = useState(getJwtToken());

    useEffect(() => {
        function handleChangeStorage() {
            setJwtToken(getJwtToken());
        }

        window.addEventListener('storage', handleChangeStorage);
        return () => window.removeEventListener('storage', handleChangeStorage);
    }, []);

    return jwtToken;
}

export const decodeAndSaveExpirationTime = (accessToken:string) => {
    try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken: any = JSON.parse(jsonPayload);
        const jwtExpirationTimestamp:number = decodedToken.exp;

        localStorage.setItem(JWT_EXPIRATION_TIMESTAMP, String(jwtExpirationTimestamp));

        return {jwtExpirationTimestamp};

    } catch (error) {
        console.error('Error decoding or checking token:', error);
    }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [signedIn, setSignedIn] = useState<boolean>(false);

    useJwtTokenData();

    const login = async (credentials: Credentials) => {
        const response = await loginRequest(credentials);

        // Assuming the API response includes a JWT token and its expiration time
        const {accessToken, tokenType} = response.data;
        // Store the token and expiration timestamp in localStorage
        localStorage.setItem(JWT_TOKEN, accessToken);
        localStorage.setItem(TOKEN_TYPE, tokenType);

        decodeAndSaveExpirationTime(accessToken);

        setSignedIn(true);

    };

    const signup = async (userData: UserData) => {
        // TODO Implement signup logic here
    };

    const logout = async () => {
        clearLoginState();
    };

    const contextValue: AuthContextProps = { signedIn, setSignedIn, login, signup, logout };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const isTokenStillValid = () => {
    const jwtExpirationTimestamp = localStorage.getItem(JWT_EXPIRATION_TIMESTAMP);
    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds

    // Check if the token is expired
    if (currentTimestamp > Number(jwtExpirationTimestamp)) {
        console.log('Token has expired');
        clearLoginState();
        return false;
    } else {
        console.log('Token is still valid');
        return true;
    }
};

function clearLoginState() {
    localStorage.removeItem(JWT_TOKEN);
    localStorage.removeItem(TOKEN_TYPE);
    localStorage.removeItem(JWT_EXPIRATION_TIMESTAMP);
}
