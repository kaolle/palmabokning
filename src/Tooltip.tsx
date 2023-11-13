import React, {CSSProperties, useEffect, useState} from 'react';
import './Tooltip.css';

type TooltipProps = {
    booking: Booking;
    style?: CSSProperties; // Define the style prop
};

function getDatePart(dateString: string) {

    const date: Date = new Date(dateString);
    // Get the date components
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-based
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const Tooltip: React.FC<TooltipProps> = ({ booking,style }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Delay showing the tooltip for 500 milliseconds (adjust as needed)
        timeoutId = setTimeout(() => {
            setIsActive(true);
        }, 500);

        return () => {
            // Clear the timeout when the component unmounts
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className={`tooltip ${isActive ? 'active' : ''}`} style={style}>
            <p>Bokad av: {booking.familyMember.name}</p>
            <p>Från: {getDatePart(booking.from)}</p>
            <p>Tom: {getDatePart(booking.to)}</p>
        </div>
    );
};

export default Tooltip;
