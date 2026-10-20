import React, { useState } from 'react';
import { PARTICIPANTS, isValidParticipant } from '../data/participants';
import { supabase } from '../utils/supabase';

export default function LoginModal({ isOpen, onLogin, currentParticipantId }) {
  const [selectedId, setSelectedId] = useState(currentParticipantId || '');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select your Participant ID.');
      return;
    }
    if (!passcode.trim()) {
      setError('Please enter your passcode.');
      return;
    }

    setLoading(true);
    setError('');

    const cleanId = selectedId.trim().toUpperCase();
    const cleanPass = passcode.trim();

    try {
      // 1. Authenticate against Supabase "participants" table
      const { data, error: dbError } = await supabase
        .from('participants')
        .select('id, passcode')
        .eq('id', cleanId)
        .maybeSingle();

      if (dbError) {
        console.warn('[supabase auth] Falling back to local check:', dbError.message);
      }

      const isValid = data 
        ? data.passcode.toLowerCase() === cleanPass.toLowerCase()
        : isValidParticipant(cleanId, cleanPass);

      if (!isValid) {
        setError('Incorrect passcode. Please check your card or ask the proctor.');
        setLoading(false);
        return;
      }

      setLoading(false);
      onLogin(cleanId);
    } catch (err) {
      console.error(err);
      if (isValidParticipant(cleanId, cleanPass)) {
        setLoading(false);
        onLogin(cleanId);
      } else {
        setError('Incorrect passcode.');
        setLoading(false);
      }
    }
  };

  const handleSelectChange = (e) => {
    setSelectedId(e.target.value);
    setPasscode(''); // Keep password blank when participant changes
    setError('');
  };

  return (
    <div className="modal-overlay modal-active" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: '440px', width: '92%', padding: 0, overflow: 'hidden', border: '3px solid #f59e0b', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        {/* Header Art */}
        <div style={{
          background: 'linear-gradient(135deg, #b45309 0%, #d97706 50%, #f59e0b 100%)',
          padding: '20px 20px 16px',
          textAlign: 'center',
          color: '#fff',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <img src="/sprites/bird_red.png" alt="Red Bird" style={{ width: '44px', height: '44px', objectFit: 'contain' }} />
            <img src="/sprites/bird_yellow.png" alt="Chuck" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
            Participant Login
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', fontWeight: 600, color: '#fef3c7' }}>
            CS413 Study · Angry Bird Blocks
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', background: '#fff' }}>
          <p style={{ fontSize: '13px', color: '#4b5563', marginTop: 0, marginBottom: '16px', lineHeight: '1.4' }}>
            Select your assigned Participant ID and enter your passcode to authenticate.
          </p>

          {/* Participant ID Select */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
              Select Participant ID:
            </label>
            <select
              value={selectedId}
              onChange={handleSelectChange}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                fontSize: '14px',
                fontWeight: 700,
                color: '#1f2937',
                background: '#f9fafb',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>-- Choose your ID --</option>
              {PARTICIPANTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Passcode Input (Strictly manual, no auto-fill) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#374151', marginBottom: '6px' }}>
              Passcode: <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="Enter your assigned passcode"
              autoComplete="off"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '2px solid #d1d5db',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '15px',
              fontWeight: 900,
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)',
              border: '2px solid #b45309',
              color: '#fff',
              boxShadow: '0 4px 0 #92400e',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : 'Enter Study Session 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}
