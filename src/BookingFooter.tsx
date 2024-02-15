import React, {useEffect, useState} from 'react';
import './BookingFooter.css';
import {format} from "date-fns";
import {sv} from "date-fns/locale";

type BookDialogProps = {
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    startDate: Date | null;
    endDate: Date | null;
};

const BookingFooter: React.FC<BookDialogProps> = ({onBookClick, startDate, endDate}) => {
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
            <button disabled={!startDate || !endDate} className="button" onClick={onBookClick}>Boka</button>
            <span></span>
            {startDate && endDate &&
                (
                    <div
                        className="footer-date-panel">{format(startDate, 'dd MMMM', {locale: sv})} - {format(endDate, 'dd MMMM', {locale: sv})}
                        </div>
                )}

        </div>
    );
};

export default BookingFooter;
