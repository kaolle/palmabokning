import React, {useEffect, useState} from 'react';
import './BookingFooter.css';
import {format} from "date-fns";
import {sv} from "date-fns/locale";

type BookDialogProps = {
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    onBookDeleteClick: React.MouseEventHandler<HTMLButtonElement>;
    startDate: Date | null;
    endDate: Date | null;
    yourBooking: Booking |null;
};

const BookingFooter: React.FC<BookDialogProps> = ({onBookClick, onBookDeleteClick, startDate, endDate, yourBooking}) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Delay showing the tooltip for 500 milliseconds (adjust as needed)
        timeoutId = setTimeout(() => {
            setIsActive(true);
        }, 1000);

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="footer-panel">
            {startDate && endDate &&
                (
                    <div>
                        <button className="button" onClick={onBookClick}>Boka</button>
                        <div
                            className="footer-date-panel">{format(startDate, 'dd MMMM', {locale: sv})} - {format(endDate, 'dd MMMM', {locale: sv})}
                        </div>
                    </div>
                )}
            {yourBooking && (
                <div>
                    <button className="button" onClick={onBookDeleteClick}>Tabort din bokning</button>
                    <div
                        className="footer-date-panel">{format(new Date(yourBooking.from), 'dd MMMM', {locale: sv})} - {format(new Date(yourBooking.to), 'dd MMMM', {locale: sv})}
                    </div>
                </div>
                )}
        </div>
    );
};

export default BookingFooter;
