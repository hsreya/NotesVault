import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ContributorDashboard.css';

const ContributorDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUploads: 0,
        totalDownloads: 0,
        averageRating: 0,
        pendingApprovals: 0
    });
    const [myNotes, setMyNotes] = useState([]);

    useEffect(() => {
        // Load notes from localStorage
        const allNotes = JSON.parse(localStorage.getItem('notesfinder_notes') || '[]');
        const contributorNotes = allNotes.filter(n => n.uploaded_by === user?.email);
        setMyNotes(contributorNotes);

        // Calculate stats
        const uploads = contributorNotes.length;
        const downloads = contributorNotes.reduce((acc, n) => acc + (n.downloads_count || 0), 0);
        const ratings = contributorNotes.filter(n => n.rating > 0);
        const avgRating = ratings.length > 0 ? (ratings.reduce((acc, n) => acc + n.rating, 0) / ratings.length).toFixed(1) : 0;
        const pending = contributorNotes.filter(n => n.status === 'pending').length;

        setStats({
            totalUploads: uploads,
            totalDownloads: downloads,
            averageRating: avgRating,
            pendingApprovals: pending
        });
    }, [user?.email]);

    return (
        <div className="contributor-dash">
            <aside className="contributor-dash__sidebar">
                <div className="contributor-dash__logo">
                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
                    </svg>
                    <span>NotesHub</span>
                </div>

                <nav className="contributor-dash__nav">
                    <button className="contributor-dash__nav-item contributor-dash__nav-item--active">
                        <span className="material-symbols-outlined">dashboard</span>
                        Dashboard
                    </button>
                    <button className="contributor-dash__nav-item" onClick={() => navigate('/notes')}>
                        <span className="material-symbols-outlined">description</span>
                        Browse All Notes
                    </button>
                    <button className="contributor-dash__nav-item">
                        <span className="material-symbols-outlined">upload_file</span>
                        Upload New
                    </button>
                </nav>

                <div className="contributor-dash__sidebar-footer">
                    <button className="contributor-dash__logout" onClick={logout}>
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="contributor-dash__content">
                <header className="contributor-dash__header">
                    <div>
                        <h1>Contributor Dashboard</h1>
                        <p>Welcome back, {user?.full_name}</p>
                    </div>
                </header>

                <section className="contributor-dash__stats">
                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--blue">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <div className="stat-card__info">
                            <h3>{stats.totalUploads}</h3>
                            <p>Total Uploads</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--green">
                            <span className="material-symbols-outlined">download</span>
                        </div>
                        <div className="stat-card__info">
                            <h3>{stats.totalDownloads}</h3>
                            <p>Downloads</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--yellow">
                            <span className="material-symbols-outlined">star</span>
                        </div>
                        <div className="stat-card__info">
                            <h3>{stats.averageRating}</h3>
                            <p>Avg Rating</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-card__icon stat-card__icon--purple">
                            <span className="material-symbols-outlined">hourglass_empty</span>
                        </div>
                        <div className="stat-card__info">
                            <h3>{stats.pendingApprovals}</h3>
                            <p>Pending</p>
                        </div>
                    </div>
                </section>

                <section className="contributor-dash__table-container">
                    <div className="table-header">
                        <h2>My Uploads</h2>
                        <button className="upload-btn">
                            <span className="material-symbols-outlined">add</span>
                            Upload New Note
                        </button>
                    </div>
                    <table className="contributor-dash__table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Downloads</th>
                                <th>Rating</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myNotes.length > 0 ? (
                                myNotes.map(note => (
                                    <tr key={note.id}>
                                        <td>{note.title}</td>
                                        <td>{note.category}</td>
                                        <td>
                                            <span className={`status-pill status-pill--${note.status}`}>
                                                {note.status}
                                            </span>
                                        </td>
                                        <td>{note.downloads_count || 0}</td>
                                        <td>{note.rating || 'N/A'}</td>
                                        <td>
                                            <button className="action-btn">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="empty-row">No notes uploaded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default ContributorDashboard;
