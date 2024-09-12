const express = require('express');
const router = express.Router();
const { users } = require('../models');

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;

    const count = await users.count({
      where: { email }
    });

    const emailExists = count > 0;
    res.json({ emailExists });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = router;
