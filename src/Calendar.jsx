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

const Calendar = () => {
    const title = "Palma Bokningskalender";
    const [bookings, setBookings] = useState([]);
    const [selectedStartDate, setSelectedStartDate] = useState(null);
    const [selectedEndDate, setSelectedEndDate] = useState(null);

    const today = new Date();

    const startWeek = startOfWeek(addWeeks(today, 1)); // Startdatum för den vecka som som går att boka är pågående vecka
    const endWeek = endOfWeek(addMonths(today, 10) ); // Slutdatum för den vecka som som går att boka är 10 månader framåt

    const weeks = eachWeekOfInterval({ start: startWeek, end: endWeek }, {weekStartsOn: 1});

    // Här filtrerar vi veckorna och dagarna i kalendern så att de inte inkluderar tidigare datum
    const formattedStartDate = selectedStartDate  ? format(selectedStartDate, 'yyyy-MM-dd') : 'NOT SET';
    const formattedEndDate = selectedEndDate ? format(selectedEndDate, 'yyyy-MM-dd') : 'NOT SET';
    console.log('Startdatum: ', formattedStartDate);
    console.log('Slutdatum: ', formattedEndDate);

    useEffect(() => {
        document.title = title;
    }, []);

    const handleDateClick = (date) => {
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            console.log(`here 1 \\"${date}\\"`);
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        } else if (date >= selectedStartDate) {
            console.log(`here 2 \\"${date}\\"`);
            setSelectedEndDate(date);
        } else {
            console.log(`here 3 \\"${date}\\"`);
            setSelectedEndDate(selectedStartDate);
            setSelectedStartDate(date);
        }

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

    const isSelectedDate = (date) => {
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
        const selectedDates = eachDayOfInterval({ start: selectedStartDate, end: selectedEndDate });
        const newBookings = selectedDates.map((date) => ({
            date: format(date, 'yyyy-MM-dd'),
            bookedBy: 'Användare X',
        }));

        setBookings([...bookings, ...newBookings]);
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    };

    let prevMonth = -1; // För att hålla koll på föregående månad (startvärdet -1 eftersom 0 är en giltig månad)

    const formattWeek = (date) => {
        const isoWeek = getISOWeek(date);
        return isoWeek < 10 ? `V0${isoWeek}` : `V${isoWeek.toString()}`;
    };

    function getMonthAndWeek(weekStart) {
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
                                        className={`calendar-date ${isSelectedDate(date) ? 'selected' : ''}`}
                                        onClick={() => handleDateClick(date)}
                                        value={format(date, 'yyyy-MM-dd')}
                                    />
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;
