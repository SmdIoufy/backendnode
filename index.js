require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Bienvenue sur l\'API Backend',
    status: 'online'
  });
});

app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API fonctionnelle',
    timestamp: new Date()
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

module.exports = app;
