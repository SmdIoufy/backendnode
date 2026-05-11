'use strict';

const path = require('path');
const fs   = require('fs');
const YAML = require('js-yaml');

const openApiBase = require('./openapi.base');
const tags        = require('./tags/tags');

// ── Chargement récursif des YAML ───────────────────────────────
function loadYamlDir(dir) {
  let merged = {};
  if (!fs.existsSync(dir)) return merged;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      merged = deepMerge(merged, loadYamlDir(fullPath));
    } else if (entry.name.endsWith('.yaml')) {
      const content = YAML.load(fs.readFileSync(fullPath, 'utf8'));
      if (content) merged = deepMerge(merged, content);
    }
  }
  return merged;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      result[key] &&
      typeof result[key] === 'object' &&
      !Array.isArray(result[key])
    ) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

// ── Chargement ─────────────────────────────────────────────────
const schemasDir = path.join(__dirname, 'schemas');
const pathsDir   = path.join(__dirname, 'paths');

const yamlSchemas = loadYamlDir(schemasDir);
const yamlPaths   = loadYamlDir(pathsDir);

// ── Spec finale ────────────────────────────────────────────────
const swaggerDefinition = {
  ...openApiBase,
  tags: Array.isArray(tags) ? tags : [],
  components: {
    schemas: yamlSchemas.components?.schemas || {},
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Firebase JWT',
        description: 'Token Firebase. Format : `Bearer <token>`',
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token manquant ou invalide',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
      NotFoundError: {
        description: 'Ressource introuvable',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    },
    parameters: {
      IdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
      },
      PageParam: {
        name: 'page',
        in: 'query',
        schema: { type: 'integer', default: 1 },
      },
      LimitParam: {
        name: 'limit',
        in: 'query',
        schema: { type: 'integer', default: 20 },
      },
    },
  },
  paths: yamlPaths.paths || {},
};

module.exports = {
  swaggerDefinition,
  apis: [],
};