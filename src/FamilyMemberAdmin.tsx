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
      await updateFamilyMemberRequest(editingMember.uuid, editingMember.name, editingMember.phrase);
      setEditingMember(null);
      await loadFamilyMembers();
    } catch (err) {
      console.error('Error updating family member:', err);
      setError('Kunde inte uppdatera familjemedlem');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (uuid: string) => {
    if (!window.confirm('Är du säker på att du vill ta bort denna familjemedlem?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await deleteFamilyMemberRequest(uuid);
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
              familyMembers.map((member) => (
                <div key={member.uuid} className="family-member-item">
                  {editingMember && editingMember.uuid === member.uuid ? (
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
                        <button onClick={handleUpdateMember}>Spara</button>
                        <button onClick={() => setEditingMember(null)}>Avbryt</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="member-info">
                        <span className="member-name">{member.name}</span>
                        <span className="member-phrase">{member.phrase}</span>
                      </div>
                      <div className="member-actions">
                        <button onClick={() => setEditingMember(member)}>Redigera</button>
                        <button onClick={() => handleDeleteMember(member.uuid)}>Ta bort</button>
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
