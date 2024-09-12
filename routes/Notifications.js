// routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notifications");

router.get('/byId/:userId', notificationController.getUserById);
router.get('/getallnotifications', notificationController.getAllNotifications);
router.post('/postNotification', notificationController.postNotification);
router.get('/getusernotification', notificationController.getUserNotification);

module.exports = router;

