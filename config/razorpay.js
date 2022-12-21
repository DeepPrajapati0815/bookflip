const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  // Replace with your key_id
  key_id: process.env.PAY_KEY,

  // Replace with your key_secret
  key_secret: process.env.PAY_SECRET,
});

module.exports = razorpayInstance;
