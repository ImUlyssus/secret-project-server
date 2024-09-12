const { tempTickets, newTickets } = require("../models");
const { Op } = require("sequelize");
const {contactUs} = require("../models")
require('dotenv').config();

const postMessage = async (req, res) => {
    const { name, email, message } = req.body;
      try {
        const userQuery = await contactUs.create({
          userName: name,
          email,
          message,
          date: new Date(),
          isResponded: false
        });
        return res.json(userQuery);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while creating the user" });
      }
  };

  const getMessages = async (req, res) => {
      const messages = await contactUs.findAll();
      res.json({success:true, messages});
    };

    const updateMessage = async (req, res) => {
      const { id, isResponded } = req.body;
      try {
        const message = await contactUs.findOne({ where: { id },
          attributes: {
            exclude: ['userUserId']
          }});
        if (message) {
          message.isResponded = true;
          await message.save();
          return res.json({ success: true, message: "Message updated" });
        } else {
          return res.json({ success: false, message: "Message does not exist" });
        }
      } catch (error) {
        console.error("Error updating ticket:", error);
        res.status(500).json({ error: "An error occurred while updating message." });
      }
    };

module.exports = { postMessage, getMessages, updateMessage };