import React from "react";
import './WalkingPerson.css'

interface YourComponentProps {
    action: string;
}
const WalkingPerson: React.FC<YourComponentProps> = ({ action }) => {
    return (
        <div className="loading-overlay">
            <p>{action}</p>
            <img
                src="https://media.giphy.com/media/l41lIZZLqfJqDCvYY/giphy.gif"
                alt="Walking Person"
                style={{width: '90%', height: '85%'}}
            />
        </div>)
}
export default WalkingPerson;

