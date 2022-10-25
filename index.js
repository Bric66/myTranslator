const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
require("dotenv").config();
const express = require("express");
const app = express();

const port = +process.env.PORT_KEY;

const translate = require("./translate.js");

const db = new Map();
const dbuser = new Map();

app.use(express.json());

function search(userId, originalText) {
  const translations = db.get(userId);
  if (translations) {
    const found = translations.find(
      (element) => element.originalText === originalText
    );
    if (found) {
      return found;
    }
  }
}

app.post("/user", (req, res) => {
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

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };

  const user = dbuser.get(body.email);
  const userId = user.userId;

  const isAlreadyTranslated = search(userId, body.text);
  if (isAlreadyTranslated) {
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
      userId: userId,
    });
  }
  const translation = await translate(body.text, body.language);

  const translatedText = translation.data.translations[0].translatedText;

  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };

  const hasAlreadySavedTranslation = db.get(userId);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(userId, hasAlreadySavedTranslation);
  } else {
    db.set(userId, [savedTranslation]);
  }
  return res.send({
    originalText: body.text,
    translatedText: translatedText,
    UserId: userId,
  });
});

app.listen(port, () => {
  console.log(port);
});
