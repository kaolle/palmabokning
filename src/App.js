import './App.css';
import {useEffect} from "react";
import {AuthProvider} from "./authentication/AuthContext";
import LoginDialog from "./authentication/LoginDialog";
import Calendar from "./Calendar";

function App() {
    useEffect(() => {
        const today = new Date();
        //const today = new Date(new Date().getFullYear(), 7, 15);
        const year = today.getFullYear();
        const rampStart = new Date(year, 4,  1);  // 1 maj   — börjar bli röd
        const peak      = new Date(year, 7,  1);  // 1 aug   — max röd
        const rampEnd   = new Date(year, 10, 1);  // 1 nov   — tillbaka till grönt

        const now = today.getTime();
        let t = 0;
        if (now >= rampStart && now <= peak) {
            t = (now - rampStart) / (peak - rampStart);       // 0→1 jun–sep
        } else if (now > peak && now <= rampEnd) {
            t = 1 - (now - peak) / (rampEnd - peak);          // 1→0 sep–okt
        }

        const lerp = (a, b) => Math.round(a + (b - a) * t);

        // t=0 → originalgrön/blå,  t=1 → eldröd
        const startR = lerp(174, 215);
        const startG = lerp(196,  35);
        const startB = lerp( 95,  12);
        const endR   = lerp(101, 170);
        const endG   = lerp(157,  10);
        const endB   = lerp(189,  10);

        const root = document.documentElement;
        root.style.setProperty('--brand-start-rgb', `${startR}, ${startG}, ${startB}`);
        root.style.setProperty('--brand-end-rgb',   `${endR}, ${endG}, ${endB}`);
        root.classList.toggle('fire-season', t > 0);
    }, []);

    return (
        <AuthProvider>
            <LoginDialog/>
            <Calendar/>
        </AuthProvider>
    );
}
export default App;
