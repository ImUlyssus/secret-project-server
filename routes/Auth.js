const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { users } = require("../models");
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');
require('dotenv').config();
router.post("/forgotpassword", async(req, res)=>{
    const {email} = req.body;
    try{
        const oldUser = await users.findOne({ where: { email: email } });
        if(!oldUser){
            return res.json({success: false, message:"Email doesn't exist."})
        }
        const secret = process.env.JWT_SECRET+oldUser.password;
        const token = jwt.sign({email: oldUser.email, id: oldUser.userId}, secret, {
            expiresIn: '5m',
        });
        const link = `http://localhost:3001/resetpassword/${oldUser.userId}/${token}`;
        // console.log(link, oldUser.email);
        res.json({success: true, message: link});
    }catch(error){
        console.log(error);
    }
})

router.get("/resetpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    // console.log(req.params);
    const oldUser = await users.findOne({ where: {userId: id} });
    // console.log(oldUser.email);
    if (!oldUser) {
      return res.json({ success: false, message: "User Not Exists!!" });
    }
    const secret = process.env.JWT_SECRET + oldUser.password;
    try {
      const verify = jwt.verify(token, secret);
      res.render("index", { email: verify.email, status: "Not Verified" });
    } catch (error) {
      console.log(error);
      res.send("Not Verified");
    }
  });

  router.post("/resetpassword/:id/:token", async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
  
    const oldUser = await users.findOne({ where: {userId: id} });
    if (!oldUser) {
      return res.json({ success:false, message: "User Not Exists!!" });
    }
    const secret = process.env.JWT_SECRET + oldUser.password;
    try {
      const verify = jwt.verify(token, secret);
      const encryptedPassword = await bcrypt.hash(password, 10);
      oldUser.password = encryptedPassword;
      await oldUser.save();
  
      res.render("index", { email: verify.email, status: "verified" });
    } catch (error) {
      console.log(error);
      res.json({ status: "Something Went Wrong" });
    }
  });

module.exports = router