interface AuthContextProps {
    signedIn: boolean;
    setSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
    login: (credentials: Credentials) => Promise<void>;
    signup: (credentials: Credentials) => Promise<void>;
    logout: () => Promise<void>;
}

interface User {
    // Define user properties as needed
    username: string;
    accessToken: string;
    tokenType: string;
}

interface Credentials {
    username: string;
    password: string;
    familyPhrase: string;
}

