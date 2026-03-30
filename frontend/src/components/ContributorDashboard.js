import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';
import './ContributorDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SUBJECTS = ['DBMS', 'OS', 'CN', 'DSA', 'Web Dev', 'AI/ML', 'Math', 'Physics', 'Chemistry', 'Digital Logic', 'Computer Architecture', 'Software Engineering'];
const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const CATEGORIES = ['Notes', 'PYQ', 'Revision', 'Lab Manual', 'Assignment', 'Summary'];

// ─── SVG Icons (Shared from Dashboard) ───────────────────────────────────────────────
const UploadIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);
const FileIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const EyeIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const DownloadIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const StarIcon = ({ filled, ...props }) => (
    <svg {...props} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);
const CheckIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const SettingsIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);
const LogoutIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
    </svg>
);
const CloseIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ cursor: 'pointer', ...props.style }}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
const TrashIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
const UserIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const DashboardIcon = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
);

// ─── Component ────────────────────────────────────────────────────────
const ContributorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [stats, setStats] = useState({
        totalUploads: 0,
        totalDownloads: 0,
        averageRating: 0,
        pendingApprovals: 0
    });
    const [myNotes, setMyNotes] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [aiChecking, setAiChecking] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [notification, setNotification] = useState(null);

    const [formData, setFormData] = useState({
        title: '', subject: '', semester: '', category: 'Notes',
        tags: '', description: '', youtube_url: '', file: null,
    });

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchMyUploads = useCallback(async () => {
        try {
            const userId = user?.id || user?.email;
            if (!userId) return;
            const res = await fetch(`${API_URL}/api/notes/my-uploads/${encodeURIComponent(userId)}`);
            if (res.ok) {
                const data = await res.json();
                const notes = data.data || [];
                setMyNotes(notes);
                const downloads = notes.reduce((acc, n) => acc + (n.downloads_count || 0), 0);
                const ratings = notes.filter(n => n.rating > 0);
                const avgRating = ratings.length > 0
                    ? (ratings.reduce((acc, n) => acc + parseFloat(n.rating), 0) / ratings.length).toFixed(1)
                    : 0;
                const pending = notes.filter(n => n.status === 'pending').length;
                setStats({
                    totalUploads: notes.length,
                    totalDownloads: downloads,
                    averageRating: avgRating,
                    pendingApprovals: pending
                });
            }
        } catch (err) {
            console.error('Error fetching uploads:', err);
        }
    }, [user]);

    useEffect(() => {
        if (user) fetchMyUploads();
    }, [fetchMyUploads, user]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleFileSelect = (file) => {
        if (!file) return;
        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(ext)) return showNotification('Only PDF, DOC, DOCX allowed', 'error');
        if (file.size > 20 * 1024 * 1024) return showNotification('File size must be under 20MB', 'error');
        setFormData(prev => ({ ...prev, file }));
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.subject || !formData.semester) return showNotification('Missing required fields', 'error');
        if (!formData.file) return showNotification('Please select a file to upload', 'error');

        try {
            setAiChecking(true);
            // Simulate AI Check
            await new Promise(r => setTimeout(r, 800));
            setAiChecking(false);

            setUploading(true);
            setUploadProgress(10);

            const uploadData = new FormData();
            Object.keys(formData).forEach(key => uploadData.append(key, formData[key]));
            uploadData.append('uploader_name', user?.full_name || 'Anonymous');
            uploadData.append('uploader_id', user?.id || user?.email);

            setUploadProgress(40);
            const res = await fetch(`${API_URL}/api/notes/upload`, { method: 'POST', body: uploadData });
            setUploadProgress(80);

            if (!res.ok) throw new Error((await res.json()).message || 'Upload failed');
            setUploadProgress(100);
            showNotification('✅ Note published successfully!');
            setFormData({ title: '', subject: '', semester: '', category: 'Notes', tags: '', description: '', youtube_url: '', file: null });
            setShowUploadModal(false);
            setTimeout(() => fetchMyUploads(), 500);
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setUploading(false); setAiChecking(false); setUploadProgress(0);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            const userId = user?.id || user?.email;
            const res = await fetch(`${API_URL}/api/notes/${deleteConfirm}?userId=${encodeURIComponent(userId)}`, { method: 'DELETE' });
            if (res.ok) {
                showNotification('Note deleted successfully');
                fetchMyUploads();
            } else throw new Error((await res.json()).message || 'Error deleting');
        } catch (err) {
            showNotification(err.message, 'error');
        }
        setDeleteConfirm(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="dashboard">
            {notification && (
                <div className={`cd-notification cd-notification--${notification.type}`}>
                    {notification.message}
                </div>
            )}

            {/* Sidebar matches DashboardPage exactly */}
            <aside className="dashboard__sidebar">
                <div className="sidebar__menu">
                    <div className="sidebar__menu-label">CONTRIBUTOR</div>
                    <button className="sidebar__menu-item sidebar__menu-item--active">
                        <UploadIcon style={{ width: 18, height: 18 }} />
                        <span>My Uploads</span>
                    </button>
                    <button className="sidebar__menu-item" onClick={() => navigate('/dashboard')}>
                        <DashboardIcon style={{ width: 18, height: 18 }} />
                        <span>Main Dashboard</span>
                    </button>
                    {user?.role === 'admin' && (
                        <button className="sidebar__menu-item" onClick={() => navigate('/admin-dashboard')}>
                            <SettingsIcon style={{ width: 18, height: 18 }} />
                            <span>Admin Panel</span>
                        </button>
                    )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div className="sidebar__menu-label">ACCOUNT</div>
                    <button className="sidebar__menu-item" onClick={handleLogout} style={{ color: '#ef4444' }}>
                        <LogoutIcon style={{ width: 18, height: 18 }} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard__main">
                {/* Topbar matches DashboardPage */}
                <header className="dashboard__topbar">
                    <div className="topbar__welcome">
                        <h1>Contributor </h1>
                        <p>Manage your uploads, view engagement, and contribute to the community.</p>
                    </div>
                    <button className="preview-modal__btn preview-modal__btn--primary" style={{ width: 'auto' }} onClick={() => setShowUploadModal(true)}>
                        <UploadIcon className="preview-modal__btn-icon" style={{ width: 18, height: 18, marginRight: 8 }} />
                        Upload New Note
                    </button>
                </header>

                <div className="dashboard__content">
                    {/* Stats matching DashboardPage Top Rated styling */}
                    <div className="dashboard__section">
                        <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
                            {[
                                { label: 'Total Files', value: stats.totalUploads, icon: FileIcon, color: '#3b82f6', bg: '#eff6ff' },
                                { label: 'Total Views', value: myNotes.reduce((a, b) => a + (b.views_count || 0), 0), icon: EyeIcon, color: '#6366f1', bg: '#e0e7ff' },
                                { label: 'Total Downloads', value: stats.totalDownloads, icon: DownloadIcon, color: '#10b981', bg: '#d1fae5' },
                                { label: 'Avg Rating', value: stats.averageRating, icon: StarIcon, color: '#f59e0b', bg: '#fef3c7' }
                            ].map((stat, i) => (
                                <div key={i} className="stat-card" style={{ background: '#fff', border: '1px solid var(--dash-border)', borderRadius: 'var(--dash-radius)', padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <stat.icon className="" style={{ width: 24, height: 24, display: 'block' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{stat.value}</div>
                                        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* My Uploads Grid */}
                    <div className="dashboard__section">
                        <div className="section-header">
                            <h2 className="section-title">My Published Notes</h2>
                        </div>

                        {myNotes.length > 0 ? (
                            <div className="notes-grid">
                                {myNotes.map(note => (
                                    <div key={note.id} className="note-card">
                                        <div className="note-card__header">
                                            <span className="note-card__subject">{note.subject || note.branch || 'General'}</span>
                                            <span className="note-card__category-badge" style={{
                                                background: note.status === 'approved' ? '#dcfce7' : note.status === 'pending' ? '#fef3c7' : '#fee2e2',
                                                color: note.status === 'approved' ? '#166534' : note.status === 'pending' ? '#92400e' : '#991b1b'
                                            }}>
                                                {note.status ? note.status.toUpperCase() : 'PENDING'}
                                            </span>
                                        </div>
                                        <h3 className="note-card__title">{note.title}</h3>
                                        <p className="note-card__desc">{note.description || 'No description provided.'}</p>

                                        <div className="note-card__meta">
                                            <div className="note-card__meta-item"><StarIcon className="note-card__meta-icon" filled /> {note.rating || '0.0'}</div>
                                            <div className="note-card__meta-item"><EyeIcon className="note-card__meta-icon" /> {note.views_count || 0}</div>
                                            <div className="note-card__meta-item"><DownloadIcon className="note-card__meta-icon" /> {note.downloads_count || 0}</div>
                                        </div>

                                        <div className="note-card__footer">
                                            <div className="note-card__author">
                                                <div className="note-card__avatar"><FileIcon style={{ width: 16 }} /></div>
                                                <span>{note.file_type || 'PDF'}</span>
                                            </div>
                                            <div className="note-card__actions">
                                                {note.file_url && (
                                                    <button className="note-card__action-btn" onClick={() => window.open(note.file_url, '_blank')}>
                                                        View
                                                    </button>
                                                )}
                                                <button
                                                    className="note-card__action-btn"
                                                    style={{ border: '1px solid #fecaca', color: '#dc2626', background: '#fef2f2' }}
                                                    onClick={() => setDeleteConfirm(note.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="notes-empty">
                                <FileIcon className="notes-empty__icon" />
                                <h3>No uploads yet</h3>
                                <p>Get started by contributing your first study material to the community.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Upload Modal (Shadcn style matches Preview Modal) */}
            {showUploadModal && (
                <div className="preview-modal-overlay" onMouseDown={() => !uploading && !aiChecking && setShowUploadModal(false)}>
                    <div className="preview-modal preview-modal--wide cd-upload-modal" onMouseDown={e => e.stopPropagation()}>
                        <div className="preview-modal__header">
                            <h2 className="preview-modal__title">Upload Study Material</h2>
                            <CloseIcon className="preview-modal__close" onClick={() => !uploading && !aiChecking && setShowUploadModal(false)} />
                        </div>

                        {(uploading || aiChecking) ? (
                            <div className="cd-modal-loader">
                                <div className="cd-modal-spinner"></div>
                                <h3>{aiChecking ? 'Analyzing Content...' : 'Uploading File...'}</h3>
                                <p>{aiChecking ? 'Checking for copyrighted material' : `${uploadProgress}% Complete`}</p>
                                {uploading && <div className="cd-progress-bar"><div className="cd-progress-bar__fill" style={{ width: `${uploadProgress}%` }}></div></div>}
                            </div>
                        ) : (
                            <form className="cd-form" onSubmit={handleUpload}>
                                <div className="cd-form-grid">
                                    <div className="cd-form-group cd-full-width">
                                        <label>Title <span className="text-red-500">*</span></label>
                                        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Complete DBMS Notes Unit 1-5" required />
                                    </div>

                                    <div className="cd-form-group">
                                        <label>Subject <span className="text-red-500">*</span></label>
                                        <select name="subject" value={formData.subject} onChange={handleChange} required>
                                            <option value="">Select Subject</option>
                                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="cd-form-group">
                                        <label>Semester <span className="text-red-500">*</span></label>
                                        <select name="semester" value={formData.semester} onChange={handleChange} required>
                                            <option value="">Select Semester</option>
                                            {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="cd-form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleChange}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="cd-form-group">
                                        <label>Tags (Comma separated)</label>
                                        <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="e.g., Summary, Pyq" />
                                    </div>

                                    <div className="cd-form-group cd-full-width">
                                        <label>Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="What does this material cover..."></textarea>
                                    </div>

                                    <div className="cd-form-group cd-full-width">
                                        <label>YouTube Link (Optional)</label>
                                        <input type="url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." />
                                    </div>

                                    <div className="cd-form-group cd-full-width">
                                        <label>File Upload <span className="text-red-500">*</span></label>
                                        <div
                                            className={`cd-dropzone ${dragActive ? 'cd-dropzone--active' : ''} ${formData.file ? 'cd-dropzone--hasfile' : ''}`}
                                            onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                                            {formData.file ? (
                                                <div className="cd-dropzone-file">
                                                    <FileIcon className="cd-dropzone-icon" />
                                                    <div className="cd-dropzone-info">
                                                        <strong>{formData.file.name}</strong>
                                                        <span>{(formData.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="cd-dropzone-empty">
                                                    <UploadIcon className="cd-dropzone-icon" />
                                                    <p>Drag & drop your file here or <strong>click to browse</strong></p>
                                                    <span>PDF, DOC, DOCX — Max 20MB</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="preview-modal__actions" style={{ marginTop: 24 }}>
                                    <button type="button" className="preview-modal__btn" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                    <button type="submit" className="preview-modal__btn preview-modal__btn--primary">
                                        <UploadIcon style={{ width: 16, height: 16 }} />
                                        Publish Material
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteConfirm && (
                <div className="preview-modal-overlay" onMouseDown={() => setDeleteConfirm(null)}>
                    <div className="preview-modal" style={{ maxWidth: 400 }} onMouseDown={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ width: 56, height: 56, background: '#fef2f2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <TrashIcon style={{ width: 28, height: 28 }} />
                            </div>
                            <h2 className="preview-modal__title">Delete Material?</h2>
                            <p className="preview-modal__desc" style={{ marginBottom: 0 }}>This action cannot be undone. The file will be permanently removed.</p>
                        </div>
                        <div className="preview-modal__actions">
                            <button className="preview-modal__btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button className="preview-modal__btn" style={{ background: '#dc2626', color: 'white', border: 'none' }} onClick={handleDelete}>Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContributorDashboard;
