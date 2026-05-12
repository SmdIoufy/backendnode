'use strict';

const express          = require('express');
const cors             = require('cors');
const helmet           = require('helmet');
const { apiReference } = require('@scalar/express-api-reference');
const swaggerJsdoc     = require('swagger-jsdoc');
const swaggerOptions   = require('./src/docs/swagger.config');
const errorHandler     = require('./src/middlewares/error.middleware');

const app = express();

// ── Middlewares ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger ────────────────────────────────────────────────────
const openapiSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', apiReference({
  spec:   { content: openapiSpec },
  theme:  'purple',
  layout: 'sidebar',
}));

app.get('/api-docs.json', (req, res) => {
  res.json(openapiSpec);
});

// ── Route racine ───────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur GESTquiCK API',
    docs:    'http://localhost:3000/api-docs',
  });
});

// ── Routes API ─────────────────────────────────────────────────
app.use('/api/v1/users',   require('./src/modules/users/users.routes'));
app.use('/api/v1/clients', require('./src/modules/clients/clients.routes'));
app.use('/api/v1/fournisseurs', require('./src/modules/fournisseurs/fournisseurs.routes'));
app.use('/api/v1/catalogue/categories', require('./src/modules/catalogue/categories/categories.routes'));
app.use('/api/v1/catalogue/familles',   require('./src/modules/catalogue/familles/familles.routes'));
app.use('/api/v1/catalogue/variantes',  require('./src/modules/catalogue/variantes/variantes.routes'));
app.use('/api/v1/ventes', require('./src/modules/ventes/ventes.routes'));

// ── 404 — TOUJOURS APRÈS LES ROUTES ───────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée → ${req.method} ${req.originalUrl}`,
  });
});

// ── Error Handler — TOUJOURS EN DERNIER ───────────────────────
app.use(errorHandler);

module.exports = app;