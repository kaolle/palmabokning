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
import {useMediaQuery} from 'react-responsive';
import {getBookingsRequest, postBookingRequest} from "./rest/booking";
import {getFamilyMemberId, isTokenStillValid, useAuth} from "./authentication/AuthContext";
import BookingFooter from "./BookingFooter";
import BookingHeader from "./BookingHeader";

function getOptionalDate(theDate: Date | null) {
    return theDate !== null ? theDate : new Date();
}

function formattDate(isMobile:boolean, date: Date) {
    return isMobile ? format(date, 'dd') : format(date, 'yyyy-MM-dd');
}

const Calendar = () => {
    const { signedIn, setSignedIn } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 600 });
    const isTablet = useMediaQuery({ minWidth: 601, maxWidth: 768 });

    const title = "Palma Bokningskalender";
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [yourBookings, setYourBookings] = useState<Booking[]>([]);
    const [existingBooking, setExistingBooking] = useState<Booking|null>(null);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<any | null>(null);
    const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<PopupPosition>({top: 0, left: 0});
    const tooltipPositioning: PopupPositioning = {width: 150, height: 150, windowPadding: 70};
    const [showBookDialog, setShowBookDialog] = useState<Boolean>(false);
    const [bookDialogPosition, setBookDialogPosition] = useState<PopupPosition>({top: 0, left: 0});
    const bookDialogPositioning: PopupPositioning = {width: 300, height: 70, windowPadding: 70};

    const today = new Date();

    const startWeek = startOfWeek(addWeeks(today, 1)); // Startdatum för den vecka som som går att boka är pågående vecka
    const endWeek = endOfWeek(addMonths(today, 12)); // Slutdatum för den vecka som som går att boka är 10 månader framåt
    // const endWeek = endOfWeek(addMonths(today, 10)); // Slutdatum för den vecka som som går att boka är 10 månader framåt

    const weeks = eachWeekOfInterval({start: startWeek, end: endWeek}, {weekStartsOn: 1});
    const familyMemberId = getFamilyMemberId();

    useEffect(() => {
        document.title = title;
        setSignedIn(isTokenStillValid());
        // Adjust this as needed
    }, []);

    function calculatePositioning(event: any, popupPositioning: PopupPositioning) {
        // Calculate the initial position
        let pos : PopupPosition = {
            left: event.clientX + (window.scrollX || window.pageXOffset),
            top: event.clientY + (window.scrollY || window.pageYOffset)
        };

        // Adjust the tooltip position if it's too close to the window boundaries
        const windowWidth = window.innerWidth;

        const windowHeight = window.innerHeight;
        if (pos.left + popupPositioning.width > windowWidth) {
            pos.left = windowWidth + (window.scrollX || window.pageXOffset) - popupPositioning.width - popupPositioning.windowPadding;
        }
        if (pos.top + popupPositioning.height > windowHeight) {
            pos.top = windowHeight + (window.scrollY || window.pageYOffset) - popupPositioning.height - popupPositioning.windowPadding;
        }
        return pos;
    }

    const handleDateClick = (date: Date,  event: any) => {
        if (isBooked(date)) {
            return;
        }
        if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
            setSelectedStartDate(date);
            setSelectedEndDate(null);
        } else if (date >= selectedStartDate) {
            setSelectedEndDate(date);
        } else {
            setSelectedEndDate(selectedStartDate);
            setSelectedStartDate(date);
        }
        setBookDialogPosition(calculatePositioning(event, bookDialogPositioning));
    }

    const handleMouseEnter = (date: Date, event: any) => {
        const filterBookings = filterFrom(bookings.concat(yourBookings), date);
        if (filterBookings.length === 1) {
            setHoveredBooking(filterBookings[0]);
            setTooltipPosition(calculatePositioning(event, tooltipPositioning));
        }
    }

    const handleMouseLeave = () => {
        setHoveredBooking(null);
    }

    useEffect(() => {
        // När selectedStartDate eller selectedEndDate ändras, körs denna kod för att uppdatera state
        if (selectedStartDate && selectedEndDate) {
            // Om båda datumen är valda, korrigerar vi ordningen så att startdatumet alltid kommer före slutdatumet
            if (selectedStartDate > selectedEndDate) {
                const temp = selectedStartDate;
                setSelectedStartDate(selectedEndDate);
                setSelectedEndDate(temp);
            }
            setShowBookDialog(true);
            console.log("selected start"+selectedStartDate+ "selected end"+ selectedEndDate);
        }
    }, [selectedStartDate, selectedEndDate]);

    const adjustHeight = () => {
        // --vh is used in calendar.css
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    useEffect(() => {
        window.addEventListener('resize', adjustHeight);
        adjustHeight(); // Call on initial load

        if (signedIn) {
            getBookingsRequest()
                .then(r => {
                    setBookings(r.data);
                    setLoading(false);
                    setYourBookings(r.data.filter((booking: Booking) => booking.familyMember.uuid === familyMemberId));
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                    console.error('Error fetching data:', error);
                });
        }
    }, [signedIn]);

    const isSelectedDate = (date: Date) => {
        if (selectedStartDate && selectedEndDate) {
            return date >= selectedStartDate && date <= selectedEndDate;
        } else if (selectedStartDate) {
            return date.toString() === selectedStartDate.toString();
        } else {
            return false;
        }
    };

    let prevMonth = -1; // För att hålla koll på föregående månad (startvärdet -1 eftersom 0 är en giltig månad)

    const formatWeek = (date: Date) => {
        const isoWeek = getISOWeek(date);
        return isoWeek < 10 ? `V0${isoWeek}` : `V${isoWeek.toString()}`;
    };

    function getMonthAndWeek(weekStart: Date, isMobile:boolean) {
        // Format the ISO week number with leading zero
        const formattedWeek = formatWeek(weekStart);
        if (isMobile) {
            return <div
                className="just-week-number">{formattedWeek}</div>;
        }
        const weekDay = getDay(weekStart);
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


    function filterFrom(pBookings: Booking[], date: Date) {
        return pBookings.filter((booking) => {
            return compareDateParts(date, new Date(booking.from)) >= 0 && compareDateParts(date, new Date(booking.to)) <= 0;
        });
    }

    function isBooked(date: Date) {
        return filterFrom(bookings, date).length === 1;
    }
    function isYourBooking(date: Date) {
        return filterFrom(yourBookings, date).length === 1;
    }

    function  getCellSubClass(date: Date) {
        return isSelectedDate(date) ? 'selected' : isYourBooking(date) ? 'your-booking' : isBooked(date) ? 'booked' : '';
    }


    function onBookClick() {
        postBookingRequest(getOptionalDate(selectedStartDate), getOptionalDate(selectedEndDate))
            .catch((err) => {
                if (err.from !== undefined) {
                    setExistingBooking(err);
                }
                console.error('Request failed:', err);
            })
            .finally(() => {
                setYourBookings( [...yourBookings,  {from: getOptionalDate(selectedStartDate).toISOString(), to: getOptionalDate(selectedEndDate).toISOString(), familyMember: {uuid: familyMemberId, name: "ssss"}}])
                setSelectedStartDate(null);
                setSelectedEndDate(null);
                setShowBookDialog(false);
            });
    }

    function onCancelBookClicked() {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
        setShowBookDialog(false);
    }

    // render sections

    if (!signedIn) {
        return;
    }

    if (error) {
        return <div>Fel: {error.message}</div>;
    }

    if (loading) {
        return <div>Hämtar befintliga bokningar...</div>;
    }

    return (
        <div className="booing-root">
            <div className="header" >
                <BookingHeader title={title}/>
            </div>
            <div className="calendar" >
                {weeks.map((weekStart) => (
                    <div key={weekStart.toISOString()} className="week">
                        {getMonthAndWeek(weekStart, isMobile)}
                        {eachDayOfInterval({start: weekStart, end: addDays(weekStart, 6)}).map((date) => {
                            return (<div key={date.toISOString()}>
                                    <input
                                        readOnly={true}
                                        className={`calendar-date ${getCellSubClass(date)}`}
                                        onClick={(event ) => handleDateClick(date, event)}
                                        onMouseEnter={(event) => handleMouseEnter(date, event)}
                                        onMouseLeave={handleMouseLeave}
                                        value={formattDate(isMobile,date)}
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
                        style={{width: tooltipPositioning.width, height: tooltipPositioning.height, top: tooltipPosition.top, left: tooltipPosition.left}}
                    />
                </div>
            )}
            <div className="footer">
                <BookingFooter onBookClick={onBookClick}  startDate={selectedStartDate} endDate={selectedEndDate}/>
            </div>
        </div>
    );
};

export default Calendar;
