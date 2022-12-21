const express = require("express");
const {
  addUser,
  checkUser,
  addToken,
  updatePassword,
  checkToken,
} = require("../models/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();

const transporter = require("../config/smtp");
const bcrypt = require("bcrypt");

const { checkAdmin, addAdmin } = require("../models/adminModel");

router.get("/login", async (req, res) => {
  res.render("user/loginAndReg", { color: "", msg: "", clr: "", regmsg: "" });
});

router.post("/login", async (req, res) => {
  const email = req.body.email;
  const pwd = req.body.password;
  try {
    const user = await checkUser(email);

    if (user[0]?.email !== email)
      return res.render("user/loginAndReg", {
        msg: "user not registered!",
        color: "danger",
        regmsg: "",
        clr: "",
      });

    const match = await bcrypt.compare(pwd, user[0]?.password);

    if (match) {
      const token = jwt.sign(
        {
          user_id: user[0].user_id.toString(),
          email: user[0].email.toString().trim(),
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      res.cookie("jwt", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });
      return res.redirect("/");
    } else {
      res.render("user/loginAndReg", {
        msg: "email or Password is incorrect",
        color: "danger",
        regmsg: "",
        clr: "",
      });
    }
  } catch (error) {
    console.log(error);
    res.render("user/loginAndReg", {
      msg: "internal server error!",
      color: "danger",
      regmsg: "",
      clr: "",
    });
  }
});

router.post("/register", async (req, res) => {
  const fname = req.body.fname;
  const lname = req.body.lname;
  const email = req.body.email;
  const mobile = req.body.phone;
  const address = req.body.address;
  const pwd = req.body.password;
  const cpwd = req.body.confirmpassword;

  const user = await checkUser(email);

  if (!pwd || pwd.length < 8) {
    return res.render("user/loginAndReg", {
      regmsg: "password must be more than length of 8",
      clr: "danger",
      msg: "",
      color: "",
    });
  }

  if (user[0]?.email === email) {
    return res.render("user/loginAndReg", {
      regmsg: "user already registered",
      clr: "danger",
      msg: "",
      color: "",
    });
  }

  if (pwd !== cpwd)
    return res.render("user/loginAndReg", {
      regmsg: "password doesn't match",
      msg: "",
      clr: "danger",
      color: "",
    });

  const hashdpwd = await bcrypt.hash(pwd, 10);

  addUser(fname, lname, email, mobile, address, hashdpwd);
  res.render("user/loginAndReg", {
    regmsg: `${fname + lname} registered successfully`,
    clr: "success",
    msg: "",
    color: "",
  });
});

router.post("/logout", (req, res) => {
  res.redirect("/login");
});

router.post("/adminlogin", async (req, res) => {
  const email = req.body.email;
  const pwd = req.body.password;
  try {
    const admin = await checkAdmin(email);

    if (admin[0]?.email !== email) {
      res.render("admin/adminlogin", {
        msg: "admin not registered!",
        color: "danger",
      });
    }

    const match = await bcrypt.compare(pwd, admin[0]?.password);

    if (!match) {
      res.render("admin/adminlogin", {
        msg: "incorrect password!",
        color: "danger",
      });
    }

    if (match) {
      const token = jwt.sign(
        {
          id: admin[0].id.trim(),
        },
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );
      res.cookie("adminjwt", token, {
        httpOnly: true,
        maxAge: 2 * 60 * 60 * 1000,
      });

      res.redirect("/adminhome");
    }
  } catch (error) {
    console.log(error);
    res.render("admin/adminlogin", {
      msg: "internal server error!",
      color: "danger",
    });
  }
});

router.get("/adminregister", (req, res) => {
  res.render("admin/adminreg", { color: "", msg: "" });
});

router.post("/adminregister", async (req, res) => {
  const email = req.body.email;
  const pwd = req.body.password;
  const cpwd = req.body.confirmpassword;

  const admin = await checkAdmin(email);

  if (!pwd || pwd.length < 8) {
    return res.render("user/loginAndReg", {
      msg: "password must be more than length of 8",
      color: "danger",
    });
  }

  if (admin[0]?.email === email) {
    return res.render("admin/adminreg", {
      msg: "admin already exist!",
      color: "danger",
    });
  }

  if (pwd !== cpwd)
    return res.render("user/loginAndReg", {
      regmsg: "password doesn't match",
      msg: "",
      color: "danger",
    });

  const hashdpwd = await bcrypt.hash(pwd, 10);

  addAdmin(email, hashdpwd);
  res.redirect("/admin");
});

router.get("/forgot-password", (req, res) => {
  res.render("user/forgot", { msg: "", color: "" });
});

router.post("/forgot-password", async (req, res) => {
  const email = req.body.email;

  try {
    const user = await checkUser(email);

    if (!user) {
      res.render("user/forgot", {
        msg: "user not registered",
        color: "danger",
      });
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: 60 * 60 * 5,
    });

    const url = `http://localhost:${process.env.PORT}/update-password?token=${token}`;

    try {
      let info = await transporter.sendMail({
        from: process.env.USER_MAIL, // sender address
        to: email, // list of receivers
        subject: "request for forgot password", // Subject line
        html: `<p>request for forgot password click this   <a href="${url}">link </a>for reset your password</p>`, // html body
      });

      addToken(token, email);
      // console.log(info);
      res.render("user/forgot", {
        msg: "The reset password link has been sent to your email address",
        color: "success",
      });
    } catch (error) {
      res.render("user/forgot", {
        msg: "something went wrong please try again.",
        color: "danger",
      });
    }
  } catch (error) {
    res.render("user/forgot", {
      msg: "The  email is not registered with us.",
      color: "danger",
    });
  }
});

router.get("/update-password", async (req, res) => {
  const token = req.query.token;
  try {
    const user = await checkToken(token);
    if (!user) {
      res.redirect("/forgot-password");
    }
    res.render("user/updatePassword", { token: token, msg: "", color: "" });
  } catch (error) {}
});

router.post("/update-password", async function (req, res) {
  const password = req.body.newpassword;
  const newPwd = req.body.cpassword;
  const token = req.body.token;
  if (password !== newPwd) {
    res.render("user/updatePassword", {
      token,
      msg: "password and confirmpassword doesn't match",
      color: "danger",
    });
  }
  try {
    const user = await checkToken(token);
    if (!user) {
      res.render("user/forgot", {
        msg: "password cannot be updated!",
        color: "danger",
      });
    }

    const hashdpwd = await bcrypt.hash(password, 10);

    try {
      await updatePassword(user[0].email, hashdpwd);
      res.render("user/loginAndReg", {
        msg: "password updated successfully",
        color: "success",
        clr: "",
        regmsg: "",
      });
    } catch (error) {
      console.log(error);
      res.render("user/forgot", {
        msg: "password cannot be updated",
        color: "danger",
      });
    }
  } catch (error) {
    res.render("user/forgot", {
      msg: "password cannot be updated",
      color: "danger",
    });
  }
});

module.exports = router;
