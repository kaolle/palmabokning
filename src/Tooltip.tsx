import React, {CSSProperties, useEffect, useState} from 'react';
import './Tooltip.css';

type TooltipProps = {
    booking: Booking;
    style?: CSSProperties; // Define the style prop
};

function getDatePart(date: Date) {
    return date.toString().split('T')[0];
}

const Tooltip: React.FC<TooltipProps> = ({ booking,style }) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        // Delay showing the tooltip for 300 milliseconds (adjust as needed)
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
