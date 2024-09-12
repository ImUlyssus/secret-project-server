// controllers/notificationController.js
const { notifications, users, newTickets } = require("../models");

exports.getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {
    const user = await users.findOne({
      where: {
        userId: userId
      }
    });
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
    if (user.notifications.length === 0) return res.json([]);

    const notificationIds = user.notifications.split(' ').map(id => parseInt(id.slice(1)));
    const userNotifications = await notifications.findAll({
      where: {
        id: notificationIds
      }
    });

    res.json(userNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching user data" });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const allNotifications = await notifications.findAll();

    res.json(allNotifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching notifications" });
  }
};

exports.postNotification = async (req, res) => {
  const notificationMessage = req.body.message;

  try {
    const allNotificationIds = await notifications.findAll({
      attributes: ['id']
    });
    const notificationIds = allNotificationIds.map(notification => notification.id);

    const savedMembers = [];
    let nextNotificationId = 0;
    if (notifications.length == 50) {
      if(notificationIds[notificationIds.length-1] === 49 && notificationIds[3] === 3 ){
      await notifications.update(
        {
          id: 50,
          text: notificationMessage,
          date: new Date(),
        },
        {
          where: {
            id: 3,
          },
        }
      );
      }else if(notificationIds[notificationIds.length-1] === 98 && notificationIds[3] === 50 ){
        await notifications.update(
          {
            id: 3,
            text: notificationMessage,
            date: new Date(),
          },
          {
            where: {
              id: 50,
            },
          }
        );
      }else{
        for (let i = 1; i < notificationIds.length - 1; i++) {
          const currentId = notificationIds[i];
          const nextId = notificationIds[i + 1];
  
          let difference = 1;
          if (nextId > currentId) {
            difference = nextId - currentId;
            if (difference > 1) {
              savedMembers.push(currentId);
              savedMembers.push(nextId);
            }
          } else {
            difference = currentId - nextId;
            if (difference > 1) {
              savedMembers.push(nextId);
              savedMembers.push(currentId);
            }
          }
        }
        nextNotificationId = savedMembers[1] + 1;
        await notifications.update(
          {
            id: nextNotificationId,
            text: notificationMessage,
            date: new Date(),
          },
          {
            where: {
              id: savedMembers[0],
            },
          }
        );
      }
    } else {
      nextNotificationId = notificationIds[notificationIds.length - 1] + 1;
      await notifications.create({
        id: nextNotificationId,
        text: notificationMessage,
        date: new Date(),
      });
    }

    res.json({ success: true, message: "Notification posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "An error occurred while posting the notification" });
  }
};

exports.getUserNotification = async (req, res) => {
  try {
    const userWithPrize0 = await newTickets.findOne({
      where: {
        prize: 0
      },
      attributes: ['userId']
    });

    const userWithPrize1 = await newTickets.findOne({
      where: {
        prize: 1
      },
      attributes: ['userId']
    });

    if (userWithPrize0 && userWithPrize1) {
      const userIdPrize0 = userWithPrize0.userId;
      const userIdPrize1 = userWithPrize1.userId;

      const notificationPrize0 = await users.findOne({
        where: {
          userId: userIdPrize0
        },
        attributes: ['userId', 'notifications']
      });

      const notificationPrize1 = await users.findOne({
        where: {
          userId: userIdPrize1
        },
        attributes: ['userId', 'notifications']
      });

      const allNotifications = [
        notificationPrize0.notifications,
        notificationPrize1.notifications
      ];
      res.json(allNotifications);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching notifications" });
  }
};
