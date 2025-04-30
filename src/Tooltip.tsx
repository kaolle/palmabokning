import React, {CSSProperties, useEffect, useState} from 'react';
import './Tooltip.css';
import {generateColorFromName} from "./utils/colorUtils";


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

const Tooltip: React.FC<TooltipProps> = ({booking, style}) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        setIsActive(true);
    }, []);

    // Get color for the family member
    const memberColor = generateColorFromName(booking.familyMember.name);

    return (
        <div className={`tooltip ${isActive ? 'active' : ''}`} style={style}>
            <p>
                <span
                    style={{
                        display: 'inline-block',
                        width: '12px',
                        height: '12px',
                        backgroundColor: memberColor,
                        marginRight: '5px',
                        border: '1px solid #ccc',
                        borderRadius: '2px'
                    }}
                ></span>
                Bokad av: {booking.familyMember.name}
            </p>
            <p>Från: {getDatePart(booking.from)}</p>
            <p>Tom: {getDatePart(booking.to)}</p>
        </div>
    );
};

export default Tooltip;
