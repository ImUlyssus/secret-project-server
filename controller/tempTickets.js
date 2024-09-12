const { tempTickets, newTickets } = require("../models");
const { Op } = require("sequelize");
require('dotenv').config();

const checkManyTickets = async (req, res) => {
    const { tickets } = req.body;
    const ticketIds = tickets.map((ticket) => ticket.ticketId);
    const count1 = await tempTickets.count({
      where: { ticketId: { [Op.in]: ticketIds } },
    });
    const count2 = await newTickets.count({
      where: { ticketId: { [Op.in]: ticketIds } },
    });
  
    if (count1 > 0 || count2 > 0){
        res.json({ isExist: true });
    }else{
        res.json({ isExist: false });
  }
  };

  const checkRandomTickets = async (req, res) => {
    const { tickets } = req.body;
    const ticketIds = tickets.map((ticket) => ticket.ticketId);
    const count1 = await tempTickets.count({
      where: { ticketId: { [Op.in]: ticketIds } },
    });
    const count2 = await newTickets.count({
      where: { ticketId: { [Op.in]: ticketIds } },
    });
  
    if (count1 > 0 || count2 > 0){
      return res.json({ message: "Ticket exists!" });
    }else{
      const createdTickets = await tempTickets.bulkCreate(tickets);
      res.json(createdTickets);
    }
  };

  const checkOneTicket = async (req, res) => {
    const { ticketId } = req.params;
  
    const count1 = await tempTickets.count({
      where: { ticketId }
    });
    const count2 = await newTickets.count({
      where: { ticketId }
    });
    if (count1 > 0 || count2 > 0){
        res.json({ isExist: true });
    }else{
        res.json({ isExist: false });
    }
};

