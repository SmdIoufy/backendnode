'use strict';

module.exports = {
  paths: {
    '/ventes/{id}/recu': {
      get: {
        tags: ['Ventes'],
        summary: 'Reçu de vente',
        operationId: 'getRecuVente',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Reçu de vente',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/RecuVenteResponse' },
                  },
                },
              },
            },
          },
          404: {
            description: 'Vente introuvable',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  },
};