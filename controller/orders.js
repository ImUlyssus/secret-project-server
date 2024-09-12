const { tempTickets, newTickets, orders } = require("../models");
const { Op } = require("sequelize");
require('dotenv').config();

const newOrder = async (req, res) => {
    const { userId, purchaseDate, totalTickets } = req.body;

    try {
        // Create a new order in the 'orders' table
        const newOrder = await orders.create({
            userId: userId,
            purchaseDate: purchaseDate,
            totalTickets: totalTickets
        });

        // Do other operations if needed, such as processing tickets or other related data

        // Send a success response
        res.status(201).json({ success: true, order: newOrder });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "An error occurred while creating the order." });
    }
}

const getOrderByUserId = async (req, res) => {
    const userId = req.params.userId;
    try {
        const fetchedOrders = await orders.findAll({
            where: {
                userId: userId
            }
        });
        if (!fetchedOrders) {
          return res.status(404).json({ error: "Order does not exist" });
        }
        res.json(fetchedOrders);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching orders." });
      }
  }

  const userOrder = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Fetch the user profile
        const order = await orders.findAll({
            where: {
                userId: userId
            }
        });
        if (!order) {
          return res.status(404).json({ error: "Order does not exist" });
        }
        res.json(order);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching the order" });
      }
}

const checkRefund = async (req, res) => {
    const orderId = req.params.orderId;

    try {
        // Split the orderId string to extract userId and purchaseDate
        const [userId, purchaseDateStr] = orderId.split('|');
        
        // Convert purchaseDateStr to a Date object
        const purchaseDate = new Date(purchaseDateStr);

        // Check if the order exists
        const order = await orders.findOne({
            where: {
                userId: userId,
                purchaseDate: purchaseDate
            }
        });
        const newTicket = await newTickets.findOne({
            where: {
                userId: userId,
                purchaseDate: purchaseDate
            },
            attributes: {
                exclude: ['userUserId']
              }
        });

        if (!order || !newTicket) {
            return res.status(404).json({ error: "Order does not exist" });
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while checking refund validity" });
    }
}

module.exports = {newOrder, getOrderByUserId, userOrder, checkRefund }