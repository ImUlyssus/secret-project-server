const express = require("express");
const router = express.Router();
const verifyRole = require("../middlewares/verifyRole");
const { getTotalTickets, getRound, getOrder, searchUserOldTickets, getUserOldTickets, postOldTickets, getAllOldTickets, updateTicket } = require('../controller/oldTickets.js');

router.get("/getround", getRound);

router.get("/gettotaltickets/:round", getTotalTickets);

router.get("/", verifyRole(0), getAllOldTickets);

router.post("/", postOldTickets);

router.get("/byid/:userId", getUserOldTickets);

router.get("/byidSearch/:userId", searchUserOldTickets);

router.get("/getorder", getOrder);

router.post("/updateticket", updateTicket)


module.exports = router;