const nodemailer = require("nodemailer");
require("dotenv").config();

let transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  service: "gmail", // true for 465, false for other ports
  auth: {
    user: process.env.USER_MAIL, // generated ethereal user
    pass: process.env.MAIL_PASS, // generated ethereal password
  },
});

module.exports = transporter;
