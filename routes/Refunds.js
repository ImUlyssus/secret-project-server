// routes/refundRoutes.js
const express = require("express");
const router = express.Router();
const refundController = require("../controller/refunds");

router.get('/getallrefunds', refundController.getAllRefunds);
router.post('/newrefund', refundController.newRefund);
router.get('/byId/:userId', refundController.getOrderById);
router.get('/byIdSearch/:userId', refundController.getRefundByUserId);
router.get('/checkrefund/:orderId', refundController.checkRefund);
router.post('/updaterefund', refundController.updateRefund);

module.exports = router;
