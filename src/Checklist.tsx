import React, {useEffect, useRef, useState} from 'react';
import './Checklist.css';

interface ChecklistProps {
    isOpen: boolean;
    onClose: () => void;
}

const ITEMS: { id: string; label: string }[] = [
    { id: 'damsug', label: 'Dammsug alla golv' },
    { id: 'vattorka', label: 'Våttorka alla golv' },
    { id: 'spis', label: 'Stäng av spisen och rengör spishäll och kolla ugnen om den behöver rengöras' },
    { id: 'kylskap', label: 'Töm kylen på färskvaror — släng eller ät upp eller rent av ta med hem' },
    { id: 'kylskap2', label: 'Lämna vatten och 6 öl i kylskåpet' },
    { id: 'toalett', label: 'Skura toaletten och tvättstället' },
    { id: 'diskmaskin', label: 'Kör och töm diskmaskinen' },
    { id: 'soptunnor', label: 'Töm alla soptunnor' },
    { id: 'forbrukning', label: 'Fyll på saker som tagit slut, ex diskmedel, tvål och toapapper' },
    { id: 'badd', label: 'Tvättan sängkläder, dock inte om du åker hem tidigt på morgonen' },
    { id: 'fonster', label: 'Vädra och sedan stänger ni alla fönster' },
    { id: 'element', label: 'Stäng av ACn och element' },
    { id: 'glomtsaker', label: 'Kolla under sängar och i lådor — inga glömda prylar' },
    { id: 'diskreta', label: 'Inga kondomer eller annat skräp under sängarna 😉' },
    { id: 'las', label: 'Ta in balkong stolar och stäng balkong dörren' },
    { id: 'nyckel', label: 'Ta med nyckeln hem' },
];

const STORAGE_KEY = 'palma.checklist';

const loadChecks = (): Record<string, boolean> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

const saveChecks = (checks: Record<string, boolean>) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
    } catch {
        // ignore quota / permission errors
    }
};

// Phrase rotation for the hysterical loop: G-G-G-Eb canonical, then F-F-F-D
// (the second phrase from the symphony), then the same patterns up an octave
// and down an octave. Cycling through these gives the Beethoven motif a
// frantic, anxious-cleaning feel without any external audio file.
const PHRASES: { short: number; long: number }[] = [
    { short: 392.00, long: 311.13 }, // G4-G4-G4-Eb4
    { short: 349.23, long: 293.66 }, // F4-F4-F4-D4
    { short: 783.99, long: 622.25 }, // G5-G5-G5-Eb5 (octave up)
    { short: 195.99, long: 155.56 }, // G3-G3-G3-Eb3 (octave down)
];

const SHORT_DUR = 0.13;       // each of the three quick beats
const LONG_DUR = 0.55;        // the long held note
const NOTE_GAP = 0.03;        // tiny gap between notes inside a phrase
const RESCHEDULE_LEAD = 100;  // ms — re-arm next phrase shortly before this one ends

const Checklist: React.FC<ChecklistProps> = ({ isOpen, onClose }) => {
    const [checks, setChecks] = useState<Record<string, boolean>>(() => loadChecks());

    const audioContextRef = useRef<AudioContext | null>(null);
    const loopTimerRef = useRef<number | null>(null);
    const phraseIndexRef = useRef<number>(0);

    // Lock the underlying calendar's scroll while the modal is open.
    useEffect(() => {
        if (!isOpen) return;
        document.body.classList.add('modal-open');
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    // Continuous Beethoven 5th loop while the modal is open.
    useEffect(() => {
        if (!isOpen) return;

        const stop = () => {
            if (loopTimerRef.current !== null) {
                clearTimeout(loopTimerRef.current);
                loopTimerRef.current = null;
            }
            if (audioContextRef.current) {
                audioContextRef.current.close().catch(() => {});
                audioContextRef.current = null;
            }
        };

        try {
            const AC = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
                || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
            if (!AC) return stop;
            const ctx = new AC();
            audioContextRef.current = ctx;
            phraseIndexRef.current = 0;

            const scheduleNextPhrase = () => {
                const c = audioContextRef.current;
                if (!c) return;
                const phrase = PHRASES[phraseIndexRef.current % PHRASES.length];
                phraseIndexRef.current += 1;

                const sequence = [
                    { freq: phrase.short, dur: SHORT_DUR },
                    { freq: phrase.short, dur: SHORT_DUR },
                    { freq: phrase.short, dur: SHORT_DUR },
                    { freq: phrase.long, dur: LONG_DUR },
                ];

                let t = c.currentTime + 0.04;
                sequence.forEach((n) => {
                    // Two slightly-detuned voices per note thicken the sound
                    // and produce a subtle beating that reads as "frantic"
                    // rather than clean synth.
                    [-3, 3].forEach((cents) => {
                        const osc = c.createOscillator();
                        const gain = c.createGain();
                        osc.type = 'triangle';
                        osc.frequency.value = n.freq * Math.pow(2, cents / 1200);
                        osc.connect(gain);
                        gain.connect(c.destination);
                        const release = Math.min(0.1, n.dur * 0.4);
                        gain.gain.setValueAtTime(0, t);
                        gain.gain.linearRampToValueAtTime(0.11, t + 0.015);
                        gain.gain.linearRampToValueAtTime(0.085, t + n.dur - release);
                        gain.gain.linearRampToValueAtTime(0, t + n.dur);
                        osc.start(t);
                        osc.stop(t + n.dur + 0.03);
                    });
                    t += n.dur + NOTE_GAP;
                });

                const phraseLengthMs = (t - c.currentTime) * 1000;
                loopTimerRef.current = window.setTimeout(
                    scheduleNextPhrase,
                    Math.max(40, phraseLengthMs - RESCHEDULE_LEAD)
                );
            };

            scheduleNextPhrase();
        } catch {
            // Web Audio failed to initialise — silent fallback, checklist still works.
        }

        return stop;
    }, [isOpen]);

    const toggle = (id: string) => {
        setChecks(prev => {
            const next = { ...prev, [id]: !prev[id] };
            saveChecks(next);
            return next;
        });
    };

    const reset = () => {
        if (!window.confirm('Återställ alla bockar?')) return;
        setChecks({});
        saveChecks({});
    };

    const checkedCount = ITEMS.filter(item => checks[item.id]).length;
    const allDone = checkedCount === ITEMS.length;

    if (!isOpen) return null;

    return (
        <div className="checklist-overlay">
            <div className="checklist-modal">
                <div className="checklist-header">
                    <h2>
                        Checklista innan hemfärd
                        <span className="checklist-progress">{checkedCount} / {ITEMS.length}</span>
                    </h2>
                    <button className="close-button" onClick={onClose} aria-label="Stäng">×</button>
                </div>

                <ul className="checklist-items">
                    {ITEMS.map((item, idx) => (
                        <li
                            key={item.id}
                            className={`checklist-item ${checks[item.id] ? 'done' : ''}`}
                            style={{ animationDelay: `${idx * 25}ms` }}
                        >
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!checks[item.id]}
                                    onChange={() => toggle(item.id)}
                                />
                                <span className="custom-check" aria-hidden="true"></span>
                                <span className="item-label">{item.label}</span>
                            </label>
                        </li>
                    ))}
                </ul>

                {allDone && (
                    <div className="checklist-done">
                        Allt klart! 🌟 Trevlig hemresa!
                    </div>
                )}

                <div className="checklist-footer">
                    <button className="btn-secondary" onClick={reset}>Återställ</button>
                </div>
            </div>
        </div>
    );
};

export default Checklist;
