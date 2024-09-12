const { roundsAndPrizes } = require("../models");
require('dotenv').config();

const getRound = async (req, res) => {
    try {
        const highestRound = await roundsAndPrizes.max('round');
        let round=0;
        if (highestRound !== null) {
            round = highestRound;
        }
        res.json(round);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while fetching round." });
    }
};

module.exports = {getRound}