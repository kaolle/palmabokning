interface Booking {
    from: Date;
    to: Date;
    familyMember: {
        uuid: string;
        name: string;
    };
}