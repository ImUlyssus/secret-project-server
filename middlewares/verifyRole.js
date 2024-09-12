const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
      if (req.userRole == null) return res.sendStatus(401);

      const role = req.userRole;
      const result = allowedRoles.includes(role);

      if (!result) return res.sendStatus(401);
      next();
    }
  }

  module.exports = verifyRole;