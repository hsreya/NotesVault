require('dotenv').config();

const express = require('express');
const cors = require('cors');
const notesRouter = require('./routes.js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', notesRouter);

// Test Route
app.get('/', (req, res) => {
  res.send('Backend is running.');
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
