import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_SUBJECTS = ['DBMS', 'OS', 'CN', 'DSA', 'Web Dev', 'AI/ML', 'Math', 'Physics'];
const MOCK_TAGS = ['Summary', 'PYQ', 'Handwritten', 'Revision', 'Lab Manual', 'Detailed'];
const MOCK_UPLOADERS = ['Aarav S.', 'Priya K.', 'Rahul M.', 'Sneha D.', 'Vikram P.', 'Ananya R.'];
const FILE_TYPES = ['PDF', 'DOCX'];
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const EDUCATION_FIELDS = ['Computer Engineering', 'IT', 'EXTC', 'Mechanical', 'Civil'];
const NOTE_TYPES = ['Summary', 'Detailed', 'PYQ', 'Lab Manual'];
const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'most-downloaded', label: 'Most Downloaded' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

const enrichNote = (note, index) => {
  const seed = index + 1;
  return {
    ...note,
    id: note._id || note.id || `note-${index}`,
    subject: note.branch || MOCK_SUBJECTS[seed % MOCK_SUBJECTS.length],
    description: note.content
      ? note.content.slice(0, 80) + (note.content.length > 80 ? '…' : '')
      : 'Comprehensive study material covering key concepts and exam-relevant topics.',
    rating: +(3.5 + (seed % 15) * 0.1).toFixed(1),
    views: 120 + seed * 47,
    downloads: 30 + seed * 13,
    fileType: note.file_url?.includes('.docx') ? 'DOCX' : 'PDF',
    uploadDate: note.created_at
      ? new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : `${seed} Feb 2026`,
    uploadedBy: MOCK_UPLOADERS[seed % MOCK_UPLOADERS.length],
    tags: [MOCK_TAGS[seed % MOCK_TAGS.length], MOCK_TAGS[(seed + 2) % MOCK_TAGS.length]],
    semester: note.semester || SEMESTERS[seed % SEMESTERS.length],
    educationField: note.branch || EDUCATION_FIELDS[seed % EDUCATION_FIELDS.length],
  };
};

const generateMockNotes = () =>
  Array.from({ length: 9 }, (_, i) => enrichNote({
    title: [
      'DBMS Complete Notes', 'OS Handwritten Summary', 'CN PYQ Solutions',
      'DSA Key Concepts', 'Web Dev React Guide', 'AI/ML Revision Notes',
      'Math III Formula Sheet', 'Physics Lab Manual', 'Digital Logic Design'
    ][i],
    content: [
      'Complete database management system notes covering normalization, SQL, transactions, and concurrency control.',
      'Handwritten operating system notes with process scheduling, memory management, and file systems.',
      'Previous year question papers for computer networks with detailed solutions and explanations.',
      'Data structures and algorithms covering arrays, trees, graphs, sorting, and dynamic programming.',
      'React.js comprehensive guide with hooks, state management, routing, and project structure.',
      'Artificial intelligence and machine learning revision notes for semester exams.',
      'Complete formula sheet for Engineering Mathematics III with examples.',
      'Physics laboratory manual with experiment procedures and observations.',
      'Digital logic design notes covering Boolean algebra, K-maps, and sequential circuits.'
    ][i],
    branch: MOCK_SUBJECTS[i % MOCK_SUBJECTS.length],
    semester: SEMESTERS[i % SEMESTERS.length],
  }, i));

// ─── Search Suggestions Data ────────────────────────────────────────────────
const SEARCH_DATA = [
  { text: 'DBMS Summary Notes', type: 'Notes' },
  { text: 'DBMS PYQ Sem 4', type: 'PYQ' },
  { text: 'DBMS Important Questions', type: 'Questions' },
  { text: 'Operating System Handwritten', type: 'Notes' },
  { text: 'OS Process Scheduling', type: 'Topic' },
  { text: 'Computer Networks Unit 1', type: 'Notes' },
  { text: 'CN PYQ Solutions', type: 'PYQ' },
  { text: 'DSA Trees & Graphs', type: 'Topic' },
  { text: 'React.js Complete Guide', type: 'Notes' },
  { text: 'AI/ML Revision Sheet', type: 'Revision' },
  { text: 'Math III Formulas', type: 'Notes' },
  { text: 'Digital Logic PYQ', type: 'PYQ' },
  { text: 'Web Development Lab Manual', type: 'Lab' },
  { text: 'Physics Experiment Notes', type: 'Lab' },
];

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const SearchIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const StarIcon = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const DownloadIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const BookmarkIcon = ({ className, filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const UserIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const FileIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);

const SortIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 16 4 4 4-4" /><path d="M7 20V4" /><path d="m21 8-4-4-4 4" /><path d="M17 4v16" />
  </svg>
);

const EmptyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    <line x1="9" x2="15" y1="13" y2="13" /><line x1="12" x2="12" y1="10" y2="16" style={{ opacity: 0.3 }} />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const UploadIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

const FireIcon = () => (
  <span role="img" aria-label="trending" style={{ fontSize: 20 }}>🔥</span>
);

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Filter Section (collapsible)
const FilterSection = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-section">
      <button className="filter-section__header" onClick={() => setOpen(o => !o)}>
        {title}
        <ChevronDown className={`filter-section__chevron ${open ? 'filter-section__chevron--open' : ''}`} />
      </button>
      <div className={`filter-section__body ${open ? 'filter-section__body--open' : ''}`}>
        <div className="filter-section__list">{children}</div>
      </div>
    </div>
  );
};

// Filter checkbox item
const FilterItem = ({ label, checked, onChange }) => (
  <label className="filter-item">
    <span className={`filter-item__checkbox ${checked ? 'filter-item__checkbox--checked' : ''}`}>
      <CheckIcon className="filter-item__check-icon" />
    </span>
    <span className="filter-item__label">{label}</span>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
  </label>
);

// Note Card
const NoteCard = ({ note, bookmarked, onToggleBookmark, isTrending }) => (
  <div className="note-card">
    <div className="note-card__header">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span className="note-card__subject">{note.subject}</span>
        {isTrending && (
          <span className="note-card__trending-badge">
            <FireIcon /> Trending
          </span>
        )}
      </div>
      <button
        className={`note-card__bookmark ${bookmarked ? 'note-card__bookmark--active' : ''}`}
        onClick={() => onToggleBookmark(note.id)}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark this note'}
      >
        <BookmarkIcon className="note-card__bookmark-icon" filled={bookmarked} />
      </button>
    </div>

    <h3 className="note-card__title">{note.title || 'Study Notes'}</h3>
    <p className="note-card__desc">{note.description}</p>

    <div className="note-card__meta">
      <span className="note-card__meta-item">
        <StarIcon className="note-card__meta-icon note-card__star-icon" filled />
        {note.rating}
      </span>
      <span className="note-card__meta-item">
        <EyeIcon className="note-card__meta-icon" />
        {note.views}
      </span>
      <span className="note-card__meta-item">
        <DownloadIcon className="note-card__meta-icon" />
        {note.downloads}
      </span>
      <span className={`note-card__file-badge note-card__file-badge--${note.fileType.toLowerCase()}`}>
        {note.fileType}
      </span>
    </div>

    <div className="note-card__tags">
      {note.tags.map(tag => (
        <span key={tag} className="note-card__tag">{tag}</span>
      ))}
    </div>

    <div className="note-card__footer">
      <div className="note-card__uploader">
        <UserIcon className="note-card__uploader-icon" />
        {note.uploadedBy} &middot; <CalendarIcon className="note-card__uploader-icon" /> {note.uploadDate}
      </div>
      <div className="note-card__actions">
        <button className="note-card__action-btn">Preview</button>
        <button className="note-card__action-btn note-card__action-btn--primary">
          Download
        </button>
      </div>
    </div>
  </div>
);

// Skeleton Card
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-line skeleton-line--short" />
    <div className="skeleton-line skeleton-line--title" />
    <div className="skeleton-line skeleton-line--full" />
    <div className="skeleton-line skeleton-line--medium" />
    <div className="skeleton-line skeleton-line--tags" />
    <div className="skeleton-line skeleton-line--actions" />
  </div>
);

// Empty State
const EmptyState = ({ onReset }) => (
  <div className="empty-state">
    <EmptyIcon className="empty-state__icon" />
    <h3 className="empty-state__title">No notes found.</h3>
    <p className="empty-state__subtitle">
      Try adjusting your filters or search keywords.
    </p>
    <button className="empty-state__btn" onClick={onReset}>
      Reset Filters
    </button>
  </div>
);

