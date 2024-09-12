const express = require("express");
const router = express.Router();
const { newOrder, getOrderByUserId, userOrder, checkRefund } = require('../controller/orders.js');

router.post('/neworder', newOrder);

router.get('/byId/:userId', getOrderByUserId);

router.get('/byIdSearch/:userId', userOrder);

router.get('/checkrefund/:orderId', checkRefund);

module.exports = router;
