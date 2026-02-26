import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const SEMESTERS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
const FIELDS = ['Computer Engineering', 'IT', 'EXTC', 'Mechanical', 'Civil', 'Other'];

const SignupPage = () => {
    const [form, setForm] = useState({
        full_name: '', email: '', password: '', confirmPassword: '',
        semester: '', education_field: '', education_year: '', role: 'user',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await signup(
                form.full_name,
                form.email,
                form.password,
                form.semester,
                form.education_field,
                form.role
            );
            if (form.role === 'contributor') {
                navigate('/contributor-dashboard', { replace: true });
            } else {
                navigate('/questionnaire', { replace: true });
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError(err?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-page__bg-blob auth-page__bg-blob--1" />
            <div className="auth-page__bg-blob auth-page__bg-blob--2" />

            <div className="auth-card auth-card--signup">
                <div className="auth-card__header">
                    <div className="auth-card__logo">
                        <svg width="28" height="28" fill="none" viewBox="0 0 48 48">
                            <path clipRule="evenodd" d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" fill="currentColor" fillRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="auth-card__title">Create an account</h1>
                    <p className="auth-card__subtitle">Join NotesFinder to access study materials</p>
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
                        <label className="auth-field__label">Full Name</label>
                        <input
                            className="auth-field__input"
                            type="text"
                            value={form.full_name}
                            onChange={e => update('full_name', e.target.value)}
                            placeholder="Shreya Purandare"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label">Email</label>
                        <input
                            className="auth-field__input"
                            type="email"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="auth-field__row">
                        <div className="auth-field">
                            <label className="auth-field__label">Password</label>
                            <input
                                className="auth-field__input"
                                type="password"
                                value={form.password}
                                onChange={e => update('password', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label className="auth-field__label">Confirm Password</label>
                            <input
                                className="auth-field__input"
                                type="password"
                                value={form.confirmPassword}
                                onChange={e => update('confirmPassword', e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field__row">
                        <div className="auth-field">
                            <label className="auth-field__label">Semester</label>
                            <select
                                className="auth-field__input auth-field__select"
                                value={form.semester}
                                onChange={e => update('semester', e.target.value)}
                            >
                                <option value="">Select</option>
                                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="auth-field">
                            <label className="auth-field__label">Education Field</label>
                            <select
                                className="auth-field__input auth-field__select"
                                value={form.education_field}
                                onChange={e => update('education_field', e.target.value)}
                            >
                                <option value="">Select</option>
                                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-field__label">I want to</label>
                        <div className="auth-role-toggle">
                            <button
                                type="button"
                                className={`auth-role-toggle__btn ${form.role === 'user' ? 'auth-role-toggle__btn--active' : ''}`}
                                onClick={() => update('role', 'user')}
                            >
                                📚 Browse Notes
                            </button>
                            <button
                                type="button"
                                className={`auth-role-toggle__btn ${form.role === 'contributor' ? 'auth-role-toggle__btn--active' : ''}`}
                                onClick={() => update('role', 'contributor')}
                            >
                                ✍️ Contribute Notes
                            </button>
                        </div>
                    </div>

                    <button className="auth-card__submit" type="submit" disabled={loading}>
                        {loading ? <span className="auth-card__spinner" /> : 'Create Account'}
                    </button>
                </form>

                <p className="auth-card__footer-text">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-card__link">Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
