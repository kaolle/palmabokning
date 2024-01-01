interface AuthContextProps {
    signedIn: boolean;
    setSignedIn: React.Dispatch<React.SetStateAction<boolean>>;
    login: (credentials: Credentials) => Promise<void>;
    signup: (userData: UserData) => Promise<void>;
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
}

interface UserData {
    // Define user registration properties as needed
    username: string;
    email: string;
    password: string;
}
