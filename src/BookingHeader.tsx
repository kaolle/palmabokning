import React, {useState} from 'react';
import './BookingHeader.css';
import {isFamilyUberhead, useAuth} from "./authentication/AuthContext";
import FamilyMemberAdmin from './FamilyMemberAdmin';
import Checklist from './Checklist';
import GuestBook from './GuestBook';

type BookDialogProps = {
    title: string;
};

const BookHeader: React.FC<BookDialogProps> = ({title}) => {
    const {logout, setSignedIn} = useAuth();
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const [isGuestBookOpen, setIsGuestBookOpen] = useState(false);
    const isUberhead = isFamilyUberhead();

    const handleLogout = async () => {
        await logout();
        setSignedIn(false);
    }

    return (
        <div className="header-panel">
            <h2 className="title">{title}</h2>
            <div className="header-buttons">
                <button className="guestBookButton" onClick={() => setIsGuestBookOpen(true)}>
                    Gästboken
                </button>
                <button className="checklistButton" onClick={() => setIsChecklistOpen(true)}>
                    Checklista
                </button>
                {isUberhead && (
                    <button className="adminButton" onClick={() => setIsAdminOpen(true)}>
                        Admin
                    </button>
                )}
                <button className="logoutButton" onClick={handleLogout}>Logga ut</button>
            </div>
            {isUberhead && (
                <FamilyMemberAdmin isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
            )}
            <Checklist isOpen={isChecklistOpen} onClose={() => setIsChecklistOpen(false)} />
            {isGuestBookOpen && <GuestBook onClose={() => setIsGuestBookOpen(false)} />}
        </div>
    );
};

export default BookHeader;
