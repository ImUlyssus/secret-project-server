
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { users, newTickets, roundsAndPrizes } = require("../models");
require('dotenv').config();

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const userId = cookies.userId;
    res.clearCookie('jwt', { httpOnly: true, sameSite: "Strict", secure: true });
    res.clearCookie('userId', { httpOnly: true, sameSite: "Strict", secure: true });
    let user = await users.findOne({ where: { userId: userId } });
    let refreshTokens = [];
    if (user.refreshToken != null) {
        refreshTokens = user.refreshToken.split(" ");
    } else {
        return res.sendStatus(401);
    }
    // Check if the refresh token got from the cookie is included in the user's refreshTokens array.
    const result = refreshTokens.includes(refreshToken);

    if (!result) {
        // return res.sendStatus(403);
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                user.refreshToken = '';
                await user.save();
            }
        )
    }
    // if result is true, remove the refresh token and assign to user.refreshToken
    refreshTokens.splice(refreshTokens.indexOf(refreshToken), 1);
    if (refreshTokens.length > 15) {
        refreshTokens = refreshTokens.splice(0, 5);
    }
    const newRefreshTokenArray = refreshTokens.join(" ");

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                // found the refresh token but it expired. So update the refresh token array by removing the expired one
                user.refreshToken = newRefreshTokenArray;
                await user.save();
            }
            if (err || user.userId !== decoded.userId) return res.sendStatus(403);

            // refresh token is still valid
            const userRole = user.userRole;
            const accessToken = jwt.sign(
                { "userInfo": { "userId": decoded.userId, "userRole": userRole } },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign({ "userId": user.userId }, process.env.REFRESH_TOKEN_SECRET, {
                expiresIn: "1d" // 1 day
            });
            // Fetch new and old tickets for the user and convert to plain objects
            const userNewTickets = await newTickets.findAll({ where: { userId: user.userId } });
            const plainNewTickets = userNewTickets.map(ticket => ticket.get({ plain: true }));
            const highestRound = await roundsAndPrizes.max('round');
            let round = 0;
            if (highestRound !== null) {
                round = highestRound;
            }
            // Update the user object with the refreshToken
            user.refreshToken = newRefreshTokenArray + " " + newRefreshToken;
            await user.save();
            res.cookie("userId", user.userId, { httpOnly: true, sameSite: "Strict", secure: true, maxAge: 24 * 60 * 60 * 1000 });
            res.cookie("jwt", newRefreshToken, { httpOnly: true, sameSite: "Strict", secure: true, maxAge: 24 * 60 * 60 * 1000 });
            res.json({ user, accessToken, newTickets: plainNewTickets, roundNumber: round })
        }
    );
}

module.exports = { handleRefreshToken }
// const userId = cookies.userId;