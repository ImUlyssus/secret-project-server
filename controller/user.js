const jwt = require("jsonwebtoken");
const { users, newTickets, roundsAndPrizes } = require("../models");
const bcrypt = require('bcrypt');
const { Op } = require("sequelize");
require('dotenv').config();
const getUserById = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch the user profile
    const user = await users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Return the user profile
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the user profile" });
  }
};

const getUserByIdSearch = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch the user profile with selected attributes
    const user = await users.findByPk(userId, {
      attributes: [
        'userName',
        'email',
        'network',
        'walletAddress',
        'isWalletReady',
        'isPrivate',
        'birthday',
        'facebook',
        'instagram',
        'twitter',
        'emailVerified',
        'notifications'
      ]
    });

    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Return the selected user profile attributes
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching the user profile" });
  }
};


const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  // const userExists = users.findOne({ where: { email: email } });
  const count = await users.count({
    where: { email }
  });

  const emailExists = count > 0;
  if (emailExists) {
    return res.status(409).json({ message: "Email already exists" });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const randomizedProfilePicture = getRandomNumber();

      const user = await users.create({
        userName,
        email,
        password: hashedPassword, // Store the hashed password in the database
        network: '',
        walletAddress: '',
        isWalletReady: false,
        isPrivate: false,
        picturePath: '',
        randomizedProfilePicture,
        birthday: '',
        userRole: 0,
        facebook: '',
        instagram: '',
        twitter: '',
        emailVerified: true,
        notifications: '000',
        refreshToken: '',
      });

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while creating the user" });
    }
  }
};



