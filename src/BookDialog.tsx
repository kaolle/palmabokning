import React, {CSSProperties, useEffect, useState} from 'react';
import './BookDialog.css';

type BookDialogProps = {
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    onCancelClick: React.MouseEventHandler<HTMLButtonElement>;
    existingBooking: Booking|null;
    style?: CSSProperties; // Define the style prop
};
function getDatePart(date: Date) {
    // Get the date components
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const BookDialog: React.FC<BookDialogProps> = ({onBookClick, onCancelClick, existingBooking, style}) => {
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
        <div className={`bookDialog ${isActive ? 'active' : ''}`} style={style}>
            <div className="label">Vill du boka ?</div>
            <div  className="buttonRow">
                <button className="button" onClick={onBookClick}>Ja</button>
                <button className="button" onClick={onCancelClick}>Nej</button>
            </div>
            {existingBooking && (
                <div>
                <p>Blivit Bookad av: {existingBooking.familyMember.name}</p>
                <p>Från: {getDatePart(existingBooking.from)}</p>
                <p>Tom: {getDatePart(existingBooking.to)}</p>
            </div>)}
        </div>
    );
};

export default BookDialog;
