'use strict';

const express          = require('express');
const cors             = require('cors');
const helmet           = require('helmet');
const { apiReference } = require('@scalar/express-api-reference');
const swaggerJsdoc     = require('swagger-jsdoc');
const swaggerOptions   = require('./src/docs/swagger.config');
const errorHandler     = require('./src/middlewares/error.middleware');
const { authenticate } = require('./src/middlewares/auth.middleware');
const { requireRole } = require('./src/middlewares/requireRole');

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
// Les clients sont partagés entre ADMIN et GERANT.
app.use('/api/v1/clients', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/clients/clients.routes'));

// Les fournisseurs sont partagés entre ADMIN et GERANT.
app.use('/api/v1/fournisseurs', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/fournisseurs/fournisseurs.routes'));

// Chaque sous-répertoire du catalogue est partagé entre ADMIN et GERANT.
app.use('/api/v1/catalogue/categories', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/catalogue/categories/categories.routes'));
app.use('/api/v1/catalogue/familles',   authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/catalogue/familles/familles.routes'));
app.use('/api/v1/catalogue/variantes',   authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/catalogue/variantes/variantes.routes'));

// Les ventes sont accessibles aux deux rôles métier.
app.use('/api/v1/ventes', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/ventes/ventes.routes'));

// Les approvisionnements sont accessibles aux deux rôles métier.
app.use('/api/v1/approvisionnements', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/approvisionnements/approvisionnements.routes'));

// Les inventaires sont accessibles aux deux rôles métier.
app.use('/api/v1/inventaires', authenticate, requireRole('ADMIN', 'GERANT'), require('./src/modules/inventaires/inventaires.routes'));
app.use('/api/v1/mouvements', require('./src/modules/mouvements/mouvements.routes'));

// Les statistiques et les rapports sont réservés aux ADMIN.
app.use('/api/v1/statistiques', authenticate, requireRole('ADMIN'), require('./src/modules/statistiques/statistiques.routes'));

// L'audit système est réservé aux ADMIN.
app.use('/api/v1/audit', authenticate, requireRole('ADMIN'), require('./src/modules/audit/audit.routes'));

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