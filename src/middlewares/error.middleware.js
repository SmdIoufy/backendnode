'use strict';

function errorHandler(err, req, res, next) {

  console.error('❌ Erreur :', {
    message: err.message,
    path:    req.path,
    method:  req.method,
    stack:   process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // ── Validation Joi ─────────────────────────────────────────
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      code:    'VALIDATION_ERROR',
      errors:  err.details.map(d => ({
        field:   d.path.join('.'),
        message: d.message,
      })),
    });
  }

  // ── Erreur métier ──────────────────────────────────────────
  if (err.isOperational) {
    return res.status(err.statusCode || 400).json({
      success: false,
      message: err.message,
      code:    err.code,
    });
  }

  // ── Erreurs PostgreSQL ─────────────────────────────────────
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Cette ressource existe déjà',
      code:    'DUPLICATE_ENTRY',
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Référence invalide',
      code:    'FOREIGN_KEY_VIOLATION',
    });
  }

  // ── Erreur inconnue ────────────────────────────────────────
  return res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    code:    'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      detail: err.message,
    }),
  });
}

module.exports = errorHandler;