const express = require("express");
const router = express.Router();
const { postMessage, getMessages, updateMessage } = require('../controller/contactUs.js');

router.post("/postmessage", postMessage);
router.get("/getmessages", getMessages);
router.post("/updatemessage", updateMessage)

module.exports = router;
