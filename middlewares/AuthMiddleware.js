const jwt = require("jsonwebtoken");
const { users } = require("../models");
require('dotenv').config()

const protect = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  // token = req.cookie.jwt;
  // console.log(token);
  // if(token){
  //   try{
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //     console.log('Hi I am your middleware')
  //     req.user = await users.findByPk(userId).select('-password');
  //     next();
  //   }catch(error){
  //     res.status(401);
  //     throw new Error('Not authorized, invalid token');
  //   }
  // }else{
  //   res.status(401);
  //   // throw new Error("Not authorized, no token")
  // }
}

module.exports = protect;

// const auth = (req, res, next) => {
//     const token = req.headers["x-access-token"];
//     if (!token) {
//       res.send("You need a token");
//     } else {
//       jwt.verify(token, "jwtSecret", (err, decoded) => {
//         if (err) {
//           res.json({ auth: false, message: "Failed to authenticate" });
//         } else {
//           req.userId = decoded.id;
//           next();
//         }
//       });
//     }
//   };
  
//   module.exports = auth;
  