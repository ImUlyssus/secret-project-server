
const { roundsAndPrizes, oldTickets, newTickets } = require("../models");
const { Op, Sequelize } = require("sequelize");
require('dotenv').config();
const getAllNewTickets = async (req, res) => {
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
  }
  const getRound= async (req, res) => {
    try {
        const highestRound = await oldTickets.max('round');
        let round=0;
        if (highestRound !== null) {
            round = highestRound;
        }
        res.json(round);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching round." });
    }
  }
  const totalPrizeForOneRound = async (req, res) => {
    const round = req.params.round;
    try {
      if(round){
        const totalTicketsCount = await oldTickets.count({
          where: {round}
      });
        res.json({totalTicketsCount});
      }else{
        res.json({message:"No winner yet!"});
      }
    } catch (error) {
      console.error("Error counting total tickets:", error);
      res.status(500).json({ success:false, error: "An error occurred while counting total tickets." });
    }
  }
  const getTopWinners = async (req, res) => {
    const round = req.params.round;
  
    try {
      const tickets = await oldTickets.findAll({
        where: {
          prize: {
            [Op.or]: [1, 2, 3] // Use Op.or to specify multiple values
          },
          round: round // Filtering based on the specific round
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
  
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets: ", error);
      res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
  }
  
  const getAllWinners = async (req, res) => {
    const round = req.params.round;
    const currentDate = new Date();
  
    // Calculate one year before the current date
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
  
    try {
      const fetchedNewTickets = await oldTickets.findAll({
        where: {
          prize: {
            [Op.or]: [1, 2, 3, 4, 5, 6]
          },
          round,
          purchaseDate: {
            [Op.between]: [oneYearAgo, currentDate]
          }
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
  
      const fetchedOldTicketsWOPrizeAmount = await oldTickets.findAll({
        where: {
          prize: {
            [Op.or]: [1, 2, 3, 4, 5, 6]
          },
          round: { [Op.ne]: round }, // round is not equal to the requested round
          purchaseDate: {
            [Op.between]: [oneYearAgo, currentDate]
          }
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
      const calculatePrizeAmount = async (prize, round) => {
        const roundPrize = await roundsAndPrizes.findOne({where: {round}});
        if (prize === 1) {
            return roundPrize.prize * 2 * 0.6 * 0.15;
        } else if (prize === 2) {
            return roundPrize.prize * 2 * 0.6 * 0.1;
        }else if(prize === 3){
          return roundPrize.prize * 2 * 0.6 * 0.05;
        }else if(prize === 4){
          return roundPrize.prize * 2 * 0.6 * 0.01;
        }else if(prize === 5){
          return roundPrize.prize * 2 * 0.6 * 0.005;
        }else if(prize === 6){
          return roundPrize.prize * 2 * 0.6 * 0.003;
        }
        return 0;
    };
  
    const fetchedOldTickets = await Promise.all(
      fetchedOldTicketsWOPrizeAmount.map(async (ticket) => {
        const prizeAmount = await calculatePrizeAmount(ticket.prize, ticket.round);
        return {
          ...ticket.toJSON(),
          prizeAmount
        };
      })
    );
  
      res.json({ fetchedNewTickets, fetchedOldTickets });
    } catch (error) {
      console.error("Error fetching tickets: ", error);
      res.status(500).json({ error: "An error occurred while fetching tickets." });
    }
  }
  const get4thWinners = async (req, res) => {
    const round = req.params.round;
      const tickets = await oldTickets.findAll({
        where: {
          prize: 4,
          round
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
  
      res.json(tickets);
    }
  const get5thWinners = async (req, res) => {
    const round = req.params.round;
      const tickets = await oldTickets.findAll({
        where: {
          prize: 5,
          round
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
  
      res.json(tickets);
    }
  const get6thWinners = async (req, res) => {
    const round = req.params.round;
      const tickets = await oldTickets.findAll({
        where: {
          prize: 6,
          round
        },
        attributes: {
          exclude: ['userUserId']
        }
      });
  
      res.json(tickets);
    }

    module.exports = {getAllNewTickets, getRound, totalPrizeForOneRound, getTopWinners, getAllWinners, get4thWinners, get5thWinners, get6thWinners }