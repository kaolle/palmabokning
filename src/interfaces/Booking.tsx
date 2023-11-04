interface Booking {
    from: Date;
    to: Date;
    familyMember: {
        uuid: string;
        name: string;
    };
}

interface BookingRequest {
    from: Date;
    to: Date;
    memberId: string;
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
