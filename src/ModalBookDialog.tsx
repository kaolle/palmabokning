import React from 'react';
import './ModalDialogCommon.css';
import {format} from "date-fns";
import {sv} from "date-fns/locale";

type BookDialogProps = {
    isOpen: Boolean;
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    onCancelClick: any;
    startDate: Date | null;
    endDate: Date | null;
};
const ModalBookDialog: React.FC<BookDialogProps> = ({isOpen, onBookClick, onCancelClick, startDate, endDate}) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onCancelClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Your modal content goes here */}
                <div className="header-container">
                    <h2 className="header">Vill du boka ?</h2>
                </div>
                {startDate && endDate &&
                    (<div className="high-lighted-panel">{format(startDate, 'dd MMMM', {locale: sv})} - {format(endDate, 'dd MMMM', {locale: sv})}
                    </div>
                    )}
                <p className='info-text-panel'>
                    Om du bokar så går det oftast bra, men om någon precis hann före dig, kan du trycka på F5/(på mobil
                    dra fönstret neråt) och se vem de var som var snabbast. Ni kanske kan lösa tillsammans vem som ska ha den perioden</p>
                {/* Two-button row */}
                <div className="button-row">
                    <button className="modal-button __default" onClick={onBookClick}>
                        Ja
                    </button>
                    <button className="modal-button __secondary" onClick={onCancelClick}>
                        Nej
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ModalBookDialog;
