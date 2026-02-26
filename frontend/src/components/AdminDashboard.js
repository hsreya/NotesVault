import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const TABS = [
    { key: 'notes', label: 'Manage Notes', icon: '📄' },
    { key: 'users', label: 'Manage Users', icon: '👥' },
    { key: 'analytics', label: 'Analytics', icon: '📊' },
];

const StatusBadge = ({ status }) => (
    <span className={`admin-badge admin-badge--${status}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
);

const RoleBadge = ({ role }) => (
    <span className={`admin-badge admin-badge--role-${role}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
    </span>
);

const AdminDashboard = () => {
    const { user, logout, getAllUsers, updateUserRole: authUpdateRole } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('notes');
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState('');

    const fetchData = useCallback(() => {
        setLoading(true);
        try {
            // Get notes from localStorage
            const storedNotes = JSON.parse(localStorage.getItem('notesfinder_notes') || '[]');
            const allUsers = getAllUsers();

            setNotes(storedNotes);
            setUsers(allUsers);
            setAnalytics({
                totalNotes: storedNotes.length,
                pendingNotes: storedNotes.filter(n => n.status === 'pending').length,
                approvedNotes: storedNotes.filter(n => (n.status || 'approved') === 'approved').length,
                totalUsers: allUsers.length,
                contributors: allUsers.filter(u => u.role === 'contributor').length,
            });
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
        } finally {
            setLoading(false);
        }
    }, [getAllUsers]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateNoteStatus = (noteId, status) => {
        setActionLoading(`note-${noteId}`);
        try {
            const storedNotes = JSON.parse(localStorage.getItem('notesfinder_notes') || '[]');
            const updated = storedNotes.map(n => n.id === noteId ? { ...n, status } : n);
            localStorage.setItem('notesfinder_notes', JSON.stringify(updated));
            setNotes(prev => prev.map(n => n.id === noteId ? { ...n, status } : n));
        } catch (err) {
            alert('Failed to update note status');
        } finally {
            setActionLoading('');
        }
    };

    const deleteNote = (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        setActionLoading(`delete-${noteId}`);
        try {
            const storedNotes = JSON.parse(localStorage.getItem('notesfinder_notes') || '[]');
            const filtered = storedNotes.filter(n => n.id !== noteId);
            localStorage.setItem('notesfinder_notes', JSON.stringify(filtered));
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (err) {
            alert('Failed to delete note');
        } finally {
            setActionLoading('');
        }
    };

    const updateUserRole = (userId, role) => {
        setActionLoading(`user-${userId}`);
        try {
            authUpdateRole(userId, role);
            setUsers(getAllUsers());
        } catch (err) {
            alert('Failed to update user role');
        } finally {
            setActionLoading('');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="admin-dashboard">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar__header">
                    <div className="admin-sidebar__logo">
                        <svg width="22" height="22" fill="none" viewBox="0 0 48 48">
                            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <span className="admin-sidebar__brand">NotesFinder</span>
                    <span className="admin-sidebar__label">Admin</span>
                </div>

                <nav className="admin-sidebar__nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`admin-sidebar__tab ${activeTab === tab.key ? 'admin-sidebar__tab--active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="admin-sidebar__tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar__footer">
                    <div className="admin-sidebar__user">
                        <div className="admin-sidebar__user-avatar">
                            {(user?.full_name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="admin-sidebar__user-name">{user?.full_name || 'Admin'}</div>
                            <div className="admin-sidebar__user-email">{user?.email || ''}</div>
                        </div>
                    </div>
                    <button className="admin-sidebar__logout" onClick={handleLogout}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="admin-main">
                {loading ? (
                    <div className="admin-loading">
                        <div className="admin-loading__spinner" />
                        <p>Loading admin data...</p>
                    </div>
                ) : (
                    <>
                        {/* ── Notes Tab ── */}
                        {activeTab === 'notes' && (
                            <div className="admin-section">
                                <div className="admin-section__header">
                                    <h1 className="admin-section__title">Manage Notes</h1>
                                    <span className="admin-section__count">{notes.length} total</span>
                                </div>

                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Title</th>
                                                <th>Subject</th>
                                                <th>Semester</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {notes.length === 0 ? (
                                                <tr><td colSpan="6" className="admin-table__empty">No notes uploaded yet. Notes will appear here when contributors upload them.</td></tr>
                                            ) : notes.map(note => (
                                                <tr key={note.id}>
                                                    <td className="admin-table__title-cell">{note.title || 'Untitled'}</td>
                                                    <td>{note.subject || '—'}</td>
                                                    <td>{note.semester || '—'}</td>
                                                    <td><StatusBadge status={note.status || 'pending'} /></td>
                                                    <td className="admin-table__date">
                                                        {note.created_at ? new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}
                                                    </td>
                                                    <td>
                                                        <div className="admin-table__actions">
                                                            {note.status !== 'approved' && (
                                                                <button
                                                                    className="admin-btn admin-btn--approve"
                                                                    onClick={() => updateNoteStatus(note.id, 'approved')}
                                                                    disabled={actionLoading === `note-${note.id}`}
                                                                >
                                                                    ✓ Approve
                                                                </button>
                                                            )}
                                                            {note.status !== 'rejected' && (
                                                                <button
                                                                    className="admin-btn admin-btn--reject"
                                                                    onClick={() => updateNoteStatus(note.id, 'rejected')}
                                                                    disabled={actionLoading === `note-${note.id}`}
                                                                >
                                                                    ✕ Reject
                                                                </button>
                                                            )}
                                                            <button
                                                                className="admin-btn admin-btn--delete"
                                                                onClick={() => deleteNote(note.id)}
                                                                disabled={actionLoading === `delete-${note.id}`}
                                                            >
                                                                🗑
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Users Tab ── */}
                        {activeTab === 'users' && (
                            <div className="admin-section">
                                <div className="admin-section__header">
                                    <h1 className="admin-section__title">Manage Users</h1>
                                    <span className="admin-section__count">{users.length} users</span>
                                </div>

                                <div className="admin-table-wrap">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Semester</th>
                                                <th>Field</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr><td colSpan="6" className="admin-table__empty">No users found</td></tr>
                                            ) : users.map(u => (
                                                <tr key={u.id}>
                                                    <td className="admin-table__title-cell">{u.full_name || '—'}</td>
                                                    <td>{u.email || '—'}</td>
                                                    <td><RoleBadge role={u.role || 'user'} /></td>
                                                    <td>{u.semester || '—'}</td>
                                                    <td>{u.education_field || '—'}</td>
                                                    <td>
                                                        <div className="admin-table__actions">
                                                            {u.role === 'user' && (
                                                                <button
                                                                    className="admin-btn admin-btn--promote"
                                                                    onClick={() => updateUserRole(u.id, 'contributor')}
                                                                    disabled={actionLoading === `user-${u.id}`}
                                                                >
                                                                    ↑ Promote
                                                                </button>
                                                            )}
                                                            {u.role === 'contributor' && (
                                                                <button
                                                                    className="admin-btn admin-btn--demote"
                                                                    onClick={() => updateUserRole(u.id, 'user')}
                                                                    disabled={actionLoading === `user-${u.id}`}
                                                                >
                                                                    ↓ Demote
                                                                </button>
                                                            )}
                                                            {u.id === user?.id && (
                                                                <span className="admin-table__you">You</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Analytics Tab ── */}
                        {activeTab === 'analytics' && analytics && (
                            <div className="admin-section">
                                <div className="admin-section__header">
                                    <h1 className="admin-section__title">Analytics</h1>
                                </div>

                                <div className="admin-stats-grid">
                                    <div className="admin-stat-card">
                                        <div className="admin-stat-card__icon">📄</div>
                                        <div className="admin-stat-card__value">{analytics.totalNotes}</div>
                                        <div className="admin-stat-card__label">Total Notes</div>
                                    </div>
                                    <div className="admin-stat-card admin-stat-card--pending">
                                        <div className="admin-stat-card__icon">⏳</div>
                                        <div className="admin-stat-card__value">{analytics.pendingNotes}</div>
                                        <div className="admin-stat-card__label">Pending Review</div>
                                    </div>
                                    <div className="admin-stat-card admin-stat-card--approved">
                                        <div className="admin-stat-card__icon">✅</div>
                                        <div className="admin-stat-card__value">{analytics.approvedNotes}</div>
                                        <div className="admin-stat-card__label">Approved</div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <div className="admin-stat-card__icon">👥</div>
                                        <div className="admin-stat-card__value">{analytics.totalUsers}</div>
                                        <div className="admin-stat-card__label">Total Users</div>
                                    </div>
                                    <div className="admin-stat-card">
                                        <div className="admin-stat-card__icon">✍️</div>
                                        <div className="admin-stat-card__value">{analytics.contributors}</div>
                                        <div className="admin-stat-card__label">Contributors</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
