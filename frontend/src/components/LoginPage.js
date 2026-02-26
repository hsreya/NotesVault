import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'admin') {
                navigate('/admin-dashboard', { replace: true });
            } else if (user.role === 'contributor') {
                navigate('/contributor-dashboard', { replace: true });
            } else {
                navigate('/questionnaire', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__bg-blob auth-page__bg-blob--1" />
            <div className="auth-page__bg-blob auth-page__bg-blob--2" />

            <div className="auth-card">
                <div className="auth-card__header">
                    <div className="auth-card__logo">
                        <svg width="28" height="28" fill="none" viewBox="0 0 48 48">
                            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="auth-card__title">Welcome back</h1>
                    <p className="auth-card__subtitle">Sign in to your NotesFinder account</p>
                </div>

                {error && (
                    <div className="auth-card__error">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
                        </svg>
                        {error}
                    </div>
                )}

                <form className="auth-card__form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-field__label">Email</label>
                        <input
                            className="auth-field__input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label">Password</label>
                        <input
                            className="auth-field__input"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button className="auth-card__submit" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="auth-card__spinner" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                <p className="auth-card__footer-text">
                    Don't have an account?{' '}
                    <Link to="/signup" className="auth-card__link">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
