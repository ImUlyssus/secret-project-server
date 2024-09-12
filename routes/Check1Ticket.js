const express = require('express');
const router = express.Router();
const { newTickets } = require('../models');

router.get('/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const count = await newTickets.count({
      where: { ticketId }
    });

    const ticketExists = count > 0;
    res.json({ ticketExists });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
