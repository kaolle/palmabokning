import React, {useEffect, useState} from 'react';
import './BookingFooter.css';
import {format} from "date-fns";
import {sv} from "date-fns/locale";
import {isFamilyUberhead} from "./authentication/AuthContext";
import {getFamilyMembersRequest} from "./rest/booking";

type BookDialogProps = {
    onBookClick: (familyMemberId?: string) => void;
    onBookAbort: React.MouseEventHandler<HTMLButtonElement>;
    onBookDeleteClick: React.MouseEventHandler<HTMLButtonElement>;
    startDate: Date | null;
    endDate: Date | null;
    yourBooking: Booking |null;
};

function formatDate(date: any) {
    return format(date, 'dd-MMMM', {locale: sv});
}

function formatBookedDate(date: any) {
    return format(new Date(date), 'dd-MMMM', {locale: sv});
}

const BookingFooter: React.FC<BookDialogProps> = ({onBookClick, onBookAbort, onBookDeleteClick, startDate, endDate, yourBooking}) => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMember | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const isUberhead = isFamilyUberhead();

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isUberhead) {
            setLoading(true);
            getFamilyMembersRequest()
                .then(response => {
                    setFamilyMembers(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching family members:', error);
                    setLoading(false);
                });
        }

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutId);
        };
    }, [isUberhead]);

    const handlePrevMember = () => {
        if (familyMembers.length === 0) return;

        const currentIndex = selectedFamilyMember
            ? familyMembers.findIndex(member => member.uuid === selectedFamilyMember.uuid)
            : -1;

        const newIndex = currentIndex <= 0
            ? familyMembers.length - 1
            : currentIndex - 1;

        setSelectedFamilyMember(familyMembers[newIndex]);
    };

    const handleNextMember = () => {
        if (familyMembers.length === 0) return;

        const currentIndex = selectedFamilyMember
            ? familyMembers.findIndex(member => member.uuid === selectedFamilyMember.uuid)
            : -1;

        const newIndex = currentIndex === -1 || currentIndex === familyMembers.length - 1
            ? 0
            : currentIndex + 1;

        setSelectedFamilyMember(familyMembers[newIndex]);
    };

    const handleBookClick = () => {
        if (isUberhead && selectedFamilyMember) {
            onBookClick(selectedFamilyMember.uuid);
        } else {
            onBookClick();
        }
    };

    return (
        <div className="footer-panel">
            {startDate && endDate &&
                (
                    <div className="buttonRow">
                        <button className="button" onClick={handleBookClick}>Boka</button>
                        <div
                            className="footer-date-panel">{formatDate(startDate)} - {formatDate(endDate)}
                        </div>
                        <div>
                            <button className="rightButton" onClick={onBookAbort}>Tabort</button>
                        </div>
                    </div>
                )
            }
            {isUberhead && startDate && endDate && (
                <div className="family-member-selector">
                    <button onClick={handlePrevMember} disabled={loading}>←</button>
                    <span>{loading ? "Laddar..." : selectedFamilyMember ? selectedFamilyMember.name : "Välj familjemedlem"}</span>
                    <button onClick={handleNextMember} disabled={loading}>→</button>
                </div>
            )}
            {yourBooking && (
                <div className="buttonRow">
                    <button className="button" onClick={onBookDeleteClick}>Tabort din bokning</button>
                    <div
                        className="footer-date-panel">{formatBookedDate(yourBooking.from)} - {formatBookedDate(yourBooking.to)}
                    </div>
                </div>
                )
            }
        </div>
    );
};

export default BookingFooter;
