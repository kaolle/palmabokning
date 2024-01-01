import './App.css';
import {useEffect} from "react";
import {AuthProvider, isTokenStillValid} from "./authentication/AuthContext";
import LoginDialog from "./authentication/LoginDialog";
import Calendar from "./Calendar";

function App() {
    useEffect(() => {
        isTokenStillValid();
    }, []);

    return (
        <AuthProvider>
            <LoginDialog/>
            <Calendar/>
        </AuthProvider>
    );
}
export default App;
