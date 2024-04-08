interface Booking {
    id: string;
    from: string;
    to: string;
    familyMember: {
        uuid: string;
        name: string;
    };
}


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
