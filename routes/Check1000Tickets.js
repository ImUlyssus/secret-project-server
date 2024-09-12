const express = require("express");
const router = express.Router();
const { newTickets } = require("../models");
const { Op } = require("sequelize");

function generateTickets(startTicketId, endTicketId) {
  const generatedTickets = [];
  const startNum = parseInt(startTicketId.substring(startTicketId.length - 3));
  const endNum = parseInt(endTicketId.substring(endTicketId.length - 3));

  for (let num = startNum; num <= endNum; num++) {
    const ticketNum = num.toString().padStart(3, "0");
    const ticket = startTicketId.substring(0, startTicketId.length - 3) + ticketNum;
    generatedTickets.push(ticket);
  }

  return generatedTickets;
}

async function addTicket(startTicketId, endTicketId, generatedTickets) {
  try {
    const tickets = await newTickets.findAll({
      where: {
        ticketId: {
          [Op.between]: [startTicketId, endTicketId],
        },
      },
      attributes: {
        exclude: ['userUserId']
      },
      order: [["ticketId", "ASC"]],
    });

    if (tickets.length === 0) {
      const generated = generateTickets(startTicketId, endTicketId);
      generatedTickets.push(...generated);
    }
  } catch (error) {
    console.error("Error retrieving tickets:", error);
  }
}
module.exports = router;