const loginUser = async (req, res) => {
  const cookies = req.cookies;
  const { email, password } = req.body;

  try {
    let user = await users.findOne({ where: { email: email } });

    if (!user) {
      return res.send({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid && user.emailVerified) {
      const accessToken = jwt.sign({ "userInfo": { "userId": user.userId, "userRole": user.userRole } }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
      });
      const newRefreshToken = jwt.sign({ "userId": user.userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1d"
      });

      let refreshTokens = [];
      if (user.refreshToken !== null) {
        refreshTokens = user.refreshToken.split(" ");
      }
      let newRefreshTokenArray =
        !cookies?.jwt
          ? refreshTokens
          : refreshTokens.splice(refreshTokens.indexOf(newRefreshToken), 1);

      if (cookies?.jwt) {
        const refreshToken = cookies.jwt;
        const foundToken = await users.findOne({ where: { refreshToken: refreshToken } });
        if (!foundToken) {
          console.log("Attempted RT reuse at login.")
          newRefreshTokenArray = [];
        }
        res.clearCookie('jwt', { httpOnly: true, sameSite: "None", secure: true });
      }

      if (newRefreshTokenArray.length > 10) {
        newRefreshTokenArray = newRefreshTokenArray.splice(0, 5);
      }
      user.refreshToken = newRefreshTokenArray.join(" ") + " " + newRefreshToken;
      await user.save();

      res.cookie("userId", user.userId, { httpOnly: true, sameSite: "Strict", secure: true, maxAge: 24 * 60 * 60 * 1000 });
      res.cookie("jwt", newRefreshToken, { httpOnly: true, sameSite: "Strict", secure: true, maxAge: 24 * 60 * 60 * 1000 });

      // Fetch new and old tickets for the user and convert to plain objects
      const userNewTickets = await newTickets.findAll({ where: { userId: user.userId } });
      // const userOldTickets = await oldTickets.findAll({ where: { userId: user.userId } });

      const plainNewTickets = userNewTickets.map(ticket => ticket.get({ plain: true }));
      // const plainOldTickets = userOldTickets.map(ticket => ticket.get({ plain: true }));
      const highestRound = await roundsAndPrizes.max('round');
        let round=0;
        if (highestRound !== null) {
            round = highestRound;
        }
      return res.json({
        success: true,
        accessToken: accessToken,
        result: user,
        newTickets: plainNewTickets,
        roundNumber: round,
        // oldTickets: plainOldTickets
      });
    } else {
      if (user.emailVerified) {
        return res.json({ success: false, message: "Wrong email or password." });
      } else {
        return res.json({ success: false, message: "Your email was not verified." });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "An error occurred while logging in" });
  }
};

const logoutUser = async (req, res) => {
  const cookies = req.cookies;
  const userId = req.cookies.userId;
  if (!cookies?.jwt) return res.sendStatus(204);
  const refreshToken = cookies.jwt;
  let user = await users.findOne({ where: { userId: userId } });
  let refreshTokenss = [];
  if (user.refreshToken !== null) {
    refreshTokenss = user.refreshToken.split(" ");
  } else {
    return res.sendStatus(401);
  }
  // Check if the refresh token got from the cookie is included in the user's refreshTokens array.
  const result = refreshTokenss.includes(refreshToken);

  if (!result) {
    res.clearCookie('jwt', { httpOnly: true, sameSite: "None", secure: true });
    return res.sendStatus(204);
  }

  let refreshTokens = [];
  if (user.refreshToken !== null) {
    refreshTokens = user.refreshToken.split(" ");
    refreshTokens.splice(refreshTokens.indexOf(refreshToken), 1);
    if (refreshTokens.length > 15) {
      refreshTokens = refreshTokens.splice(0, 5);
    }
    const newRefreshTokenArray = refreshTokens.join(" ");
    user.refreshToken = newRefreshTokenArray;
    await user.save();
  } else {
    res.sendStatus(403);
  }
  res.clearCookie('jwt', { httpOnly: true, sameSite: "None", secure: true });
  res.sendStatus(204);
}

function getRandomNumber() {
  return Math.floor(Math.random() * 16) + 1;
}
const updateUser = async (req, res) => {
  const { userId, userName, email, password, network, walletAddress, isWalletReady, isPrivate, picturePath, randomizedProfilePicture, birthday, facebook, instagram, twitter, notifications, emailVerified } = req.body;

  try {
    let user; // Declare the user variable before the if statement

    if (userId) {
      user = await users.findByPk(userId);
    } else if (email) {
      user = await users.findOne({ where: { email: email } });
    }


    if (!user) {
      return res.status(404).json({ error: "User does not exist" });
    }
    if (userName) {
      user.userName = userName;
    }
    if (email) {
      user.email = email;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    if (network) {
      user.network = network;
    }
    if (walletAddress) {
      user.walletAddress = walletAddress;
    }
    if (isWalletReady !== undefined) {
      user.isWalletReady = isWalletReady;
    }
    if (isPrivate !== undefined) {
      user.isPrivate = isPrivate;
    }
    if (picturePath) {
      user.picturePath = picturePath;
    }
    if (randomizedProfilePicture) {
      user.randomizedProfilePicture = randomizedProfilePicture;
    }
    if (birthday) {
      user.birthday = birthday;
    }
    if (facebook !== 'nothing') {
      user.facebook = facebook;
    } else {
      user.facebook = '';
    }
    if (instagram !== 'nothing') {
      user.instagram = instagram;
    } else {
      user.instagram = '';
    }
    if (twitter !== 'nothing') {
      user.twitter = twitter;
    } else {
      user.twitter = '';
    }

    if (notifications !== undefined) {
      user.notifications = notifications;
    }

    if (emailVerified) {
      user.emailVerified = emailVerified;
    }
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating user information." });
  }
};

const checkPassword = async (req, res) => {
  const { userId, password } = req.body;

  try {
    const user = await users.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    return res.json({ isPasswordValid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while checking the password" });
  }
};

const sendNotification = async (req, res) => {
  const { toWhom, notiId } = req.body;
  if (toWhom === "To all users") {
    try {
      // Fetch all users
      const allUsers = await users.findAll();
      // Update notifications for each user
      for (const user of allUsers) {
        user.notifications = processNotifications(user.notifications, notiId);
        await user.save();
      }
      res.json({ success: true, message: "Notifications sent to all users" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred while sending notifications to all users" });
    }
  } else {
    // Check the prize column in the newTickets table
    const usersWithNonZeroPrize = await newTickets.findAll({
      attributes: ["userId"], // Select only the userId column
      where: {
        prize: {
          [Op.ne]: 0, // Prize is not equal to 0
        },
      },
    });
    // const userIds = usersWithNonZeroPrize.map((user) => user.userId);

    if (usersWithNonZeroPrize) {
      try {
        // Fetch user IDs from newTickets where prize is not zero
        const winningTicketUsers = await newTickets.findAll({
          attributes: ["userId"],
          where: {
            prize: {
              [Op.ne]: 0,
            },
          },
        });

        // Extract user IDs
        const userIds = winningTicketUsers.map((ticket) => ticket.userId);
        // const uniqueUserIds = [...new Set(userIds)];
        // console.log(uniqueUserIds);
        // Send notifications to users with the specified user IDs
        for (const userId of userIds) {
          const user = await users.findByPk(userId);
          if (user) {
            user.notifications = processNotifications(user.notifications, notiId);
            await user.save();
          }
        }

        res.json({ success: true, message: "Notifications sent to specific users" });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while sending notifications to specific users" });
      }
    }
  }
}
// function processNotifications(notifications, newNotification) {
//   // Ensure notifications is a string
//   if (typeof notifications !== 'string') {
//     notifications = '';
//   }

//   // Add leading zeros to newNotification based on its length
//   if (newNotification < 10) {
//     newNotification = `00${newNotification}`;
//   } else if (newNotification < 100) {
//     newNotification = `0${newNotification}`;
//   }

//   // Check if the newNotification exists in the current notifications string
//   if (notifications.includes(newNotification)) {
//     // Move the newNotification to the front of the string
//     const notificationsArray = notifications.split(' ');
//     const index = notificationsArray.indexOf(newNotification);
//     if (index !== -1) {
//       notificationsArray.splice(index, 1);
//       notificationsArray.unshift(newNotification);
//       notifications = notificationsArray.join(' ');
//     }
//   } else {
//     // If newNotification doesn't exist, prepend it to the string
//     notifications = `${newNotification} ${notifications}`;
//   }

//   return notifications;
// }
function processNotifications(notifications, newNotification) {
  // Ensure notifications is a string
  if (typeof notifications !== 'string') {
    notifications = '';
  }

  // Add leading zeros to newNotification based on its length
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
      // Move the matched notification to the front of the string
      notificationChunks.splice(i, 1);
      break;
    }
  }
  notifications = `${newNotification} ${notificationChunks.join(' ')}`;

  return notifications;
}

module.exports = { getUserById, getUserByIdSearch, registerUser, loginUser, logoutUser, updateUser, checkPassword, sendNotification };

