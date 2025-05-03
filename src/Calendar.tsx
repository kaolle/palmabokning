// @ts-ignore
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {
    deleteBookingRequest,
    getBookingsRequest,
    postBookingForMemberRequest,
    postBookingRequest
} from "./rest/booking";
import {getFamilyMemberId, isTokenStillValid, useAuth} from "./authentication/AuthContext";
import BookingFooter from "./BookingFooter";
import BookingHeader from "./BookingHeader";
import {generateColorFromName} from "./utils/colorUtils";

function getOptionalDate(theDate: Date | null) {
    return theDate !== null ? theDate : new Date();
}

function formattDate(showJustDay:boolean, showJustMonthAndDay: boolean, date: Date) {
    if (showJustDay)
        return format(date, 'd/M', {locale: sv});

    if (showJustMonthAndDay)
        return format(date, 'd MMM', {locale: sv});

    return format(date, 'yyyy-MM-dd');
}

const Calendar = () => {
    const { signedIn, setSignedIn } = useAuth();
    const isMobile = useMediaQuery({ maxWidth: 600 });
    const isFlippedMobile = useMediaQuery({ maxWidth: 815 });
    const isSmallFlippedMobile = useMediaQuery({ maxWidth: 769 });
    const weekRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
    const calendarRef = useRef<HTMLDivElement>(null);

    const title = "Palma Bokningskalender";
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [yourBookings, setYourBookings] = useState<Booking[]>([]);
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
    const [hoveredYourBooking, setHoveredYourBooking] = useState<Booking|null>(null);
    const [loading, setLoading] = useState<Boolean>(true);
    const [error, setError] = useState<any | null>(null);
    const [hoveredBooking, setHoveredBooking] = useState<Booking | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<PopupPosition>({top: 0, left: 0});
    const tooltipPositioning: PopupPositioning = {width: 150, height: 150, windowPadding: 70};
    const [visibleWeekStart, setVisibleWeekStart] = useState<Date | null>(null);

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
    } );

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
        if (isYourBooking(date)) {
            setHoveredYourBooking(filterFrom(yourBookings, date)[0]);
            setTimeout(() => {
                setHoveredYourBooking(null);
            }, 4000);
            return;
        }

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
    }

    const handleMouseEnter = (date: Date, event: any) => {
        const filterBookings = filterFrom(bookings, date);
        if (filterBookings.length === 1) {
            setHoveredBooking(filterBookings[0]);
            setTooltipPosition(calculatePositioning(event, tooltipPositioning));
            if (isMobile) {
                setTimeout(() => {
                    setHoveredBooking(null);
                    setTooltipPosition({top: 0, left: 0});
                }, 4000);
            }
        }
    }

    const handleMouseLeave = () => {
        setHoveredBooking(null);
        setTooltipPosition({top: 0, left: 0});
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
            console.log("selected start"+selectedStartDate+ "selected end"+ selectedEndDate);
        }
    }, [selectedStartDate, selectedEndDate]);

    const adjustHeight = () => {
        // --vh is used in calendar.css
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Function to determine which week is currently visible in the viewport
    const determineVisibleWeek = useCallback(() => {
        if (!calendarRef.current) return null;

        // Find the topmost visible week in the viewport
        let topmostWeek = null;
        let topmostPosition = Infinity;

        Object.entries(weekRefs.current).forEach(([weekKey, weekElement]) => {
            if (weekElement) {
                const weekRect = weekElement.getBoundingClientRect();

                // Check if the week is visible in the viewport
                const isVisible =
                    (weekRect.top >= 0 && weekRect.top <= window.innerHeight) || // Top edge is in viewport
                    (weekRect.bottom >= 0 && weekRect.bottom <= window.innerHeight) || // Bottom edge is in viewport
                    (weekRect.top < 0 && weekRect.bottom > window.innerHeight); // Week spans entire viewport

                if (isVisible && weekRect.top < topmostPosition) {
                    topmostPosition = weekRect.top;
                    topmostWeek = new Date(weekKey);
                }
            }
        });

        return topmostWeek;
    }, []);

    // Function to scroll to a specific week
    const scrollToWeek = useCallback((weekStart: Date | null) => {
        if (!weekStart) return;

        const weekKey = weekStart.toISOString();
        const weekElement = weekRefs.current[weekKey];

        if (weekElement) {
            // Use a higher timeout to ensure DOM is fully updated
            setTimeout(() => {
                weekElement.scrollIntoView({ behavior: 'auto', block: 'start' });
                console.log('Scrolled to week:', format(weekStart, 'yyyy-MM-dd'));
            }, 100);
        }
    }, []);

    // Track scroll position to determine visible week
    useEffect(() => {
        const handleScroll = () => {
            if (!loading) {
                const currentVisibleWeek = determineVisibleWeek();
                if (currentVisibleWeek) {
                    setVisibleWeekStart(currentVisibleWeek);
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, determineVisibleWeek]);

    useEffect(() => {
        window.addEventListener('resize', adjustHeight);
        adjustHeight(); // Call on initial load

        if (signedIn) {
            getBookingsRequest()
                .then(r => {
                    setBookings(r.data);
                    setLoading(false);
                    setYourBookings(r.data.filter((booking: Booking) => booking.familyMember.id === familyMemberId));

                    // Initial determination of visible week after data loads
                    setTimeout(() => {
                        const initialVisibleWeek = determineVisibleWeek();
                        if (initialVisibleWeek) {
                            setVisibleWeekStart(initialVisibleWeek);
                        }
                    }, 100);
                })
                .catch((error) => {
                    setError(error);
                    setLoading(false);
                    console.error('Error fetching data:', error);
                });
        }
    }, [signedIn, familyMemberId, determineVisibleWeek]);

    // Restore visible week when loading state changes to false
    useEffect(() => {
        if (!loading && visibleWeekStart) {
            scrollToWeek(visibleWeekStart);
        }
    }, [loading, visibleWeekStart, scrollToWeek]);

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

    function getMonthAndWeek(weekStart: Date, justWeek : boolean ) {
        // Format the ISO week number with leading zero
        const formattedWeek = formatWeek(weekStart);
        if ( justWeek ) {
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


    function getCellSubClass(date: Date) {
        if (isSelectedDate(date)) {
            return 'selected';
        } else if (isYourBooking(date)) {
            return 'your-booking';
        } else if (isBooked(date)) {
            // Find the booking for this date
            const booking = filterFrom(bookings, date)[0];
            if (booking) {
                // Add a data attribute with the color based on family member name
                const memberName = booking.familyMember.name;
                return `booked member-${memberName.replace(/\s+/g, '-').toLowerCase()}`;
            }
            return 'booked';
        }
        return '';
    }


    function onBookClick(memberIdToBookFor?: string) {
        // Save current visible week before making the booking
        const currentVisibleWeek = determineVisibleWeek();
        if (currentVisibleWeek) {
            setVisibleWeekStart(currentVisibleWeek);
            console.log('Saved visible week before booking:', format(currentVisibleWeek, 'yyyy-MM-dd'));
        }

        const bookingPromise = memberIdToBookFor
            ? postBookingForMemberRequest(getOptionalDate(selectedStartDate), getOptionalDate(selectedEndDate), memberIdToBookFor)
            : postBookingRequest(getOptionalDate(selectedStartDate), getOptionalDate(selectedEndDate));

        bookingPromise
            .then(() => {
                // Fetch bookings from server again to get the updated list
                setLoading(true);
                return getBookingsRequest();
            })
            .then(r => {
                if (r) {
                    setBookings(r.data);
                    setYourBookings(r.data.filter((booking: Booking) => booking.familyMember.id === familyMemberId));
                    setLoading(false);

                    // The useEffect hook will handle scrolling to the saved week
                    // when loading changes to false
                }
            })
            .catch((err) => {
                console.error('Request failed:', err);
            })
            .finally(() => {
                setSelectedStartDate(null);
                setSelectedEndDate(null);
            });
    }
    function onBookAbort() {
        setSelectedStartDate(null);
        setSelectedEndDate(null);
    }

    function onBookDeleteClick() {
        // Save current visible week before deleting the booking
        const currentVisibleWeek = determineVisibleWeek();
        if (currentVisibleWeek) {
            setVisibleWeekStart(currentVisibleWeek);
            console.log('Saved visible week before deletion:', format(currentVisibleWeek, 'yyyy-MM-dd'));
        }

        deleteBookingRequest(hoveredYourBooking)
            .then(() => {
                // Fetch bookings from server again to get the updated list
                setLoading(true);
                return getBookingsRequest();
            })
            .then(r => {
                if (r) {
                    setBookings(r.data);
                    setYourBookings(r.data.filter((booking: Booking) => booking.familyMember.id === familyMemberId));
                    setLoading(false);

                    // The useEffect hook will handle scrolling to the saved week
                    // when loading changes to false
                }
            })
            .catch((err) => {
                console.error('Request failed:', err);
            })
            .finally(() => {
                setHoveredYourBooking(null);
            });
    }

    // Function to set ref for each week element
    const setWeekRef = useCallback((element: HTMLDivElement | null, weekStart: Date) => {
        if (element) {
            weekRefs.current[weekStart.toISOString()] = element;
        }
    }, []);

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
            <div className="calendar" ref={calendarRef}>
                {weeks.map((weekStart) => (
                    <div
                        key={weekStart.toISOString()}
                        className="week"
                        ref={(el) => setWeekRef(el, weekStart)}
                    >
                        {getMonthAndWeek(weekStart, isMobile||isFlippedMobile)}
                        {eachDayOfInterval({start: weekStart, end: addDays(weekStart, 6)}).map((date) => {
                            return (<div key={date.toISOString()}>
                                    <input
                                        readOnly={true}
                                        className={`calendar-date ${getCellSubClass(date)}`}
                                        style={isBooked(date) && !isYourBooking(date) ?
                                            { backgroundColor: generateColorFromName(filterFrom(bookings, date)[0].familyMember.name) } :
                                            undefined}
                                        onClick={(event ) => handleDateClick(date, event)}
                                        onMouseEnter={(event) => handleMouseEnter(date, event)}
                                        onMouseLeave={handleMouseLeave}
                                        value={formattDate(isMobile, isSmallFlippedMobile,date)}
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
                <BookingFooter onBookClick={onBookClick} onBookAbort={onBookAbort} onBookDeleteClick={onBookDeleteClick}  startDate={selectedStartDate} endDate={selectedEndDate} yourBooking={hoveredYourBooking}/>
            </div>
        </div>
    );
};

export default Calendar;
