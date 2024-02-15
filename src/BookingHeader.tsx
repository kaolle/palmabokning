import React from 'react';
import './BookingHeader.css';
import {useAuth} from "./authentication/AuthContext";

type BookDialogProps = {
    title: string;
};

const BookHeader: React.FC<BookDialogProps> = ({title}) => {
    const {logout, setSignedIn} = useAuth();

    const handleLogout = async () => {
        await logout();
        setSignedIn(false);
    }

    return (
        <div className="header-panel">
            <h2>{title}</h2>
            <button className="logoutButton" onClick={handleLogout}>Loga ut</button>
        </div>
    );
};

export default BookHeader;
