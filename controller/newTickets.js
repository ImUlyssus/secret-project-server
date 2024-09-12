const { roundsAndPrizes, oldTickets, newTickets, users, sequelize } = require("../models");
const { Op, Sequelize, QueryTypes } = require("sequelize");
require('dotenv').config();

const getAllTickets = async (req, res) => {
  try {
    // Fetch tickets excluding those with status 'refund' from newTickets
    const listOfTickets = await newTickets.findAll({
      where: {
        status: {
          [Sequelize.Op.ne]: 'refund' // Exclude 'refund' status
        }
      }
    });

    // Find the highest round value from oldTickets
    const highestRound = await oldTickets.max('round');

    // Determine the new round value
    let round = 1;
    if (highestRound !== null) {
      round = highestRound + 1;
    }

    // Here, round contains the desired round value based on the logic
    res.json(listOfTickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching tickets." });
  }
};



const postNewTickets = async (req, res) => {
  const newTicket = req.body;
  await newTickets.create(newTicket);
  res.json(newTicket);
}

const updateTicket = async (req, res) => {
  const { ticketId, status, paid } = req.body;
  try {
    const ticket = await newTickets.findOne({ where: { ticketId: ticketId },
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


const postAllTickets = async (req, res) => {
  const { tickets } = req.body;
  const ticketIds = tickets.map((ticket) => ticket.ticketId);
  const count2 = await newTickets.count({
    where: { ticketId: { [Op.in]: ticketIds } },
  });

  if (count2 > 0) {
    return res.json({ message: "Ticket exists!" });
  } else {
    const createdTickets = await newTickets.bulkCreate(tickets);
    res.json(createdTickets);
  }
};

const getTicketsByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const tickets = await newTickets.findAll({
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
};

const getTicketsByUserIdSearch = async (req, res) => {
  const userId = req.params.userId;

  try {
    const tickets = await newTickets.findAll({
      where: {
        userId: userId,
      },
      attributes: [
        'ticketId',
        'paid',
        'prize',
        'purchaseDate',
        'status'
      ]
    });
    res.json({ success: true, tickets: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "An error occurred while fetching tickets." });
  }
};


const getOrder = async (req, res) => {
  const { userId, purchaseDate } = req.query;

  try {
    let tickets = await newTickets.findAll({
      where: {
        userId,
        purchaseDate: {
          [Op.eq]: purchaseDate, // Assuming purchaseDate is a specific date in ISO string format
        },
      },
      attributes: ['ticketId'], // Include only the ticketId attribute
    });

    if (tickets.length === 0) {
      tickets = await oldTickets.findAll({
        where: {
          userId,
          purchaseDate: {
            [Op.eq]: purchaseDate, // Assuming purchaseDate is a specific date in ISO string format
          },
        },
        attributes: ['ticketId'], // Include only the ticketId attribute
      });
    }

    const ticketIds = tickets.map(ticket => ticket.ticketId);
    res.json({ success: true, ticketIds: ticketIds });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "An error occurred while fetching tickets." });
  }
};


const getTotalTickets = async (req, res) => {
  try {
      const totalTicketsCount = await newTickets.count({
          where: {
              status: {
                  [Sequelize.Op.ne]: 'refund' // Exclude 'refund' status
              }
          }
      });

      res.json({ success: true, totalTickets: totalTicketsCount });
  } catch (error) {
      console.error("Error counting total tickets:", error);
      res.status(500).json({ error: "An error occurred while counting total tickets." });
  }
};




const randomizeWinners = async (req, res) => {
  try {
    const selected73Winners = await newTickets.findAll({
      attributes: ['ticketId', 'userId', 'purchaseDate', 'prize', 'paid'],
      order: Sequelize.literal("RAND()"), // Use RAND() for MySQL
      limit: 73,
    });

    const winnerUserIds = selected73Winners.map(winner => winner.userId);
    const winnerUsers = await users.findAll({
      where: {
        userId: { [Op.in]: winnerUserIds },
      },
      attributes: ['userId', 'userName', 'picturePath', 'randomizedProfilePicture'],
    });

    // Combine user information with the winners
    selected73Winners.forEach(winner => {
      const user = winnerUsers.find(user => user.userId === winner.userId);
      if (user) {
        winner.dataValues.userName = user.userName;
        winner.dataValues.picturePath = user.picturePath;
        winner.dataValues.randomizedProfilePicture = user.randomizedProfilePicture;
      }
    });

    // Step 3: Split the selected 70 rows into top4Winners, top5Winners, and top6Winners
    const top3Winners = selected73Winners.slice(0, 3)
    const top4Winners = selected73Winners.slice(3, 13);
    const top5Winners = selected73Winners.slice(13, 23);
    const top6Winners = selected73Winners.slice(23);

    // Step 4: Send the variables to the frontend
    res.json({
      top3Winners,
      top4Winners,
      top5Winners,
      top6Winners,
    });
  } catch (error) {
    console.error("Error randomizing winners:", error);
    res.status(500).json({ error: "An error occurred while randomizing winners." });
  }
};

const postWinners = async (req, res) => {
  
  const transaction = await sequelize.transaction();
  try {
    const { top3Winners, top4Winners, top5Winners, top6Winners, round, prizeAmount } = req.body;

    // Update the prize column for top3Winners
    for (let i = 0; i < top3Winners.length; i++) {
      const ticketId = top3Winners[i].ticketId;
      const prize = i + 1; // Update prize based on position (1, 2, 3)

      // Use the update method to update the prize for the specific ticketId
      await newTickets.update(
        { prize },
        { where: { ticketId } }
      );
    }
    for (let i = 0; i < top4Winners.length; i++) {
      const ticketId = top4Winners[i].ticketId;
      const prize = 4; // Update prize based on position (1, 2, 3)

      // Use the update method to update the prize for the specific ticketId
      await newTickets.update(
        { prize },
        { where: { ticketId } }
      );
    }
    for (let i = 0; i < top5Winners.length; i++) {
      const ticketId = top5Winners[i].ticketId;
      const prize = 5; // Update prize based on position (1, 2, 3)

      // Use the update method to update the prize for the specific ticketId
      await newTickets.update(
        { prize },
        { where: { ticketId } }
      );
    }
    for (let i = 0; i < top6Winners.length; i++) {
      const ticketId = top6Winners[i].ticketId;
      const prize = 6; // Update prize based on position (1, 2, 3)
      // Use the update method to update the prize for the specific ticketId
      await newTickets.update(
        { prize },
        { where: { ticketId } }
      );
    }
    await sequelize.transaction(async (transaction) => {
      const moveQuery = `
        INSERT INTO oldTickets (ticketId, userId, purchaseDate, prize, paid, status, round)
        SELECT ticketId, userId, purchaseDate, prize, paid, status, round
        FROM newTickets;
      `;
      await sequelize.query(moveQuery, { type: QueryTypes.INSERT, transaction });

      // Empty the newTickets table
      await newTickets.destroy({ truncate: true, transaction });

      await roundsAndPrizes.create({round: round, prize: prizeAmount});
      
      res.json({ success: true, message: "Winners updated successfully." });
    });
  } catch (error) {
    console.error("Error updating winners: ", error);
    await transaction.rollback();
    res.status(500).json({ error: "An error occurred while updating winners." });
  }
};

const check50RandomTickets = async (req, res) => {
  const { ticketId } = req.body;
  let ticketArray = [];
  let attempts = 0;
  while (ticketArray.length < 50 && attempts < 1000) {
    let randomTicket = generateRandomTickets(ticketId);

    const count1 = await newTickets.count({
      where: { ticketId: randomTicket }
    });
    const isFound = ticketArray.includes(randomTicket);
    if (count1 === 0 && !isFound) {
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

    const count1 = await newTickets.count({
      where: { ticketId: randomTicket }
    });
    const isFound = ticketArray.includes(randomTicket);
    if (count1 === 0 && !isFound) {
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

    if (foundInNewTickets.length === 0) {
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

    if (foundInNewTickets.length === 0) {
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
    const newTicketsResult = await newTickets.findAll({
      where: { ticketId: { [Op.in]: allTickets } },
      attributes: ['ticketId'], // Include only the ticketId column in the result
    });

    const foundTicketIds = [
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

const checkOneTicket = async (req, res) => {
  const { ticketId } = req.params;

  const count1 = await newTickets.count({
    where: { ticketId }
  });
  if (count1 > 0){
      res.json({ isExist: true });
  }else{
      res.json({ isExist: false });
  }
};

module.exports = { checkOneTicket, checkAllTickets, check100Tickets, check1000Tickets, check200RandomTickets, check50RandomTickets, getAllTickets, getTicketsByUserIdSearch, updateTicket, postNewTickets, postAllTickets, getTicketsByUserId, getOrder, randomizeWinners, postWinners, getTotalTickets };