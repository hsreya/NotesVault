const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const DB_FILE = path.join(__dirname, 'notes_local.json');

function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ notes: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return { notes: [] };
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function getAllNotes() {
  return readDB().notes;
}

function getNotesByUser(userId) {
  return readDB().notes.filter(n => n.uploaded_by === userId);
}

function deleteNote(id) {
  const db = readDB();
  db.notes = db.notes.filter(n => n.id !== id);
  writeDB(db);
}

function createNote(noteData) {
  const db = readDB();
  const newNote = {
    id: randomUUID(),
    ...noteData,
    created_at: new Date().toISOString()
  };
  db.notes.push(newNote);
  writeDB(db);
  return newNote;
}

module.exports = { getAllNotes, getNotesByUser, deleteNote, createNote };
