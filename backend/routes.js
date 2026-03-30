const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const supabase = require('./supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// ═══════════════════════════════════════════════════════════════════════════
//  Multer Setup (memory storage — files go to Supabase, not disk)
// ═══════════════════════════════════════════════════════════════════════════

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  },
});

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

// Optional auth — doesn't block, just attaches user if token present
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch { /* ignore */ }
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' });
  }
  return next();
};

// ═══════════════════════════════════════════════════════════════════════════
//  AI Textbook Detection
// ═══════════════════════════════════════════════════════════════════════════

const TEXTBOOK_KEYWORDS = [
  'textbook', 'edition', 'isbn', 'publisher', 'mcgraw', 'pearson', 'wiley',
  'springer', 'cengage', 'oxford university press', 'cambridge university press',
  'elsevier', 'prentice hall', 'addison-wesley', 'o\'reilly', 'packt',
  'copyright', 'all rights reserved', 'printed in', 'library of congress',
  'table of contents', 'chapter 1', 'chapter 2', 'chapter 3',
  'foreword', 'preface', 'acknowledgements', 'about the author',
  'solutions manual', 'instructor', 'answer key',
  'galvin', 'silberschatz', 'tanenbaum', 'cormen', 'kurose', 'stallings',
  'forouzan', 'pressman', 'sommerville', 'navathe', 'elmasri',
  'operating system concepts', 'computer networking a top-down',
  'introduction to algorithms', 'database system concepts',
  'data communications and networking', 'software engineering',
  'digital design', 'computer organization and design',
  'engineering mathematics', 'higher engineering mathematics',
  'let us c', 'the c programming language', 'effective java',
];

const NOTES_INDICATORS = [
  'notes', 'summary', 'revision', 'handwritten', 'lecture', 'pyq',
  'previous year', 'question paper', 'important questions', 'formula sheet',
  'cheat sheet', 'quick revision', 'study material', 'lab manual',
  'experiment', 'observation', 'viva questions', 'assignment',
  'tutorial', 'worksheet', 'unit', 'module', 'sem', 'semester',
  'mid-term', 'end-term', 'practical', 'mini project',
];

function detectTextbook(title, description, fileName) {
  const combined = `${title} ${description} ${fileName}`.toLowerCase();

  let textbookScore = 0;
  let notesScore = 0;
  const matchedKeywords = [];

  // Check textbook keywords
  for (const kw of TEXTBOOK_KEYWORDS) {
    if (combined.includes(kw.toLowerCase())) {
      textbookScore += 2;
      matchedKeywords.push(kw);
    }
  }

  // Check notes indicators
  for (const kw of NOTES_INDICATORS) {
    if (combined.includes(kw.toLowerCase())) {
      notesScore += 2;
    }
  }

  // File size heuristics (textbooks tend to be large, but we handle that via multer limit)
  
  // Check for edition patterns like "3rd edition", "4th ed", "2e"
  if (/\d+(st|nd|rd|th)\s*edition/i.test(combined) || /\d+e\b/i.test(combined)) {
    textbookScore += 5;
    matchedKeywords.push('edition pattern');
  }

  // Check for ISBN pattern
  if (/isbn[\s:-]*[\dxX-]{10,}/i.test(combined)) {
    textbookScore += 10;
    matchedKeywords.push('ISBN');
  }

  // Check for "by Author Name" pattern commonly used in textbook titles
  if (/\bby\s+[A-Z][a-z]+\s+[A-Z]/i.test(combined)) {
    textbookScore += 1;
  }

  // Decision
  let result, confidence, reason;

  if (textbookScore >= 6 && textbookScore > notesScore) {
    result = 'TEXTBOOK';
    confidence = textbookScore >= 10 ? 'HIGH' : 'MEDIUM';
    reason = `Detected textbook indicators: ${matchedKeywords.join(', ')}`;
  } else if (notesScore > textbookScore) {
    result = 'NOTES';
    confidence = 'HIGH';
    reason = 'Content appears to be student-created notes';
  } else {
    result = 'NOTES'; // Default to allow
    confidence = 'LOW';
    reason = 'No strong indicators found, allowing by default';
  }

  return { result, confidence, reason, textbookScore, notesScore };
}

