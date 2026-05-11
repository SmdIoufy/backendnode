'use strict';

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'GESTquiCK API',
    version: '1.0.0',
    description: `
## API de gestion de stock — Quincaillerie

### Authentification
Toutes les routes protégées nécessitent un **Bearer Token Firebase** :
\`\`\`
Authorization: Bearer <firebase_id_token>
\`\`\`

### Conventions
- Dates en **ISO 8601** (UTC)
- Identifiants en **UUID v4**
- Pagination via \`page\` et \`limit\`
    `,
    contact: {
      name: 'Équipe Dev',
      email: 'dev@gestquick.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Serveur local',
    },
  ],
  security: [{ BearerAuth: [] }],
};