const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

const dbuser = new Map();
const secretKey = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const authorization = require("../middlewares/authorizationMiddleware");

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

  const user = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: hash,
    userId: userIdNumber,
  };

  const usermail = dbuser.get(user.email);
  if (usermail) {
    return res.status(404).send({
      message: "email already exists",
    });
  }
  dbuser.set(user.email, user);

  return res.send({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    userId: user.userId,
  });
});

router.post("/signin", (req, res) => {
  const body = {
    email: req.body.email,
    password: req.body.password,
  };
  const user = dbuser.get(body.email);

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

router.patch("/", async (req, res) => {
  const body = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
  };

  const user = dbuser.get(req.user.email);
  if (!user) {
    return res.status(400).send({
      message: "user does not exist",
    });
  }

  if (body.firstName) {
    user.firstName = body.firstName;
  }

  if (body.lastName) {
    user.lastName = body.lastName;
  }

  dbuser.set(user.email, user);

  return res.send({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    userId: user.userId,
  });
});

module.exports = router;
