const jwt = require("jsonwebtoken");
require("dotenv").config();
const { checkUser } = require("../models/userModel");

const verifyAuthentication = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log(err);
        res.redirect("/login");
      } else {
        // console.log(decoded);
        next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

const verifyUser = (req, res, next) => {
  const token = req.cookies.jwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        // console.log(decoded);
        const user = await checkUser(decoded.email);
        req.user = user[0];
        res.locals.user = user[0];
        next();
      }
    });
  } else {
    res.locals.user = null;
  }
};

const authenticateAdmin = (req, res, next) => {
  const token = req.cookies.adminjwt;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.log(err);
        res.redirect("/admin");
      } else {
        console.log(decoded);
        next();
      }
    });
  } else {
    res.redirect("/admin");
  }
};

module.exports = { verifyAuthentication, verifyUser, authenticateAdmin };
