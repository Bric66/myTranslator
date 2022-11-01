require("dotenv").config();
import express from "express";
const app = express();
const port = +process.env.PORT_KEY;
import userRoutes from "./routes/users";
const translateRoute = require("./routes/translate");

app.use(express.json());

app.use("/user", userRoutes);

app.use("/translate", translateRoute);

app.listen(port, () => {
  console.log(port);
});
