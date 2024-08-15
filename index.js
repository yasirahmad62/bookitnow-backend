const express = require('express');
const mongoose = require('mongoose');
const db = require('./db');
const routes = require('./routes');
const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport'); // Import this
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(cors()); // Use cors middleware

// Routes
app.use('/api', routes);

// Connect to MongoDB
db.connect();

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
