
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const sequel = require('./models');
const verifyJWT = require("./middlewares/verifyJWT");
const path = require('path');
const env = 'test';
const config = require(__dirname + '/config/config.js')[env];

require('dotenv').config({ path: "./config.env" });

// for production
// const PORT = process.env.PORT || 3001;
// const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const PORT = 3001;
const CLIENT_URL = config.client_url;
app.use(cors({
  origin: CLIENT_URL,
  methods: ["POST", "GET", "DELETE"],
  credentials: true,
}));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
// Routers
const checkEmailRouter = require('./routes/CheckEmail');
app.use('/checkemail', checkEmailRouter);

const authRouter = require('./routes/Auth');
app.use('/auth', authRouter);

const userRouter = require('./routes/Users');
app.use('/users', userRouter);

const winningTicketRouter = require('./routes/WinningTickets');
app.use('/winningtickets', winningTicketRouter);

const emailVerificationNMRouter = require('./routes/SendVerificationEmail');
app.use('/send_recovery_email_not_secure', emailVerificationNMRouter);

const contactUsRouter = require('./routes/ContactUs');
app.use('/contactus', contactUsRouter);

app.use('/refresh', require('./routes/RefreshToken'));

app.use(verifyJWT);

const emailVerificationRouter = require('./routes/ChangeEmailEmail');
app.use('/send_recovery_email', emailVerificationRouter);

const changePasswordEmailRouter = require('./routes/ChangePasswordEmail');
app.use('/send_change_password_email', changePasswordEmailRouter);

const rewardStatusEmailRouter = require('./routes/RewardStatusEmail');
app.use('/send_reward_status_email', rewardStatusEmailRouter);

const refundStatusEmailRouter = require('./routes/RefundStatusEmail');
app.use('/send_refund_status_email', refundStatusEmailRouter);

const contactUsEmailRouter = require('./routes/ContactUsEmail');
app.use('/send_contactus_email', contactUsEmailRouter);

const newTicketRouter = require('./routes/NewTickets');
app.use('/newtickets', newTicketRouter);

const oldTicketRouter = require('./routes/OldTickets');
app.use('/oldtickets', oldTicketRouter);

const tempTicketRouter = require('./routes/TempTickets');
app.use('/temptickets', tempTicketRouter);

const refundRouter = require('./routes/Refunds');
app.use('/refunds', refundRouter);

const orderRouter = require('./routes/Orders');
app.use('/orders', orderRouter);

const roundsAndPrizesRouter = require('./routes/RoundsAndPrizes');
app.use('/roundsandprizes', roundsAndPrizesRouter);

const notificationRouter = require('./routes/Notifications');
app.use('/notifications', notificationRouter);

const userNewTicketRouter = require('./routes/UserNewTickets');
app.use('/usernewtickets', userNewTicketRouter);

const userOldTicketRouter = require('./routes/UserOldTickets');
app.use('/useroldtickets', userOldTicketRouter);

const check1000TicketRouter = require('./routes/Check1000Tickets');
app.use('/check1000tickets', check1000TicketRouter);

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

sequel.sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Running at ${PORT}`);
  });
});


