import './App.css';
import {useEffect} from "react";
import {AuthProvider} from "./authentication/AuthContext";
import LoginDialog from "./authentication/LoginDialog";
import Calendar from "./Calendar";

function App() {
    useEffect(() => {
    }, []);

    return (
        <AuthProvider>
            <LoginDialog/>
            <Calendar/>
        </AuthProvider>
    );
}
export default App;
