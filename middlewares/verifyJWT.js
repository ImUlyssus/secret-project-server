const jwt = require("jsonwebtoken");
require('dotenv').config()

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.sendStatus(401);
    } else {
        const token = authHeader.split(" ")[1];
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
          return res.sendStatus(403);
        } else {
          req.userId = decoded.userInfo.userId;
          req.userRole = decoded.userInfo.userRole;
          next();
        }
      });
    }
  };
  
  module.exports = verifyJWT;
  