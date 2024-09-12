const express = require("express");
const router = express.Router();
const verifyRole = require("../middlewares/verifyRole");
const { checkOneTicket, checkAllTickets, check100Tickets, check1000Tickets, check200RandomTickets, check50RandomTickets, getAllTickets, postNewTickets, updateTicket, postAllTickets, getTicketsByUserId, getOrder, randomizeWinners, postWinners, getTotalTickets, getTicketsByUserIdSearch } = require('../controller/newTickets.js');

router.get("/", getAllTickets);

router.post("/", postNewTickets);

router.post("/updateTicket", updateTicket);

router.post("/postalltickets", postAllTickets);

router.get("/byid/:userId", getTicketsByUserId);

router.get("/byidSearch/:userId", getTicketsByUserIdSearch);

router.get("/gettotaltickets", getTotalTickets);

router.get("/getorder", getOrder);

router.get("/randomizewinners", randomizeWinners);

router.post("/postwinners", verifyRole(7835), postWinners);

router.post("/check50randomtickets", check50RandomTickets);

router.post("/check200randomtickets", check200RandomTickets);

router.get("/check1000tickets/:ticketId", check1000Tickets);

router.get("/check100tickets/:ticketId", check100Tickets);

router.post("/checkalltickets", checkAllTickets);

router.get("/checkoneticket/:ticketId", checkOneTicket);

module.exports = router;