interface Booking {
    from: string;
    to: string;
    familyMember: {
        uuid: string;
        name: string;
    };
}

enum BookingOperator {
    ADD_BOOKING,
    CHANGE_BOOKING,
    DELETE_BOOKING
};

interface BookingRequest {
    from: Date;
    to: Date;
}

interface PopupPositioning {
    width: number;
    height: number;
    windowPadding: number;
}

interface PopupPosition {
    top: number;
    left: number;
}
