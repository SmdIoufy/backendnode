'use strict';

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const currentRole = String(req.user?.role || '').toUpperCase();
    const normalizedAllowedRoles = allowedRoles.map(role => String(role).toUpperCase());

    if (!normalizedAllowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé',
        code:    'FORBIDDEN',
      });
    }

    next();
  };
}

module.exports = { requireRole };