interface FamilyMember {
    id: string;
    name: string;
    phrase?: string;
}

interface Booking {
    id: string;
    from: string;
    to: string;
    familyMember: FamilyMember;
}


interface BookingRequest {
    from: Date;
    to: Date;
}

interface BookingForMemberRequest {
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
