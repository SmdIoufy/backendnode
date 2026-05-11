'use strict';

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const swaggerJsdoc   = require('swagger-jsdoc');
const swaggerUi      = require('swagger-ui-express');
const swaggerOptions = require('./src/docs/swagger.config');
const usersRoutes    = require('./src/modules/users/users.routes');

const app = express();

// ── Middlewares ────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger spec ───────────────────────────────────────────────
const openapiSpec = swaggerJsdoc(swaggerOptions);

// ── Swagger UI ─────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
  swaggerOptions: {
    docExpansion:         'none',
    persistAuthorization: true,
    filter:               true,
  },
}));

// ── Spec JSON brut ─────────────────────────────────────────────
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

// ── Route de test TEMPORAIRE (dev uniquement) ──────────────────
if (process.env.NODE_ENV === 'development') {
  app.get('/api/v1/test/users', async (req, res) => {
    const { db } = require('./src/config/database');
    const users = await db('BaseEntity as b')
      .join('User as u', 'u.id', 'b.id')
      .select('b.id', 'u.email', 'u.displayName', 'u.role', 'u.isActive');
    res.json({ success: true, data: users });
  });
}

// ── Routes API ─────────────────────────────────────────────────
app.use('/api/v1/users', usersRoutes);

// ── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée → ${req.method} ${req.originalUrl}`,
  });
});

module.exports = app;