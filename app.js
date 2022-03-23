const express = require("express");
const cors = require("cors");
const mongo = require("./config/db");
require("dotenv").config();
const userRoutes = require("./route/user");
const authRoutes = require("./route/auth");
const passwordResetRoutes = require("./route/passwordReset");

const { BASE_URL, DB_URL } = process.env;
const app = express();
let PORT = process.env.PORT || 3005;

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("api/password-reset", passwordResetRoutes);

app.listen(PORT, async () => {
  await mongo(DB_URL);
  console.log(`running on Port  ${BASE_URL}:${PORT}`);
});
