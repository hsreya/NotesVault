import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardPage from './DashboardPage';
import { api } from '../lib/api';

// ─── Dynamic AI processing messages ──────────────────────────────────────────
const AI_MESSAGES = [
  'Analyzing your academic profile…',
  'Matching your semester & field…',
  'Understanding your note preferences…',
  'Preparing personalized recommendations…',
];

// ─── Random floating particles ────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  angle: (i / 12) * 360,
  radius: 110 + (i % 3) * 22,
  size: 4 + (i % 3) * 2,
  duration: 2.5 + (i % 4) * 0.5,
  delay: (i * 0.18),
}));

// ─── AI Orb Component ─────────────────────────────────────────────────────────
const AIOrb = () => (
  <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
    {/* Soft glow behind orb */}
    <div
      className="absolute rounded-full"
      style={{
        width: 220, height: 220,
        background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, rgba(99,102,241,0.08) 60%, transparent 80%)',
        animation: 'orbGlow 2.4s ease-in-out infinite alternate',
      }}
    />

    {/* Outer rotating dashed ring */}
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      className="absolute rounded-full border-2 border-dashed"
      style={{ width: 190, height: 190, borderColor: 'rgba(99,102,241,0.25)' }}
    />

    {/* Middle rotating ring */}
    <motion.div
      animate={{ rotate: -360 }}
      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      className="absolute rounded-full"
      style={{
        width: 155, height: 155,
        border: '2px solid transparent',
        borderTopColor: 'rgba(59,130,246,0.5)',
        borderRightColor: 'rgba(99,102,241,0.3)',
        borderRadius: '50%',
      }}
    />

    {/* Floating particles orbiting the center */}
    {PARTICLES.map(p => (
      <motion.div
        key={p.id}
        className="absolute rounded-full"
        style={{
          width: p.size, height: p.size,
          background: `rgba(${p.id % 2 === 0 ? '59,130,246' : '99,102,241'}, 0.7)`,
        }}
        animate={{
          x: [
            Math.cos((p.angle * Math.PI) / 180) * p.radius,
            Math.cos(((p.angle + 180) * Math.PI) / 180) * (p.radius * 0.7),
            Math.cos((p.angle * Math.PI) / 180) * p.radius,
          ],
          y: [
            Math.sin((p.angle * Math.PI) / 180) * p.radius,
            Math.sin(((p.angle + 180) * Math.PI) / 180) * (p.radius * 0.7),
            Math.sin((p.angle * Math.PI) / 180) * p.radius,
          ],
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{
          duration: p.duration,
          delay: p.delay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    ))}

    {/* Core orb */}
    <motion.div
      animate={{ scale: [1, 1.06, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      className="relative z-10 rounded-full flex items-center justify-center"
      style={{
        width: 100, height: 100,
        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 60%, #1e1b4b 100%)',
        boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(59,130,246,0.2)',
      }}
    >
      {/* Brain / AI icon */}
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C9.5 2 7.5 3.5 7 5.5C5.5 5.5 4 7 4 8.5C4 9.5 4.5 10.5 5.5 11C4.5 11.5 4 12.5 4 13.5C4 15.2 5.3 16.5 7 16.5C7.5 18.5 9.5 20 12 20C14.5 20 16.5 18.5 17 16.5C18.7 16.5 20 15.2 20 13.5C20 12.5 19.5 11.5 18.5 11C19.5 10.5 20 9.5 20 8.5C20 7 18.5 5.5 17 5.5C16.5 3.5 14.5 2 12 2Z"
          fill="rgba(255,255,255,0.9)"
        />
        <circle cx="12" cy="11" r="2" fill="rgba(99,102,241,0.8)" />
      </svg>
    </motion.div>
  </div>
);

// ─── Main NotesPage ───────────────────────────────────────────────────────────
const NotesPage = ({ inputs }) => {
  const [phase, setPhase] = useState('processing'); // 'processing' | 'ready' | 'dashboard'
  const [msgIndex, setMsgIndex] = useState(0);
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState('');
  const msgIntervalRef = useRef(null);

  // Cycle through AI messages every 1.1 seconds
  useEffect(() => {
    msgIntervalRef.current = setInterval(() => {
      setMsgIndex(prev => {
        if (prev >= AI_MESSAGES.length - 1) {
          clearInterval(msgIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
    return () => clearInterval(msgIntervalRef.current);
  }, []);

  // After all messages shown, transition to "ready" state
  useEffect(() => {
    const totalTime = AI_MESSAGES.length * 1100 + 400;
    const readyTimer = setTimeout(() => setPhase('ready'), totalTime);
    return () => clearTimeout(readyTimer);
  }, []);

  // After "ready" flash, go to dashboard
  useEffect(() => {
    if (phase !== 'ready') return;
    const dashTimer = setTimeout(() => setPhase('dashboard'), 1200);
    return () => clearTimeout(dashTimer);
  }, [phase]);

  // Fetch notes in background while animation plays
  const fetchNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    setNotesError('');
    try {
      const params = {};
      if (inputs?.branch) params.branch = inputs.branch;
      if (inputs?.year) params.year = inputs.year;
      if (inputs?.semester) params.semester = inputs.semester;
      const response = await api.get('/api/notes', { params });
      setNotes(response?.data?.data || []);
    } catch {
      setNotes([]);
      setNotesError('Unable to load notes. Please try again.');
    } finally {
      setIsLoadingNotes(false);
    }
  }, [inputs?.branch, inputs?.year, inputs?.semester]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // ─── Dashboard phase ──────────────────────────────────────────────────────
  if (phase === 'dashboard') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="notes-page"
      >
        <DashboardPage
          notes={notes}
          inputs={inputs}
          onRefresh={fetchNotes}
          isLoading={isLoadingNotes}
          error={notesError}
        />
      </motion.div>
    );
  }

  // ─── Processing / Ready phase ─────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: '100vw', height: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Subtle background gradient blobs */}
      <div style={{
        position: 'absolute', top: '10%', left: '15%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', right: '15%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      {/* ── AI Orb ── */}
      <AnimatePresence mode="wait">
        {phase === 'processing' ? (
          <motion.div key="orb" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.5 }}>
            <AIOrb />
          </motion.div>
        ) : (
          <motion.div
            key="check"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
            style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 40px rgba(16,185,129,0.4)',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dynamic text ── */}
      <div style={{ marginTop: 40, minHeight: 60, textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {phase === 'processing' ? (
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              style={{ fontSize: 20, fontWeight: 600, color: '#1e293b', margin: 0 }}
            >
              {AI_MESSAGES[msgIndex]}
            </motion.p>
          ) : (
            <motion.p
              key="ready"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: 22, fontWeight: 700, color: '#10b981', margin: 0 }}
            >
              ✅ Your notes are ready!
            </motion.p>
          )}
        </AnimatePresence>

        {phase === 'processing' && (
          <p style={{ fontSize: 14, color: '#94a3b8', marginTop: 8, fontWeight: 500 }}>
            This will only take a moment…
          </p>
        )}
      </div>

      {/* ── Step indicators ── */}
      {phase === 'processing' && (
        <div style={{ display: 'flex', gap: 8, marginTop: 28 }}>
          {AI_MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === msgIndex ? 28 : 8,
                background: i <= msgIndex ? '#3b82f6' : '#e2e8f0',
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>
      )}

      {/* Subtle NotesFinder branding at bottom */}
      <div style={{
        position: 'absolute', bottom: 32,
        display: 'flex', alignItems: 'center', gap: 8,
        color: '#cbd5e1', fontSize: 13, fontWeight: 600,
      }}>
        <svg width="16" height="16" fill="none" viewBox="0 0 48 48">
          <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
        </svg>
        NotesFinder AI
      </div>

      <style>{`
        @keyframes orbGlow {
          from { transform: scale(0.95); opacity: 0.7; }
          to   { transform: scale(1.05); opacity: 1; }
        }
      `}</style>
    </motion.div>
  );
};

export default NotesPage;
