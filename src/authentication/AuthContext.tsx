import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {loginRequest, signupRequest} from "../rest/authentication";

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const JWT_TOKEN = 'jwtToken';
export const TOKEN_TYPE = 'tokenType';
const JWT_EXPIRATION_TIMESTAMP = 'jwtExpirationTimestamp';
const FAMILY_MEMBER_ID = 'familyMemberId';
const USER_ROLE = 'userRole';

const getJwtToken = () => {
    return localStorage.getItem(JWT_TOKEN);
}

export const getFamilyMemberId = () => {
    const id = localStorage.getItem(FAMILY_MEMBER_ID);
    return id ? id : "familyMemberIsMissing";
}

export const getUserRole = () => {
    const role = localStorage.getItem(USER_ROLE);
    return role ? role : "";
}

export const isFamilyUberhead = () => {
    const role = getUserRole();
    return role.includes("ROLE_FAMILY_UBERHEAD");
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

export const decodeAndSaveExpirationTime = (accessToken: string) => {
    try {
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const decodedToken: any = JSON.parse(jsonPayload);
        const jwtExpirationTimestamp = decodedToken.exp;
        localStorage.setItem(JWT_EXPIRATION_TIMESTAMP, jwtExpirationTimestamp);

        // Convert timestamp to Date object for human-readable format
        const jwtTokenExpiresAt = new Date(jwtExpirationTimestamp * 1000);

        return { jwtExpirationTimestamp, jwtTokenExpiresAt };
    } catch (error) {
        console.error('Error decoding or checking token:', error);
        return { jwtExpirationTimestamp: 0, jwtTokenExpiresAt: new Date(0) };
    }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [signedIn, setSignedIn] = useState<boolean>(false);

    useJwtTokenData();


    const login = async (credentials: Credentials) => {
        const response = await loginRequest(credentials);

        // API response includes a JWT token, user info, and roles array
        const {accessToken, tokenType, id, roles} = response.data;

        storeAuthData(accessToken, tokenType, id, roles);

        decodeAndSaveExpirationTime(accessToken);

        setSignedIn(true);

    };

    const signup = async (credentials: Credentials) => {
        const response = await signupRequest(credentials);

        // API response includes a JWT token, user info, and roles array
        const {accessToken, tokenType, id, roles} = response.data;

        storeAuthData(accessToken, tokenType, id, roles);

        decodeAndSaveExpirationTime(accessToken);

        setSignedIn(true);
    };

    const storeAuthData = (accessToken:string, tokenType: string, id: string, roles: string[]) => {
        localStorage.setItem(JWT_TOKEN, accessToken);
        localStorage.setItem(TOKEN_TYPE, tokenType);
        localStorage.setItem(FAMILY_MEMBER_ID, id);
        localStorage.setItem(USER_ROLE, roles.join(','));
    }

    const logout = async () => {
        console.log("logout");
        clearLoginState();
    };

    const contextValue: AuthContextProps = {signedIn, setSignedIn, login, signup, logout};

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const isTokenStillValid = (): boolean => {
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
    localStorage.removeItem(FAMILY_MEMBER_ID);
    localStorage.removeItem(JWT_EXPIRATION_TIMESTAMP);
    localStorage.removeItem(USER_ROLE);
}
