// controllers/refundController.js
const { users, orders, refunds, notifications, newTickets } = require("../models");
const { Op } = require('sequelize');

exports.getAllRefunds = async (req, res) => {
  try {
    const allRefunds = await refunds.findAll();

    const refinedRefunds = [];

    for (const refund of allRefunds) {
      const userId = refund.orderId.split('|')[0];
      const purchaseDate = refund.orderId.split('|')[1];

      const user = await users.findOne({ where: { userId: userId } });
      const order = await orders.findOne({ where: { userId, purchaseDate } });

      let walletAddress = null;
      let network = null;
      let amount = null;

      if (user && user.walletAddress) {
        walletAddress = user.walletAddress;
      } else if (user && user.network) {
        network = user.network;
      }
      if (order) {
        amount = order.totalTickets * 2;
      }

      refinedRefunds.push({
        id: refund.id,
        orderId: refund.orderId,
        requestDate: refund.requestDate,
        paid: refund.paid,
        status: refund.status,
        walletAddress: walletAddress,
        network: network,
        amount: amount,
      });
    }
    res.json(refinedRefunds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred while fetching refunds" });
  }
};

exports.newRefund = async (req, res) => {
  const { orderId, requestDate, userId, purchaseDate } = req.body;

  try {
    const existingRefund = await refunds.findOne({
      where: {
        orderId: orderId
      }
    });

    if (existingRefund) {
      return res.status(400).json({ success: false, error: "Refund already exists for this order." });
    }

    const newRefund = await refunds.create({
      orderId: orderId,
      requestDate: requestDate,
      paid: false,
      status: "Normal"
    });

    const updateTickets = await newTickets.findAll({
      where: {
        userId: userId,
        purchaseDate: purchaseDate
      },
      attributes: {
        exclude: ['userUserId']
      }
    });

    await Promise.all(updateTickets.map(async (ticket) => {
      await ticket.update({ status: 'refund' });
    }));

    res.status(201).json({ success: true, refund: newRefund });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred while creating the refund." });
  }
};

exports.getOrderById = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userOrders = await orders.findAll({
      where: {
        userId: userId
      }
    });

    if (!userOrders) {
      return res.status(404).json({ error: "Order does not exist" });
    }

    res.json(userOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching orders." });
  }
};

exports.getRefundByUserId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userRefunds = await refunds.findAll({
      where: {
        orderId: {
          [Op.like]: `${userId}|%`
        }
      }
    });

    if (!userRefunds || userRefunds.length === 0) {
      return res.status(404).json({ error: "Refunds do not exist for this user" });
    }

    res.json(userRefunds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the user refunds" });
  }
};

exports.checkRefund = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const [userId, purchaseDateStr] = orderId.split('|');
    const purchaseDate = new Date(purchaseDateStr);

    const order = await orders.findOne({
      where: {
        userId: userId,
        purchaseDate: purchaseDate
      }
    });

    if (!order) {
      return res.status(404).json({ error: "Order does not exist" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while checking refund validity" });
  }
};

exports.updateRefund = async (req, res) => {
  const { paid, status, orderId } = req.body;

  try {
    const refund = await refunds.findOne({
      where: {
        orderId: orderId
      }
    });

    if (refund) {
      await refunds.update(
        {
          paid: paid,
          status: status
        },
        {
          where: {
            orderId: orderId
          }
        }
      );

      const [userId, purchaseDate] = orderId.split('|');

      if (paid && userId && purchaseDate) {
        await orders.destroy({
          where: {
            userId: userId,
            purchaseDate: purchaseDate
          }
        });
        await newTickets.destroy({
          where: {
            userId: userId,
            purchaseDate: purchaseDate
          }
        });
      }

      const user = await users.findOne({ where: { userId: userId } });

      if (user) {
        user.notifications = processNotifications(user.notifications, paid ? 2 : 1);
        await user.save();
      }

      res.status(201).json({ success: true, message: 'Refund updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Refund not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'An error occurred while updating the refund.' });
  }
};

function processNotifications(notifications, newNotification) {
  if (typeof notifications !== 'string') {
    notifications = '';
  }

  if (newNotification < 10) {
    newNotification = `00${newNotification}`;
  } else if (newNotification < 100) {
    newNotification = `0${newNotification}`;
  }
  const lastTwoNewNotification = newNotification.slice(-2);
  const notificationChunks = notifications.split(' ');
  for (let i = 0; i < notificationChunks.length; i++) {
    const lastTwoCurrentNotification = notificationChunks[i].slice(-2);
    if (lastTwoCurrentNotification === lastTwoNewNotification) {
      notificationChunks.splice(i, 1);
      break;
    }
  }
  notifications = `${newNotification} ${notificationChunks.join(' ')}`;

  return notifications;
}