// Sort Dropdown
const SortDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const currentLabel = SORT_OPTIONS.find(o => o.value === value)?.label || 'Sort';

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button className="sort-dropdown__trigger" onClick={() => setOpen(o => !o)}>
        <SortIcon className="sort-dropdown__trigger-icon" />
        {currentLabel}
        <ChevronDown className={`sort-dropdown__trigger-icon ${open ? 'filter-section__chevron--open' : ''}`} />
      </button>
      {open && (
        <div className="sort-dropdown__menu">
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`sort-dropdown__option ${value === opt.value ? 'sort-dropdown__option--active' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Search Bar with autocomplete
const SearchBar = ({ value, onChange }) => {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef(null);

  const suggestions = useMemo(() => {
    if (!value || value.length < 2) return [];
    const q = value.toLowerCase();
    return SEARCH_DATA.filter(s => s.text.toLowerCase().includes(q)).slice(0, 6);
  }, [value]);

  const showSuggestions = focused && suggestions.length > 0;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onChange(suggestions[activeIndex].text);
      setFocused(false);
    } else if (e.key === 'Escape') {
      setFocused(false);
    }
  };

  const highlightMatch = (text) => {
    const idx = text.toLowerCase().indexOf(value.toLowerCase());
    if (idx === -1) return text;
    return (
      <>{text.slice(0, idx)}<mark>{text.slice(idx, idx + value.length)}</mark>{text.slice(idx + value.length)}</>
    );
  };

  return (
    <div className="search-bar" ref={ref}>
      <div className="search-bar__input-wrap">
        <SearchIcon className="search-bar__icon" />
        <input
          className="search-bar__input"
          type="text"
          placeholder="Search notes, subjects, topics…"
          value={value}
          onChange={e => { onChange(e.target.value); setActiveIndex(-1); }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
        />
        <span className="search-bar__ai-badge">AI</span>
      </div>
      {showSuggestions && (
        <div className="search-bar__suggestions">
          {suggestions.map((s, i) => (
            <div
              key={s.text}
              className={`search-suggestion ${i === activeIndex ? 'search-suggestion--active' : ''}`}
              onClick={() => { onChange(s.text); setFocused(false); }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <FileIcon className="search-suggestion__icon" />
              <span className="search-suggestion__text">{highlightMatch(s.text)}</span>
              <span className="search-suggestion__type">{s.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Profile Widget (auth-aware)
const ProfileWidget = ({ user, isAuthenticated, onLogout, onLogin, navigate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <button className="profile-widget__trigger" onClick={onLogin}>
        <div className="profile-widget__avatar">
          <UserIcon style={{ width: 16, height: 16 }} />
        </div>
        <span className="profile-widget__name" style={{ color: '#9e9e9e' }}>Sign In</span>
      </button>
    );
  }

  const initials = (user?.full_name || 'U').slice(0, 2).toUpperCase();
  const roleLabel = user?.role === 'admin' ? 'Admin' : user?.role === 'contributor' ? 'Contributor' : 'User';

  return (
    <div className="profile-widget" ref={ref}>
      <button className="profile-widget__trigger" onClick={() => setOpen(o => !o)}>
        <div className="profile-widget__avatar">{initials}</div>
        <div className="profile-widget__info">
          <div className="profile-widget__name">{user?.full_name || 'User'}</div>
          <div className="profile-widget__meta">{roleLabel}</div>
        </div>
        <ChevronDown className={`profile-widget__chevron ${open ? 'profile-widget__chevron--open' : ''}`} />
      </button>
      {open && (
        <div className="profile-widget__dropdown">
          {user?.role === 'admin' && (
            <button className="profile-widget__dropdown-item" onClick={() => { navigate('/admin-dashboard'); setOpen(false); }}>
              <SettingsIcon className="profile-widget__dropdown-icon" /> Admin Panel
            </button>
          )}
          {(user?.role === 'contributor' || user?.role === 'admin') && (
            <button className="profile-widget__dropdown-item" onClick={() => { navigate('/contributor-dashboard'); setOpen(false); }}>
              <UploadIcon className="profile-widget__dropdown-icon" /> My Uploads
            </button>
          )}
          <button className="profile-widget__dropdown-item">
            <BookmarkIcon className="profile-widget__dropdown-icon" filled={false} /> Saved Notes
          </button>
          <button className="profile-widget__dropdown-item">
            <SettingsIcon className="profile-widget__dropdown-icon" /> Profile Settings
          </button>
          <div className="profile-widget__dropdown-divider" />
          <button className="profile-widget__dropdown-item profile-widget__dropdown-item--danger" onClick={() => { onLogout(); setOpen(false); }}>
            <LogoutIcon className="profile-widget__dropdown-icon" /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
const DashboardPage = ({ notes, inputs, onRefresh, isLoading, error }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('noteBookmarks')) || []; } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevant');
  const [filters, setFilters] = useState({
    subjects: [],
    semesters: [],
    educationFields: [],
    fileTypes: [],
    noteTypes: [],
    ratingAbove4: false,
    mostDownloaded: false,
    recentlyAdded: false,
  });

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('noteBookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = useCallback((id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  }, []);

  // ─── Enrich notes with mock data ────────────────────────────────────────
  const allNotes = useMemo(() => {
    const raw = Array.isArray(notes) && notes.length > 0
      ? notes.map((n, i) => enrichNote(n, i))
      : generateMockNotes();
    return raw;
  }, [notes]);

  // ─── Filter notes ──────────────────────────────────────────────────────
  const filteredNotes = useMemo(() => {
    let result = [...allNotes];

    // Text search
    if (searchQuery.length >= 2) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) ||
        n.subject?.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q) ||
        n.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filters
    if (filters.subjects.length) result = result.filter(n => filters.subjects.includes(n.subject));
    if (filters.semesters.length) result = result.filter(n => filters.semesters.includes(n.semester));
    if (filters.educationFields.length) result = result.filter(n => filters.educationFields.includes(n.educationField));
    if (filters.fileTypes.length) result = result.filter(n => filters.fileTypes.includes(n.fileType));
    if (filters.noteTypes.length) result = result.filter(n => n.tags?.some(t => filters.noteTypes.includes(t)));
    if (filters.ratingAbove4) result = result.filter(n => n.rating >= 4.0);
    if (filters.mostDownloaded) result = result.sort((a, b) => b.downloads - a.downloads);
    if (filters.recentlyAdded) result = result.slice(0, 6);

    // Sort
    switch (sortBy) {
      case 'top-rated': result.sort((a, b) => b.rating - a.rating); break;
      case 'most-downloaded': result.sort((a, b) => b.downloads - a.downloads); break;
      case 'newest': result.sort((a, b) => b.views - a.views); break;
      case 'oldest': result.sort((a, b) => a.views - b.views); break;
      default: break;
    }

    return result;
  }, [allNotes, searchQuery, filters, sortBy]);

  // Trending notes (top 5 by downloads)
  const trendingNotes = useMemo(() =>
    [...allNotes].sort((a, b) => b.downloads - a.downloads).slice(0, 5),
    [allNotes]
  );

  // ─── Toggle filter helpers ──────────────────────────────────────────────
  const toggleFilter = (category, value) => {
    setFilters(prev => {
      const arr = prev[category];
      return {
        ...prev,
        [category]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
  };

  const toggleBoolFilter = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const clearFilters = () => {
    setFilters({
      subjects: [], semesters: [], educationFields: [], fileTypes: [],
      noteTypes: [], ratingAbove4: false, mostDownloaded: false, recentlyAdded: false,
    });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.subjects.length || filters.semesters.length || filters.educationFields.length ||
    filters.fileTypes.length || filters.noteTypes.length || filters.ratingAbove4 || filters.mostDownloaded || filters.recentlyAdded || searchQuery;

  // ─── Auth handlers ─────────────────────────────────────────────────────
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login', { replace: true });
  }, [logout, navigate]);

  const handleLogin = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // ─── Render ────────────────────────────────────────────────────────────
  return (
    <main className="dashboard" aria-label="Notes dashboard">
      {/* ── Sidebar ── */}
      <aside className="dashboard__sidebar" aria-label="Filters">
        <div className="sidebar__search">
          <SearchIcon className="sidebar__search-icon" />
          <input className="sidebar__search-input" placeholder="Filter..." />
        </div>

        <div className="sidebar__filters-title">Filters</div>

        <FilterSection title="Subject" defaultOpen>
          {MOCK_SUBJECTS.map(s => (
            <FilterItem key={s} label={s} checked={filters.subjects.includes(s)} onChange={() => toggleFilter('subjects', s)} />
          ))}
        </FilterSection>

        <FilterSection title="Semester">
          {SEMESTERS.map(s => (
            <FilterItem key={s} label={s} checked={filters.semesters.includes(s)} onChange={() => toggleFilter('semesters', s)} />
          ))}
        </FilterSection>

        <FilterSection title="Education Field">
          {EDUCATION_FIELDS.map(f => (
            <FilterItem key={f} label={f} checked={filters.educationFields.includes(f)} onChange={() => toggleFilter('educationFields', f)} />
          ))}
        </FilterSection>

        <FilterSection title="File Type">
          {FILE_TYPES.map(t => (
            <FilterItem key={t} label={t} checked={filters.fileTypes.includes(t)} onChange={() => toggleFilter('fileTypes', t)} />
          ))}
        </FilterSection>

        <FilterSection title="Note Type">
          {NOTE_TYPES.map(t => (
            <FilterItem key={t} label={t} checked={filters.noteTypes.includes(t)} onChange={() => toggleFilter('noteTypes', t)} />
          ))}
        </FilterSection>

        <FilterSection title="Quick Filters">
          <FilterItem label="⭐ Rating 4★ & above" checked={filters.ratingAbove4} onChange={() => toggleBoolFilter('ratingAbove4')} />
          <FilterItem label="📥 Most Downloaded" checked={filters.mostDownloaded} onChange={() => toggleBoolFilter('mostDownloaded')} />
          <FilterItem label="🕐 Recently Added" checked={filters.recentlyAdded} onChange={() => toggleBoolFilter('recentlyAdded')} />
        </FilterSection>

        {hasActiveFilters && (
          <button className="sidebar__clear-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        )}
      </aside>

      {/* ── Main Content ── */}
      <div className="dashboard__main">
        {/* Top bar */}
        <div className="dashboard__topbar">
          <div className="dashboard__topbar-left">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className="dashboard__topbar-right">
            <button className="dashboard__bell-btn" title="Notifications">
              <BellIcon className="dashboard__bell-icon" />
            </button>
            <ProfileWidget
              user={user}
              isAuthenticated={isAuthenticated}
              onLogout={handleLogout}
              onLogin={handleLogin}
              navigate={navigate}
            />
          </div>
        </div>

        {/* ── Top Rated Section ── */}
        <div className="section-header">
          <h2 className="section-header__title">Top Rated</h2>
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>

        {isLoading ? (
          <div className="notes-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState onReset={clearFilters} />
        ) : (
          <div className="notes-grid">
            {filteredNotes.slice(0, 6).map(note => (
              <NoteCard
                key={note.id}
                note={note}
                bookmarked={bookmarks.includes(note.id)}
                onToggleBookmark={toggleBookmark}
              />
            ))}
          </div>
        )}

        {/* ── Trending This Week ── */}
        <div className="trending-section">
          <div className="section-header">
            <h2 className="section-header__title">
              <FireIcon /> Trending This Week
            </h2>
          </div>
          <div className="trending-scroll">
            {trendingNotes.map(note => (
              <NoteCard
                key={`trending-${note.id}`}
                note={note}
                bookmarked={bookmarks.includes(note.id)}
                onToggleBookmark={toggleBookmark}
                isTrending
              />
            ))}
          </div>
        </div>

        {/* ── Best Suited Section ── */}
        {filteredNotes.length > 6 && (
          <>
            <div className="section-header">
              <h2 className="section-header__title">Best Suited</h2>
            </div>
            <div className="notes-grid">
              {filteredNotes.slice(6).map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  bookmarked={bookmarks.includes(note.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          </>
        )}

        {/* ── Saved Notes Section (only if bookmarks exist) ── */}
        {bookmarks.length > 0 && (
          <>
            <div className="section-header" style={{ marginTop: 20 }}>
              <h2 className="section-header__title">📌 Saved Notes</h2>
            </div>
            <div className="notes-grid">
              {allNotes.filter(n => bookmarks.includes(n.id)).map(note => (
                <NoteCard
                  key={`saved-${note.id}`}
                  note={note}
                  bookmarked
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default DashboardPage;
