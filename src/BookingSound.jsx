import React, { useEffect } from 'react';

const BookingSound = () => {
    useEffect(() => {
        // Skapa en Audio-instans med sökvägen till ljudfilen
        const audio = new Audio('/Bokningsljud.m4a');

        // Spela upp ljudet
        audio.play();

        // Avsluta ljudet när komponenten unmounts (avslutas)
        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, []); // Använd en tom array för att useEffect kör endast vid mount/unmount

    return <div>Ljudet spelas upp när denna komponent renderas!</div>;
};


export default BookingSound;
