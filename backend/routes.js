const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// ═══════════════════════════════════════════════════════════════════════════
//  Auth Middleware
// ═══════════════════════════════════════════════════════════════════════════

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing auth token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  return next();
};

// ═══════════════════════════════════════════════════════════════════════════
//  Auth Routes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Signup ───────────────────────────────────────────────────────────────
router.post('/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password, semester, education_field, education_year } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ message: 'Full name, email, and password are required' });
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        full_name,
        email,
        password_hash,
        role: 'user',
        semester: semester || null,
        education_field: education_field || null,
        education_year: education_year || null,
        notes_preference: []
      }])
      .select('id, full_name, email, role, semester, education_field, education_year')
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ message: 'Account created', token, user });
  } catch (error) {
    console.error('SIGNUP ERROR:', error?.message || error);
    return res.status(500).json({ message: 'Error creating account', error: error.message });
  }
});

// ─── Login ────────────────────────────────────────────────────────────────
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, password_hash, role, semester, education_field, education_year')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// ─── Get current user ─────────────────────────────────────────────────────
router.get('/auth/me', authenticateUser, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, semester, education_field, education_year, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  Public Notes Routes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Get approved notes (public) ──────────────────────────────────────────
router.get('/notes', async (req, res) => {
  try {
    const { branch, year, semester, search } = req.query;
    let query = supabase
      .from('notes')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (branch) query = query.eq('branch', branch);
    if (year) query = query.eq('year', year);
    if (semester) query = query.eq('semester', semester);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,branch.ilike.%${search}%`);

    const { data: notes, error } = await query;
    if (error) throw error;
    return res.json({ count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// ─── Get notes by path params ─────────────────────────────────────────────
router.get('/get-notes/:branch/:year/:semester', async (req, res) => {
  try {
    const { branch, year, semester } = req.params;
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('branch', branch)
      .eq('year', year)
      .eq('semester', semester)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!notes.length) {
      return res.status(404).json({ message: `No notes for ${branch} - ${year} - ${semester}.`, data: [] });
    }
    return res.json({ count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// ─── Save user profile (questionnaire) ────────────────────────────────────
router.post('/save-user-profile', async (req, res) => {
  try {
    const { semester, education_field, education_year, notes_preference } = req.body;
    if (!semester || !education_field || !education_year) {
      return res.status(400).json({ message: 'semester, education_field, and education_year are required' });
    }
    const { data, error } = await supabase
      .from('users')
      .insert([{ semester, education_field, education_year, notes_preference: notes_preference || [] }])
      .select()
      .single();
    if (error) throw error;
    return res.status(201).json({ message: 'Profile saved', data });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
});

// ─── Save user inputs ─────────────────────────────────────────────────────
router.post('/save-inputs', async (req, res) => {
  try {
    const { branch, year, semester, query } = req.body;
    const { error } = await supabase
      .from('user_inputs')
      .insert([{ branch, year, semester, query: query || '' }]);
    if (error) throw error;
    return res.status(201).json({ message: 'Inputs saved' });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving inputs', error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  Contributor Routes (contributor + admin)
// ═══════════════════════════════════════════════════════════════════════════

// ─── Upload a note ────────────────────────────────────────────────────────
router.post('/notes/upload', authenticateUser, requireRole('contributor', 'admin'), async (req, res) => {
  try {
    const { title, description, branch, year, semester, content, fileUrl } = req.body;
    if (!title || !branch || !semester) {
      return res.status(400).json({ message: 'Title, branch, and semester are required' });
    }

    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const { data: note, error } = await supabase
      .from('notes')
      .insert([{
        title,
        description: description || '',
        branch,
        year: year || '',
        semester,
        content: content || '',
        file_url: fileUrl || '',
        uploaded_by: req.user.id,
        status,
        downloads_count: 0,
        rating: 0
      }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ message: status === 'approved' ? 'Note published' : 'Note submitted for review', note });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading note', error: error.message });
  }
});

// ─── Get my uploads ───────────────────────────────────────────────────────
router.get('/notes/my-uploads', authenticateUser, requireRole('contributor', 'admin'), async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('uploaded_by', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching uploads', error: error.message });
  }
});

// ─── Edit own note ────────────────────────────────────────────────────────
router.patch('/notes/:id', authenticateUser, requireRole('contributor', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;

    // Check ownership (unless admin)
    if (req.user.role !== 'admin') {
      const { data: existing } = await supabase.from('notes').select('uploaded_by').eq('id', id).single();
      if (!existing || existing.uploaded_by !== req.user.id) {
        return res.status(403).json({ message: 'You can only edit your own notes' });
      }
    }

    const updates = {};
    const allowed = ['title', 'description', 'content', 'branch', 'year', 'semester'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const { data: note, error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ message: 'Note updated', note });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating note', error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  Admin Routes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Get all notes (any status) ───────────────────────────────────────────
router.get('/admin/notes', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// ─── Approve / Reject note ────────────────────────────────────────────────
router.patch('/admin/notes/:id/status', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved, rejected, or pending' });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ message: `Note ${status}`, note });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating note status', error: error.message });
  }
});

// ─── Delete note ──────────────────────────────────────────────────────────
router.delete('/admin/notes/:id', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { error } = await supabase.from('notes').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.json({ message: 'Note deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// ─── Get all users ────────────────────────────────────────────────────────
router.get('/admin/users', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, semester, education_field, education_year, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ count: users.length, data: users });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// ─── Promote user role ────────────────────────────────────────────────────
router.patch('/admin/users/:id/role', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'contributor', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Role must be user, contributor, or admin' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, full_name, email, role')
      .single();

    if (error) throw error;
    return res.json({ message: `User role updated to ${role}`, user });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating role', error: error.message });
  }
});

// ─── Analytics ────────────────────────────────────────────────────────────
router.get('/admin/analytics', authenticateUser, requireRole('admin'), async (req, res) => {
  try {
    const { count: totalNotes } = await supabase.from('notes').select('*', { count: 'exact', head: true });
    const { count: pendingNotes } = await supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: approvedNotes } = await supabase.from('notes').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: contributors } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'contributor');

    return res.json({
      totalNotes: totalNotes || 0,
      pendingNotes: pendingNotes || 0,
      approvedNotes: approvedNotes || 0,
      totalUsers: totalUsers || 0,
      contributors: contributors || 0,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
});

// ─── Legacy: admin login (backward compat) ────────────────────────────────
router.post('/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Try to find by email (unified users table)
    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, email, password_hash, role')
      .eq('email', username)
      .single();

    if (user && user.role === 'admin') {
      const ok = await bcrypt.compare(password, user.password_hash);
      if (ok) {
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ token, username: user.full_name || user.email });
      }
    }

    // Fallback: check old admins table
    const { data: admin } = await supabase
      .from('admins')
      .select('id, username, password_hash')
      .eq('username', username)
      .single();

    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordOk = await bcrypt.compare(password, admin.password_hash);
    if (!passwordOk) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, username: admin.username, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, username: admin.username });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

router.post('/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const { count } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    if (count > 0) return res.status(403).json({ message: 'Admin already configured' });
    const hash = await bcrypt.hash(password, 10);
    const { error } = await supabase.from('admins').insert([{ username, password_hash: hash }]);
    if (error) throw error;
    return res.status(201).json({ message: 'Admin registered' });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering admin', error: error.message });
  }
});

// ─── DB stats ─────────────────────────────────────────────────────────────
router.get('/db-stats', async (req, res) => {
  try {
    const { count: notesCount } = await supabase.from('notes').select('*', { count: 'exact', head: true });
    const { count: inputsCount } = await supabase.from('user_inputs').select('*', { count: 'exact', head: true });
    res.json({ database: 'Supabase (PostgreSQL)', tables: { notes: notesCount, userInputs: inputsCount }, totalRows: notesCount + inputsCount });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

module.exports = router;
