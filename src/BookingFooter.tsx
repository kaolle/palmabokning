import React, {useEffect} from 'react';
import './BookingFooter.css';
import {format} from "date-fns";
import {sv} from "date-fns/locale";

type BookDialogProps = {
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    onBookAbort: React.MouseEventHandler<HTMLButtonElement>;
    onBookDeleteClick: React.MouseEventHandler<HTMLButtonElement>;
    startDate: Date | null;
    endDate: Date | null;
    yourBooking: Booking |null;
};

function formatDate(date: any) {
    return format(date, 'dd/MM', {locale: sv});
}

function formatBookedDate(date: any) {
    return format(new Date(date), 'dd/MM', {locale: sv});
}

const BookingFooter: React.FC<BookDialogProps> = ({onBookClick, onBookAbort, onBookDeleteClick, startDate, endDate, yourBooking}) => {

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="footer-panel">
            {startDate && endDate &&
                (
                    <div className="buttonRow">
                        <button className="button" onClick={onBookClick}>Boka</button>
                        <div
                            className="footer-date-panel">{formatDate(startDate)} - {formatDate(endDate)}
                        </div>
                        <div>
                            <button className="abortButton" onClick={onBookAbort}>{'\u274C'}</button>
                        </div>
                    </div>
                )
            }
            {yourBooking && (
                <div>
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