const deleteOneTicket = async (req, res) => {
    const { ticketId } = req.params;
    const deletedTicket = await tempTickets.destroy({ where: { ticketId } });
  
    if (deletedTicket) {
      res.json({ success: true, message: "Ticket deleted successfully" });
    } else {
      res.json({ success: false, message: "Ticket not found" });
    }
  }

  const deleteAllTickets = async (req, res) => {
    const { ticketIds } = req.body;
  
    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      res.status(400).json({ success: false, message: "Invalid or empty ticketIds" });
      return;
    }
  
    try {
      // Find all tickets with the specified ticketIds and delete them
      const deletedTickets = await tempTickets.destroy({
        where: {
          ticketId: {
            [Op.in]: ticketIds,
          },
        },
      });
  
      if (deletedTickets > 0) {
        res.json({ success: true, message: "Tickets deleted successfully" });
      } else {
        res.json({ success: false, message: "Tickets not found" });
      }
    } catch (error) {
      console.error("Error deleting tickets:", error);
      res.status(500).json({ success: false, message: "Error deleting tickets" });
    }
  };

  const check50RandomTickets = async (req, res) => {
    const { ticketId } = req.body;
    let ticketArray = [];
    let attempts = 0;
    while (ticketArray.length < 50 && attempts < 1000) {
      let randomTicket = generateRandomTickets(ticketId);
  
      const count1 = await tempTickets.count({
        where: { ticketId: randomTicket }
      });
      const count2 = await newTickets.count({
        where: { ticketId: randomTicket }
      });
      const isFound = ticketArray.includes(randomTicket);
      if (count1 === 0 && count2 === 0 && !isFound) {
        ticketArray.push(randomTicket);
      }
      attempts++;
    }
    if(attempts === 1000){
        res.json({isExist: true});
    }else{
        res.json(ticketArray);
    }
  };

  const check200RandomTickets = async (req, res) => {
    const { ticketId } = req.body;
    let ticketArray = [];
    let attempts = 0;
    while (ticketArray.length < 200 && attempts < 2000) {
      let randomTicket = generateRandomTickets(ticketId);

      const count1 = await tempTickets.count({
        where: { ticketId: randomTicket }
      });
      const count2 = await newTickets.count({
        where: { ticketId: randomTicket }
      });
      const isFound = ticketArray.includes(randomTicket);
      if (count1 === 0 && count2 === 0 && !isFound) {
        ticketArray.push(randomTicket);
      }
      attempts++;
    }
    if(attempts === 2000){
        res.json({isExist: true});
    }else{
        res.json(ticketArray);
    }
  };

  const check1000Tickets = async (req, res) => {
    const generatedTickets = [];
  
    for (let i = 0; i < 10; i++) {
      const startTicketId = req.params.ticketId + i + "00";
      const endTicketId = startTicketId.substring(0, 6) + "99";
      const foundInNewTickets = await newTickets.findAll({
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
      const foundInTempTickets = await tempTickets.findAll({
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
  
      if (foundInNewTickets.length === 0 && foundInTempTickets.length === 0) {
        const generated = generateTickets(startTicketId, endTicketId);
        generatedTickets.push(...generated);
      }else{
        return res.json({ message: "Ticket exists!" });
      }
    }

    if (generatedTickets.length === 1000) {
      res.json(generatedTickets);
    } else {
      return res.json({ isExist: true });
    }
  };

  const check100Tickets = async (req, res) => {
    const generatedTickets = [];
  
      const startTicketId = req.params.ticketId + "00";
      const endTicketId = req.params.ticketId + "99";
      const foundInNewTickets = await newTickets.findAll({
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

      const foundInTempTickets = await newTickets.findAll({
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
  
      if (foundInNewTickets.length === 0 && foundInTempTickets.length === 0) {
        const generated = generateTickets(startTicketId, endTicketId);
        generatedTickets.push(...generated);
        res.json(generatedTickets);
      }else{
        return res.json({ isExist: true });
      }
  };

  const checkAllTickets = async (req, res) => {
    try {
      const { allTickets } = req.body;
      const tempTicketsResult = await tempTickets.findAll({
        where: { ticketId: { [Op.in]: allTickets } },
        attributes: ['ticketId'], // Include only the ticketId column in the result
      });
      const newTicketsResult = await newTickets.findAll({
        where: { ticketId: { [Op.in]: allTickets } },
        attributes: ['ticketId'], // Include only the ticketId column in the result
      });
  
      const foundTicketIds = [
        ...tempTicketsResult.map((ticket) => ticket.ticketId),
        ...newTicketsResult.map((ticket) => ticket.ticketId),
      ];
  
      const notFoundTicketIds = allTickets.filter((ticketId) => !foundTicketIds.includes(ticketId));
  
    res.json({ foundTicketIds, notFoundTicketIds });
    } catch (error) {
      console.error('Error checking tickets:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

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
  
  const generateRandomTickets = (userInput) => {
    let result = userInput;
  
    switch (userInput.length) {
      case 6:
        result += generateRandomDigit(2);
        break;
      case 5:
        result += generateRandomDigit(3);
        break;
      case 4:
        result += generateRandomDigit(4);
        break;
      case 3:
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));// Random digit between 0 and 9
        result += generateRandomDigit(4);
        break;
      case 2:
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += generateRandomDigit(4);
        break;
      case 1:
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += generateRandomDigit(4); // Random digit between 0 and 9
        break;
      case 0:
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
        result += generateRandomDigit(4); // Random digit between 0 and 9
        break;
      default:
        break;
    }
  
    return result;
  };
  
  const generateRandomDigit = (noOfDigits) => {
    let result = '';
    for (let i = 0; i < noOfDigits; i++) {
      const randomDigit = Math.floor(Math.random() * 10);
      result += randomDigit.toString();
    }
    return result;
  };

  module.exports = { checkManyTickets, checkRandomTickets, checkOneTicket, deleteOneTicket, deleteAllTickets, check50RandomTickets, check200RandomTickets, check1000Tickets, check100Tickets, checkAllTickets };