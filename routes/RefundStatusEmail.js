const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const Content = require("../utils/constants");
require('dotenv').config();

function sendEmail({ recipient_email, status, orderId }) {
    return new Promise((resolve, reject) => {
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MY_EMAIL,
          pass: process.env.MY_PASSWORD,
        },
      });

      let messageContent = `
      <p>Your refund money is sent to your wallet successfully.</p>
    `;

    if (status === "reject") {
      messageContent = `
        <p>We were unable to send your refund money since your wallet address is invalid.</p>
      `;
    }
      const mail_configs = {
        from: process.env.CUSTOMER_SERVICE_EMAIL,
        to: recipient_email,
        subject: `${Content.headerTitle} refund status`,
        html: `<!DOCTYPE html>
  <html lang="en" >
  <head>
    <meta charset="UTF-8">
    <title>${Content.headerTitle}</title>
  </head>
  <body>
  <!-- partial:index.partial.html -->
  <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">${Content.headerTitle} - Your Refund Status</a>
      </div>
      <p style="font-size:1.1em">Dear valuable customer,</p>
      ${messageContent}
      <p>This is an auto generated email. Please do not reply to this email.</p>
      <p>If you have any question, please contact to our customer service at ${process.env.CUSTOMER_SERVICE_EMAIL}</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">Order ID: ${orderId}</h2>
      <p style="font-size:0.9em;">Regards,<br />${Content.headerTitle}</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
        <p>${Content.headerTitle}</p>
      </div>
    </div>
  </div>
  <!-- partial -->
  </body>
  </html>`,
      };
      transporter.sendMail(mail_configs, function (error, info) {
        if (error) {
          console.log(error);
          return reject({ message: `An error has occured` });
        }
        return resolve({ message: "Email sent succesfuly" });
      });
    });
  }

  router.post("/", (req, res) => {
    sendEmail(req.body)
      .then((response) => res.send(response.message))
      .catch((error) => res.status(500).send(error.message));
  });

  module.exports = router;