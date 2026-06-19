import React, { useState, useEffect } from 'react';
import './GuestBook.css';
import { getGuestbookEntriesRequest, getMyFamilyMemberRequest, postGuestbookEntryRequest } from './rest/booking';
import { isFamilyUberhead } from './authentication/AuthContext';

type GuestEntry = {
    id: string;
    name: string;
    stayFrom: string;
    stayTo: string;
    message: string;
    createdAt: string;
};

type GuestBookProps = {
    onClose: () => void;
};

const GuestBook: React.FC<GuestBookProps> = ({ onClose }) => {
    const [entries, setEntries] = useState<GuestEntry[]>([]);
    const [memberName, setMemberName] = useState<string>('');
    const [stayFrom, setStayFrom] = useState('');
    const [stayTo, setStayTo] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const isUberhead = isFamilyUberhead();

    useEffect(() => {
        Promise.all([
            getGuestbookEntriesRequest(),
            getMyFamilyMemberRequest(),
        ]).then(([entriesRes, meRes]) => {
            setEntries(entriesRes.data);
            setMemberName(meRes.data.name);
            if (meRes.data.stayFrom) setStayFrom(meRes.data.stayFrom.split('T')[0]);
            if (meRes.data.stayTo) setStayTo(meRes.data.stayTo.split('T')[0]);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await postGuestbookEntryRequest(stayFrom, stayTo, message);
            setEntries(prev => [res.data, ...prev]);
            setStayFrom('');
            setStayTo('');
            setMessage('');
            setSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="guestbook-page">
            <div className="guestbook-header">
                <div className="guestbook-header-text">
                    <h2 className="guestbook-title">Gästboken</h2>
                    <p className="guestbook-subtitle">Dela dina minnen från Palma</p>
                </div>
                <button className="guestbook-back-btn" onClick={onClose} title="Stäng">✕</button>
            </div>

            <div className="guestbook-content">
                {submitted ? (
                    <>
                        <div className="guestbook-saved-banner">
                            <span className="guestbook-saved-text">Ditt inlägg är sparat!</span>
                            <button className="guestbook-submit-btn" onClick={onClose}>
                                ← Tillbaka
                            </button>
                        </div>
                        <div className="guestbook-entries-section">
                            <h2>Inlägg i gästboken</h2>
                            <div className="guestbook-entries">
                                {entries.map(entry => (
                                    <div className="guestbook-entry" key={entry.id}>
                                        <div className="entry-header">
                                            <span className="entry-name">{entry.name}</span>
                                            <span className="entry-dates">
                                                {entry.stayFrom} – {entry.stayTo}
                                            </span>
                                        </div>
                                        <p className="entry-message">{entry.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="guestbook-form-section">
                            <h2>
                                {memberName
                                    ? `Trevligt om du skriver något i gästboken, ${memberName}!`
                                    : 'Skriv i gästboken'}
                            </h2>
                            <form className="guestbook-form" onSubmit={handleSubmit}>
                                <div className="form-group form-row">
                                    <div>
                                        <label htmlFor="gb-from">Ankomst</label>
                                        <input
                                            id="gb-from"
                                            type="date"
                                            value={stayFrom}
                                            onChange={e => setStayFrom(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="gb-to">Avresa</label>
                                        <input
                                            id="gb-to"
                                            type="date"
                                            value={stayTo}
                                            onChange={e => setStayTo(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="gb-message">Hur var din tid i Palma?</label>
                                    <textarea
                                        id="gb-message"
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        placeholder="Berätta om dina upplevelser, favoritmomenten, och minnen från resan..."
                                        rows={5}
                                        required
                                    />
                                </div>
                                <button type="submit" className="guestbook-submit-btn">
                                    Lägg till i gästboken
                                </button>
                            </form>
                        </div>

                        <div className="guestbook-entries-section">
                            <h2>Tidigare besökare</h2>
                            {loading ? (
                                <p className="guestbook-empty">Laddar...</p>
                            ) : entries.length === 0 ? (
                                <p className="guestbook-empty">Inga inlägg ännu — bli den första!</p>
                            ) : (
                                <div className="guestbook-entries">
                                    {entries.map(entry => (
                                        <div className="guestbook-entry" key={entry.id}>
                                            <div className="entry-header">
                                                <span className="entry-name">{entry.name}</span>
                                                <span className="entry-dates">
                                                    {entry.stayFrom} – {entry.stayTo}
                                                </span>
                                            </div>
                                            <p className="entry-message">{entry.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GuestBook;
