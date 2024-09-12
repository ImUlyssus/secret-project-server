const express = require('express');
const router = express.Router();
const refreshToken = require('../controller/refreshToken');

router.get('/', refreshToken.handleRefreshToken);

module.exports = router;