// POST /api/ai-check — AI textbook detection
router.post('/ai-check', (req, res) => {
  try {
    const { title, description, fileName } = req.body;

    if (!title && !description && !fileName) {
      return res.status(400).json({ message: 'At least one field is required' });
    }

    const detection = detectTextbook(title || '', description || '', fileName || '');

    // Log flagged uploads
    if (detection.result === 'TEXTBOOK') {
      supabase.from('flagged_uploads').insert([{
        title: title || '',
        description: description || '',
        file_name: fileName || '',
        reason: detection.reason,
        confidence: detection.confidence,
        uploaded_by: req.body.uploadedBy || 'unknown',
      }]).then(() => {}).catch(() => {}); // Fire and forget
    }

    return res.json(detection);
  } catch (error) {
    console.error('AI CHECK ERROR:', error);
    return res.status(500).json({ message: 'Error checking content', result: 'NOTES' });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
//  Auth Routes
// ═══════════════════════════════════════════════════════════════════════════

// ─── Signup ───────────────────────────────────────────────────────────────
router.post('/auth/signup', async (req, res) => {
  try {
    const { full_name, email, password, semester, education_field, education_year, role } = req.body;
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
    const validRole = (role === 'contributor') ? 'contributor' : 'user';

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        full_name,
        email,
        password_hash,
        role: validRole,
        semester: semester || null,
        education_field: education_field || null,
        education_year: education_year || null,
        notes_preference: []
      }])
      .select('id, full_name, email, role, semester, education_field, education_year')
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
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
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
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
    const { subject, semester, category, search, sort } = req.query;
    let query = supabase
      .from('notes')
      .select('*')
      // Removed status filter so old notes (with status=null) still appear
      .order('created_at', { ascending: false });

    if (subject) query = query.eq('subject', subject);
    if (semester) query = query.eq('semester', semester);
    if (category) query = query.eq('category', category);
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`);
    }

    const { data: notes, error } = await query;
    if (error) throw error;

    // Sort
    if (sort === 'top-rated') {
      notes.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'most-downloaded') {
      notes.sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0));
    }

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
      // Removed status filter here as well
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

// ─── Upload a note (with file) ────────────────────────────────────────────
router.post('/notes/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, description, subject, semester, category, tags, youtube_url, uploader_name, uploader_id } = req.body;

    if (!title || !subject || !semester) {
      return res.status(400).json({ message: 'Title, subject, and semester are required' });
    }

    let fileUrl = '';
    let fileType = 'PDF';

    // Upload file to Supabase Storage (graceful fallback if bucket doesn't exist)
    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      fileType = ext === '.docx' ? 'DOCX' : ext === '.doc' ? 'DOC' : 'PDF';
      const fileName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `uploads/${fileName}`;

      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('notes')
          .upload(storagePath, req.file.buffer, {
            contentType: req.file.mimetype,
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.warn('STORAGE UPLOAD WARNING:', uploadError.message, '- Saving note without file.');
        } else {
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('notes')
            .getPublicUrl(storagePath);

          fileUrl = urlData.publicUrl;
        }
      } catch (storageErr) {
        console.warn('Storage not available, saving note without file:', storageErr.message);
      }
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : tags;
      } catch { parsedTags = []; }
    }

    // Auto-approve (no admin review)
    const { data: note, error } = await supabase
      .from('notes')
      .insert([{
        title,
        description: description || '',
        subject,
        branch: subject, // Keep backward compat
        semester,
        category: category || 'Notes',
        tags: parsedTags,
        file_url: fileUrl,
        file_type: fileType,
        youtube_url: youtube_url || '',
        uploaded_by: uploader_id || null, // from backend Auth
        uploader_name: uploader_name || 'Anonymous',
        status: 'approved', // Auto-approve
        downloads_count: 0,
        views_count: 0,
        rating: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ message: 'Note published successfully!', note });
  } catch (error) {
    console.error('UPLOAD ERROR:', error?.message || error);
    return res.status(500).json({ message: 'Error uploading note', error: error.message });
  }
});

// ─── Get my uploads ───────────────────────────────────────────────────────
router.get('/notes/my-uploads/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('uploaded_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ count: notes.length, data: notes });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching uploads', error: error.message });
  }
});

// ─── Download a note (increment counter) ──────────────────────────────────
router.post('/notes/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    // Get current note
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('downloads_count, file_url')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Increment download count
    const { error: updateError } = await supabase
      .from('notes')
      .update({ downloads_count: (note.downloads_count || 0) + 1 })
      .eq('id', id);

    if (updateError) throw updateError;

    return res.json({ file_url: note.file_url, downloads_count: (note.downloads_count || 0) + 1 });
  } catch (error) {
    return res.status(500).json({ message: 'Error downloading note', error: error.message });
  }
});

// ─── View a note (increment counter) ──────────────────────────────────────
router.post('/notes/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.rpc('increment_views', { note_id: id });
    if (error) {
        console.warn('View tracking missing RPC or table:', error.message);
        return res.status(400).json({ message: 'View not tracked (requires DB setup)' });
    }
    return res.json({ message: 'View incremented' });
  } catch (error) {
    return res.status(500).json({ message: 'Error incrementing view', error: error.message });
  }
});

// ─── Rate a note ──────────────────────────────────────────────────────────
router.post('/notes/:id/rate', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 1. Upsert the rating
    const { error: upsertError } = await supabase
      .from('ratings')
      .upsert({ note_id: id, user_id: userId, rating_value: rating }, { onConflict: 'note_id,user_id' });

    if (upsertError) throw upsertError;

    // 2. Fetch all ratings to calculate average
    const { data: ratings, error: avgError } = await supabase
      .from('ratings')
      .select('rating_value')
      .eq('note_id', id);

    if (avgError) throw avgError;

    const avg = ratings.reduce((acc, curr) => acc + curr.rating_value, 0) / ratings.length;
    const roundedAvg = Math.round(avg * 10) / 10;

    // 3. Update the note's overall rating
    const { error: updateError } = await supabase
      .from('notes')
      .update({ rating: roundedAvg })
      .eq('id', id);

    if (updateError) throw updateError;

    return res.json({ message: 'Rating saved', newAverage: roundedAvg });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving rating', error: error.message });
  }
});

// ─── Delete own note ──────────────────────────────────────────────────────
router.delete('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // Get note to check ownership and file path
    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('uploaded_by, file_url')
      .eq('id', id)
      .single();

    if (fetchError || !note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Check ownership
    if (userId && note.uploaded_by !== userId) {
      return res.status(403).json({ message: 'You can only delete your own notes' });
    }

    // Delete file from storage if exists
    if (note.file_url && note.file_url.includes('/storage/')) {
      try {
        const urlParts = note.file_url.split('/storage/v1/object/public/notes/');
        if (urlParts[1]) {
          await supabase.storage.from('notes').remove([urlParts[1]]);
        }
      } catch (e) {
        console.error('Error deleting file from storage:', e);
      }
    }

    // Delete from database
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    return res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// ─── Edit own note ────────────────────────────────────────────────────────
router.patch('/notes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    const allowed = ['title', 'description', 'subject', 'semester', 'category', 'tags', 'youtube_url'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Keep branch in sync with subject
    if (updates.subject) updates.branch = updates.subject;

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
