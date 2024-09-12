const { oldTickets } = require("../models");
require('dotenv').config();

const getRound = async (req, res) => {
    try {
        const highestRound = await oldTickets.max('round');
        let round;
        if (highestRound !== null) {
            round = highestRound;
        }
        res.json(round);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching round." });
    }
};

const getTotalTickets = async (req, res) => {
    let round = req.params.round;
    try {
      // Fetch tickets excluding those with status 'refund' from newTickets
      const listOfTickets = await oldTickets.findAll({
        where: {
          round
        }
      });
      res.json(listOfTickets.length);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
  };

const getOrder = async (req, res) => {
    const { userId, purchaseDate } = req.query;

    try {
        const tickets = await oldTickets.findAll({
            where: {
                userId,
                purchaseDate: {
                    [Op.eq]: purchaseDate, // Assuming purchaseDate is a specific date in ISO string format
                },
            },
            attributes: ['ticketId'], // Include only the ticketId attribute
        });

        const ticketIds = tickets.map(ticket => ticket.ticketId);
        res.json({ success: true, ticketIds: ticketIds });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
}

const searchUserOldTickets = async (req, res) => {
    const userId = req.params.userId;

    try {
        const tickets = await oldTickets.findAll({
            where: {
                userId: userId,
            },
            attributes: [
                'ticketId',
                'paid',
                'prize',
                'purchaseDate',
                'status',
            ]
        });
        res.json({ success: true, tickets: tickets });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
}

const getUserOldTickets = async (req, res) => {
    const userId = req.params.userId;

    try {
        const tickets = await oldTickets.findAll({
            where: {
                userId: userId,
            },
            attributes: ['ticketId'], // Include only the ticketId attribute
        });

        const ticketIds = tickets.map(ticket => ticket.ticketId);
        res.json({ success: true, ticketIds: ticketIds });
    } catch (error) {
        console.error("Error fetching tickets:", error);
        res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
}
const postOldTickets = async (req, res) => {
    const oldTicket = req.body;
    await oldTickets.create(oldTicket);
    res.json(oldTicket);
}

const getAllOldTickets = async (req, res) => {
    const listOfTickets = await oldTickets.findAll();
    res.json(listOfTickets);
}

const updateTicket = async (req, res) => {
    const { ticketId, status, paid, purchaseDate } = req.body;
    try {
      const ticket = await oldTickets.findOne({ where: { ticketId: ticketId, purchaseDate: purchaseDate },
        attributes: {
          exclude: ['userUserId']
        }});
      if (ticket) {
        ticket.paid = paid;
        ticket.status = status;
        await ticket.save();
        return res.json({ success: true, message: "Ticket updated" });
      } else {
        return res.json({ success: false, message: "Ticket does not exist" });
      }
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(500).json({ error: "An error occurred while updating ticket." });
    }
  };

module.exports = { getTotalTickets, getRound, getOrder, searchUserOldTickets, getUserOldTickets, postOldTickets, getAllOldTickets, updateTicket }