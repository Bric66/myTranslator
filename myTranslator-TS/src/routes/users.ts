import express from "express";
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const secretKey = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
import { authorization } from "../middlewares/authorizationMiddleware";
import { User, UserStorage } from "../storage/UserStorage";
import { AuthentifiedRequest } from "../types/AuthentifiedRequest";
const userStorage = new UserStorage();

router.post("/", (req, res) => {
  const body = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email.toLowerCase().trim(),
    password: req.body.password,
  };

  const saltRounds = 10;
  const myPlaintextPassword = body.password;
  const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);
  const userIdNumber = uuidv4();

  const user: User = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: hash,
    userId: userIdNumber,
  };
  const usermail = userStorage.getByEmail(body.email);
  if (usermail) {
    return res.status(404).send({
      message: "email already exists",
    });
  }
  userStorage.save(user);

  return res.send({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    userId: user.userId,
  });
});

router.post("/signin", (req, res) => {
  const body = {
    email: req.body.email.toLowerCase().trim(),
    password: req.body.password,
  };

  const user = userStorage.getByEmail(body.email);

  if (!user) {
    return res.status(400).send({
      message: "user does not exist",
    });
  }

  const hash = user.password;
  const comparePasswords = bcrypt.compareSync(body.password, hash);

  if (!comparePasswords) {
    return res.status(400).send({
      message: "password does not match",
    });
  }

  const accessKey = jwt.sign(
    {
      email: user.email,
      firstName: user.firstName,
      lastName: user.firstName,
      userId: user.userId,
    },
    secretKey
  );

  return res.status(200).send({
    accessKey: accessKey,
    email: user.email,
    userId: user.userId,
  });
});

router.use(authorization);

router.patch("/", (req: AuthentifiedRequest, res) => {
  const body = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
  };

  const user = userStorage.getByEmail(req.user.email);

  if (body.firstName) {
    user.firstName = body.firstName;
  }

  if (body.lastName) {
    user.lastName = body.lastName;
  }

  userStorage.save(user);

  return res.send({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userId: user.userId,
  });
});

export default router;
