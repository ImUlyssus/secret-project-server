const express = require("express");
const router = express.Router();
const verifyRole = require("../middlewares/verifyRole.js");
const { getRound } = require('../controller/roundsAndPrizes.js');

router.get("/getround", getRound);

module.exports = router;