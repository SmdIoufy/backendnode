'use strict';

module.exports = {
  components: {
    schemas: {
      RecuVenteClient: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          nom: { type: 'string', example: 'Diallo BTP' },
          telephone: { type: 'string', nullable: true, example: '+221 77 111 22 33' },
          email: { type: 'string', nullable: true, example: 'diallo@btp.sn' },
          actif: { type: 'boolean', example: true },
        },
      },
      LigneVenteRecu: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          Ven_id: { type: 'string', format: 'uuid' },
          Var_id: { type: 'string', format: 'uuid' },
          quantite: { type: 'integer', example: 5 },
          prixUnitaire: { type: 'number', example: 2500 },
          coutUnitaire: { type: 'number', example: 1500 },
          remise: { type: 'number', example: 0 },
          montantBrut: { type: 'number', example: 12500 },
          montantRemise: { type: 'number', example: 0 },
          montantNet: { type: 'number', example: 12500 },
          produit: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              dimension: { type: 'string', nullable: true, example: '10mm' },
              epaisseur: { type: 'string', nullable: true, example: '2mm' },
              prixVente: { type: 'number', example: 2500 },
              prixAchatMoyen: { type: 'number', example: 1500 },
              famille: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  nom: { type: 'string', example: 'Quincaillerie' },
                  description: { type: 'string', nullable: true, example: 'Famille de produits' },
                },
              },
            },
          },
        },
      },
      RecuVenteResponse: {
        type: 'object',
        properties: {
          vente: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              dateCreation: { type: 'string', format: 'date-time' },
              dateModification: { type: 'string', format: 'date-time' },
              version: { type: 'integer' },
              Cli_id: { type: 'string', format: 'uuid' },
              reference: { type: 'string', example: 'VNT-2026-00001' },
              date: { type: 'string', format: 'date' },
              montantTotal: { type: 'number', example: 12500 },
              statut: { type: 'string', enum: ['BROUILLON', 'VALIDEE', 'ANNULEE'] },
              client: { $ref: '#/components/schemas/RecuVenteClient' },
              totals: {
                type: 'object',
                properties: {
                  montantBrut: { type: 'number', example: 12500 },
                  montantRemise: { type: 'number', example: 0 },
                  montantNet: { type: 'number', example: 12500 },
                },
              },
            },
          },
          lignes: {
            type: 'array',
            items: { $ref: '#/components/schemas/LigneVenteRecu' },
          },
        },
      },
    },
  },
};