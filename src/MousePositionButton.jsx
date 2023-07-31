import React, {useState, useEffect} from 'react';

const MousePositionButton = (showContent) => {
    const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

    useEffect(() => {
        // Funktion för att uppdatera muspositionen när musen flyttas
        const handleMouseMove = (event) => {
            setMousePosition({x: event.clientX, y: event.clientY});
        };

        // Lyssna på "mousemove"-händelsen på dokumentet
        document.addEventListener('mousemove', handleMouseMove);

        // Städa upp eventlyssnaren när komponenten unmounts (avslutas)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        };
    }, []); // Använd en tom array för att useEffect kör endast vid mount/unmount

    return (
        <div>
            {showContent ? (
                    <div style={{position: 'fixed', left: mousePosition.x, top: mousePosition.y}}>
                        <button>boka</button>
                    </div>
                )
                : (<div> </div>)
            }
        </div>
    );
};

export default MousePositionButton;
