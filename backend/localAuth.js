/**
 * localAuth.js — File-based user store for development
 * Used as fallback when Supabase is unreachable.
 * Data stored in backend/users_local.json
 */
const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DB_FILE = path.join(__dirname, 'users_local.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { users: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function findByEmail(email) {
  const db = readDB();
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

function findById(id) {
  const db = readDB();
  return db.users.find(u => u.id === id) || null;
}

function createUser({ full_name, email, password_hash, role, semester, education_field, education_year }) {
  const db = readDB();
  const newUser = {
    id: randomUUID(),
    full_name,
    email,
    password_hash,
    role: role || 'user',
    semester: semester || null,
    education_field: education_field || null,
    education_year: education_year || null,
    notes_preference: [],
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);
  writeDB(db);
  return newUser;
}

function getAllUsers() {
  return readDB().users;
}

module.exports = { findByEmail, findById, createUser, getAllUsers };
