// @ts-ignore
import React, {useEffect, useState} from 'react';
import {
    addDays,
    addMonths,
    addWeeks,
    eachDayOfInterval,
    eachWeekOfInterval,
    endOfWeek,
    format,
    getDay,
    getISOWeek,
    getMonth,
    startOfWeek,
} from 'date-fns';
import {sv} from 'date-fns/locale';

import './Calendar.css';
import Tooltip from "./Tooltip";
import {compareDateParts} from "./dateUtils";


const Calendar = () => {
    const title = "Palma Bokningskalender";
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<any | null>(null);
    const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({top: 0, left: 0});


    const today = new Date();

    const startWeek = startOfWeek(addWeeks(today, 1)); // Startdatum för den vecka som som går att boka är pågående vecka
    const endWeek = endOfWeek(addMonths(today, 2)); // Slutdatum för den vecka som som går att boka är 10 månader framåt
    // const endWeek = endOfWeek(addMonths(today, 10)); // Slutdatum för den vecka som som går att boka är 10 månader framåt

    const weeks = eachWeekOfInterval({start: startWeek, end: endWeek}, {weekStartsOn: 1});

    // Här filtrerar vi veckorna och dagarna i kalendern så att de inte inkluderar tidigare datum
    const formattedStartDate = selectedStartDate ? format(selectedStartDate, 'yyyy-MM-dd') : 'NOT SET';
    const formattedEndDate = selectedEndDate ? format(selectedEndDate, 'yyyy-MM-dd') : 'NOT SET';

    useEffect(() => {
        document.title = title;
    }, []);

    const handleDateClick = (date: Date) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        } else if (date >= selectedStartDate) {
            setSelectedEndDate(date);
        } else {
            setSelectedEndDate(selectedStartDate);
            setSelectedStartDate(date);
        }

    };

    const handleMouseEnter = (date: Date, event: any) => {
        const filterBookings = filterFromBookings(date);
        if (filterBookings.length === 1) {
            setHoveredBooking(filterBookings[0]);
            setTooltipPosition({
                top: event.clientY,
                left: event.clientX,
            });
        }

    };

    const handleMouseLeave = () => {
        setHoveredBooking(null);
    };

    useEffect(() => {
        // När selectedStartDate eller selectedEndDate ändras, körs denna kod för att uppdatera state
        if (selectedStartDate && selectedEndDate) {
            // Om båda datumen är valda, korrigerar vi ordningen så att startdatumet alltid kommer före slutdatumet
            if (selectedStartDate > selectedEndDate) {
                const temp = selectedStartDate;
                setSelectedStartDate(selectedEndDate);
                setSelectedEndDate(temp);
            }
        }
    }, [selectedStartDate, selectedEndDate]);

    useEffect(() => {
        // Define the URL of your backend API
        const apiUrl = 'http://localhost:8080/booking'; // Replace with your actual API URL

        // Make a GET request to fetch bookings data
        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
                // Assuming the response data is an array of bookings as described in your JSON
                setBookings(data);
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
                console.error('Error fetching data:', error);
            });
    }, []);

    const isSelectedDate = (date: Date) => {
        if (selectedStartDate && selectedEndDate) {
            return date >= selectedStartDate && date <= selectedEndDate;
        } else if (selectedStartDate) {
            return date.toString() === selectedStartDate.toString();
        } else {
            return false;
        }
    };

    const handleBooking = () => {
        if (!selectedStartDate || !selectedEndDate) {
            alert('Vänligen välj både ett startdatum och ett slutdatum innan du bokar.');
            return;
        }

        // Här kan du lägga till logik för att spara bokningen i din databas eller göra andra operationer baserat på de valda datumen
        // I det här exemplet sparar vi bara bokningarna lokalt i state
        const selectedDates = eachDayOfInterval({start: selectedStartDate, end: selectedEndDate});
        const newBookings = selectedDates.map((date) => ({
            date: format(date, 'yyyy-MM-dd'),
            bookedBy: 'Användare X',
        }));

        // setBookings([...bookings, ...newBookings]);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    let prevMonth = -1; // För att hålla koll på föregående månad (startvärdet -1 eftersom 0 är en giltig månad)

    const formattWeek = (date: Date) => {
        const isoWeek = getISOWeek(date);
        return isoWeek < 10 ? `V0${isoWeek}` : `V${isoWeek.toString()}`;
    };

    function getMonthAndWeek(weekStart: Date) {
        const weekDay = getDay(weekStart);
        // Format the ISO week number with leading zero
        const formattedWeek = formattWeek(weekStart);

        if (weekDay === 1 && getMonth(weekStart) !== prevMonth) {
            prevMonth = getMonth(weekStart);
            return <div className="year-month-week-number">
                <div className="year-and-month">{format(weekStart, 'yyyy MMMM', {locale: sv})} </div>
                <div className="week-number">{formattedWeek}</div>
            </div>;
        } else {
            return <div
                className="just-week-number">{formattedWeek}</div>;
        }
    }


    function filterFromBookings(date: Date) {
        return bookings.filter((booking) => {
            return compareDateParts(date, new Date(booking.from)) >= 0 && compareDateParts(date, new Date(booking.to)) <= 0;
        });
    }

    function isBooked(date: Date) {
        return filterFromBookings(date).length === 1;
    }

    function getCellSubClass(date: Date) {
        return isSelectedDate(date) ? 'selected' : isBooked(date) ? 'booked' : '';
    }

    // render sections
    if (loading) {
        return <div>Hämtar befintliga  bokningar...</div>;
    }

    if (error) {
        return <div>Fel: {error.message}</div>;
    }

   // console.log(`hovered booking in main: ${JSON.stringify(hoveredBooking)}`);

    return (
        <div className="booing-root">
            <h2 className="header">{title}</h2>
            <div className="calendar">
                {weeks.map((weekStart) => (
                    <div key={weekStart.toISOString()} className="week">
                        {getMonthAndWeek(weekStart)}
                        {eachDayOfInterval({start: weekStart, end: addDays(weekStart, 6)}).map((date) => {
                            return (<div key={date.toISOString()}>
                                    <input
                                        readOnly={true}
                                        className={`calendar-date ${getCellSubClass(date)}`}
                                        onClick={() => handleDateClick(date)}
                                        onMouseEnter={(event) => handleMouseEnter(date, event)}
                                        onMouseLeave={handleMouseLeave}
                                        value={format(date, 'yyyy-MM-dd')}
                                    />
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
            {hoveredBooking && (
                <div>
                    <Tooltip
                        booking={hoveredBooking}
                        style={{top: tooltipPosition.top, left: tooltipPosition.left}}
                    />
                </div>
            )}
        </div>
    );
};

export default Calendar;
