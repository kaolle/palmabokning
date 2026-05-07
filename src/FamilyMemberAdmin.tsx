import React, {useEffect, useState} from 'react';
import './FamilyMemberAdmin.css';
// We'll need to add these functions to booking.ts
import {
  createFamilyMemberRequest,
  deleteFamilyMemberRequest,
  getFamilyMembersRequest,
  updateFamilyMemberRequest
} from './rest/booking';
import {isFamilyUberhead} from './authentication/AuthContext';
import {generateColorFromName} from './utils/colorUtils';

interface FamilyMemberAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

const FamilyMemberAdmin: React.FC<FamilyMemberAdminProps> = ({ isOpen, onClose }) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newMemberName, setNewMemberName] = useState<string>('');
  const [newMemberPhrase, setNewMemberPhrase] = useState<string>('');
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadFamilyMembers();
    }
  }, [isOpen]);

  // Lock the underlying calendar's scroll while the modal is open, otherwise
  // touches in the list bleed through and scroll the calendar (especially when
  // the list is too short to scroll itself).
  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const loadFamilyMembers = async () => {
    if (!isFamilyUberhead()) {
      setError('Du har inte behörighet att administrera familjemedlemmar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getFamilyMembersRequest();
      setFamilyMembers(response.data);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError('Kunde inte hämta familjemedlemmar');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async () => {
    if (!newMemberName.trim()) {
      setError('Namn får inte vara tomt');
      return;
    }

    if (!newMemberPhrase.trim()) {
      setError('Fras får inte vara tomt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createFamilyMemberRequest(newMemberName, newMemberPhrase);
      setNewMemberName('');
      setNewMemberPhrase('');
      await loadFamilyMembers();
    } catch (err) {
      console.error('Error creating family member:', err);
      setError('Kunde inte skapa familjemedlem');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async () => {
    if (!editingMember || !editingMember.name.trim()) {
      setError('Namn får inte vara tomt');
      return;
    }

    if (!editingMember.phrase || !editingMember.phrase.trim()) {
      setError('Fras får inte vara tomt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateFamilyMemberRequest(editingMember.id, editingMember.name, editingMember.phrase);
      setEditingMember(null);
      await loadFamilyMembers();
    } catch (err) {
      console.error('Error updating family member:', err);
      setError('Kunde inte uppdatera familjemedlem');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna familjemedlem?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteFamilyMemberRequest(id);
      await loadFamilyMembers();
    } catch (err) {
      console.error('Error deleting family member:', err);
      setError('Kunde inte ta bort familjemedlem');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="family-member-admin-overlay">
      <div className="family-member-admin-modal">
        <div className="family-member-admin-header">
          <h2>Administrera familjemedlemmar</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="new-member-form">
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="Ny familjemedlems namn"
            disabled={loading}
          />
          <input
            type="text"
            value={newMemberPhrase}
            onChange={(e) => setNewMemberPhrase(e.target.value)}
            placeholder="Fras"
            disabled={loading}
          />
          <button
            className="btn-primary btn-add"
            onClick={handleCreateMember}
            disabled={loading || !newMemberName.trim() || !newMemberPhrase.trim()}
          >
            Lägg till
          </button>
        </div>

        {loading ? (
          <div className="loading-message">Laddar...</div>
        ) : (
          <div className="family-members-list">
            {familyMembers.length === 0 ? (
              <div className="no-members-message">Inga familjemedlemmar hittades</div>
            ) : (
              familyMembers.map((member, idx) => (
                <div
                  key={member.id}
                  className="family-member-item"
                  style={{
                    '--member-color': generateColorFromName(member.name),
                    '--item-index': idx,
                  } as React.CSSProperties}
                >
                  {editingMember && editingMember.id === member.id ? (
                    <>
                      <div className="editing-inputs">
                        <input
                          type="text"
                          value={editingMember.name}
                          onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                          placeholder="Namn"
                        />
                        <input
                          type="text"
                          value={editingMember.phrase || ''}
                          onChange={(e) => setEditingMember({...editingMember, phrase: e.target.value})}
                          placeholder="Fras"
                        />
                      </div>
                      <div className="member-actions">
                        <button className="btn-primary" onClick={handleUpdateMember}>Spara</button>
                        <button className="btn-secondary" onClick={() => setEditingMember(null)}>Avbryt</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="member-info">
                        <span className="member-avatar" aria-hidden="true">
                          {member.name.trim().charAt(0).toUpperCase() || '?'}
                        </span>
                        <div className="member-text">
                          <span className="member-name">{member.name}</span>
                          <span className="member-phrase">{member.phrase}</span>
                        </div>
                      </div>
                      <div className="member-actions">
                        <button className="btn-secondary" onClick={() => setEditingMember(member)}>Redigera</button>
                        <button className="btn-danger" onClick={() => handleDeleteMember(member.id)}>Ta bort</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyMemberAdmin;
