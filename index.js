require("dotenv").config();
const express = require("express");
const app = express();
const port = +process.env.PORT_KEY;
const userRoutes = require("./routes/users");
const translateRoute = require("./routes/translate.js");

app.use(express.json());

app.use("/user", userRoutes);

app.use("/translate", translateRoute);

app.listen(port, () => {
  console.log(port);
});
