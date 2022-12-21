const express = require("express"); //server side scripting
const app = express();
const path = require("path");
const adminRoute = require("./routes/adminRoutes");
const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");
const connection = require("./models/db");
const cors = require("cors");

connection;

const {
  verifyAuthentication,
  verifyUser,
} = require("./middlewares/authMiddleware");

const cookies = require("cookie-parser");

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(cookies());
app.set("view engine", "ejs");

app.use(authRoute);
app.use(adminRoute);
app.use(verifyAuthentication, verifyUser, userRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("server started...");
});
