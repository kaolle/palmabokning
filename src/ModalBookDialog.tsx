import React from 'react';
import './ModalBookDialog.css';

type BookDialogProps = {
    isOpen: Boolean;
    onBookClick: React.MouseEventHandler<HTMLButtonElement>;
    onCancelClick: any;
};
const ModalBookDialog: React.FC<BookDialogProps> = ({isOpen, onBookClick, onCancelClick,  }) => {

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onCancelClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Your modal content goes here */}
                <h2>Vill du boka ?</h2>
                <p>Om du bokar så går det normaltset bra, men om någon hann precis före kan du trycka på F5/(på mobil dra fönstret
                    neråt) och se vem de var.</p>
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
