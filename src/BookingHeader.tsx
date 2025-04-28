import React, {useState} from 'react';
import './BookingHeader.css';
import {isFamilyUberhead, useAuth} from "./authentication/AuthContext";
import FamilyMemberAdmin from './FamilyMemberAdmin';

type BookDialogProps = {
    title: string;
};

const BookHeader: React.FC<BookDialogProps> = ({title}) => {
    const {logout, setSignedIn} = useAuth();
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const isUberhead = isFamilyUberhead();

    const handleLogout = async () => {
        await logout();
        setSignedIn(false);
    }

    const handleAdminClick = () => {
        setIsAdminOpen(true);
    }

    const handleAdminClose = () => {
        setIsAdminOpen(false);
    }

    return (
        <div className="header-panel">
            <h2 className="title">{title}</h2>
            <div className="header-buttons">
                {isUberhead && (
                    <button className="adminButton" onClick={handleAdminClick}>
                        Admin
                    </button>
                )}
                <button className="logoutButton" onClick={handleLogout}>Logga ut</button>
            </div>
            {isUberhead && (
                <FamilyMemberAdmin isOpen={isAdminOpen} onClose={handleAdminClose} />
            )}
        </div>
    );
};

export default BookHeader;
