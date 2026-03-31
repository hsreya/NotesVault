import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5127';
const TOKEN_KEY = 'notesfinder_token';

/* ── provider ────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── logout ─────────────────────────────────────────────── */
    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
    }, []);

    const fetchMe = useCallback(async (token) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Token invalid');
            const data = await res.json();
            setUser(data.user);
        } catch (err) {
            console.warn('Session expired or invalid', err);
            logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    // Restore session on mount
    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
            fetchMe(token);
        } else {
            setLoading(false);
        }
    }, [fetchMe]);

    /* ── signup ─────────────────────────────────────────────── */
    const signup = useCallback(async (full_name, email, password, semester, education_field, role) => {
        const res = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name, email, password, semester, education_field, role })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Signup failed');
        
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return data.user;
    }, []);

    /* ── login ──────────────────────────────────────────────── */
    const login = useCallback(async (email, password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');

        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        return data.user;
    }, []);

    /* ── helper functions (optional/deprecated if server handled) */
    const getAllUsers = useCallback(() => {
        console.warn('getAllUsers not implemented in backend auth yet');
        return [];
    }, []);

    const updateUserRole = useCallback((userId, newRole) => {
         console.warn('updateUserRole not implemented in backend auth yet');
    }, []);

    /* ── context value ──────────────────────────────────────── */
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isContributor = user?.role === 'contributor';

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                isAdmin,
                isContributor,
                login,
                signup,
                logout,
                getAllUsers,
                updateUserRole,
                token: localStorage.getItem(TOKEN_KEY) // expose token for API calls
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
