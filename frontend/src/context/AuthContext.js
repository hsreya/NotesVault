import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

/* ── localStorage helpers ─────────────────────────────────── */
const USERS_KEY = 'notesfinder_users';
const SESSION_KEY = 'notesfinder_session';

// Pre-seeded accounts so admin/contributor are testable immediately
const SEED_USERS = [
    {
        id: 'admin-001',
        full_name: 'Admin',
        email: 'admin@notesfinder.com',
        password: 'admin123',
        role: 'admin',
        semester: '',
        education_field: '',
        created_at: new Date().toISOString(),
    },
    {
        id: 'contributor-001',
        full_name: 'Contributor',
        email: 'contributor@notesfinder.com',
        password: 'contributor123',
        role: 'contributor',
        semester: 'Sem 6',
        education_field: 'Computer Engineering',
        created_at: new Date().toISOString(),
    },
];

const getUsers = () => {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        if (!raw) {
            localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
            return [...SEED_USERS];
        }
        const users = JSON.parse(raw);
        // Ensure seed accounts always exist
        const emails = users.map(u => u.email);
        SEED_USERS.forEach(seed => {
            if (!emails.includes(seed.email)) users.push(seed);
        });
        return users;
    } catch {
        localStorage.setItem(USERS_KEY, JSON.stringify(SEED_USERS));
        return [...SEED_USERS];
    }
};

const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const getSession = () => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

const saveSession = (user) => {
    if (user) {
        const { password, ...safe } = user;
        localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
};

/* ── provider ────────────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session on mount
    useEffect(() => {
        const session = getSession();
        if (session) {
            // Re-read from users list to get latest role
            const users = getUsers();
            const latest = users.find(u => u.id === session.id);
            if (latest) {
                const { password, ...safe } = latest;
                setUser(safe);
            } else {
                setUser(session);
            }
        }
        setLoading(false);
    }, []);

    /* ── signup ─────────────────────────────────────────────── */
    const signup = useCallback(async (full_name, email, password, semester, education_field, role) => {
        const users = getUsers();

        if (users.some(u => u.email === email)) {
            throw new Error('An account with this email already exists');
        }
        if (!email || !password || !full_name) {
            throw new Error('Full name, email, and password are required');
        }
        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        const validRole = (role === 'contributor') ? 'contributor' : 'user';

        const newUser = {
            id: `user-${Date.now()}`,
            full_name,
            email,
            password,
            role: validRole,
            semester: semester || '',
            education_field: education_field || '',
            created_at: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        const { password: _, ...safe } = newUser;
        setUser(safe);
        saveSession(newUser);
        return safe;
    }, []);

    /* ── login ──────────────────────────────────────────────── */
    const login = useCallback(async (email, password) => {
        const users = getUsers();
        const found = users.find(u => u.email === email);

        if (!found) {
            throw new Error('No account found with this email');
        }
        if (found.password !== password) {
            throw new Error('Incorrect password');
        }

        const { password: _, ...safe } = found;
        setUser(safe);
        saveSession(found);
        return safe;
    }, []);

    /* ── logout ─────────────────────────────────────────────── */
    const logout = useCallback(() => {
        setUser(null);
        saveSession(null);
    }, []);

    /* ── admin: get all users ───────────────────────────────── */
    const getAllUsers = useCallback(() => {
        return getUsers().map(({ password, ...safe }) => safe);
    }, []);

    /* ── admin: update user role ────────────────────────────── */
    const updateUserRole = useCallback((userId, newRole) => {
        const users = getUsers();
        const idx = users.findIndex(u => u.id === userId);
        if (idx === -1) throw new Error('User not found');
        users[idx].role = newRole;
        saveUsers(users);
        // If updating self, update session
        if (user?.id === userId) {
            const { password, ...safe } = users[idx];
            setUser(safe);
            saveSession(users[idx]);
        }
    }, [user]);

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
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
