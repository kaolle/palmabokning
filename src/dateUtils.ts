function compareDateParts(date1: Date, date2: Date) {
    const year1 = date1.getFullYear();
    const month1 = date1.getMonth();
    const day1 = date1.getDate();

    const year2 = date2.getFullYear();
    const month2 = date2.getMonth();
    const day2 = date2.getDate();

    if (year1 === year2 && month1 === month2 && day1 === day2) {
        return 0; // Both dates are equal
    } else if (year1 < year2 || (year1 === year2 && month1 < month2) ||
        (year1 === year2 && month1 === month2 && day1 < day2)) {
        return -1; // date1 is earlier than date2
    } else {
        return 1; // date1 is later than date2
    }
}
export {compareDateParts}
