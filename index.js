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

function search(ID, originalText) {
  const translations = db.get(ID);
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
  const saltRounds = 10;
  const myPlaintextPassword = req.body.password;

  const hash = bcrypt.hashSync(myPlaintextPassword, saltRounds);

  const user = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    password: hash,
    UUID: uuidv4(),
  };

  const userreturn = {
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    email: req.body.email,
    UUID: user.UUID,
  };

  const usermail = dbuser.get(user.email);
  if (usermail) {
    return res.status(404).send({
      message: "email already exists",
    });
  }
  dbuser.set(user.email, user);

  return res.send(userreturn);
});

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };
  const recupUser = dbuser.get(body.email);
  const recupID = recupUser.UUID;

  const isAlreadyTranslated = search(recupID, body.text);
  if (isAlreadyTranslated) {
    console.log("ça passe");
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
      UUID: recupID,
    });
  }
  const translation = await translate(body.text, body.language);

  const translatedText = translation.data.translations[0].translatedText;

  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };

  const hasAlreadySavedTranslation = db.get(recupID);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(recupID, hasAlreadySavedTranslation);
  } else {
    db.set(recupID, [savedTranslation]);
  }
  return res.send({
    originalText: body.text,
    translatedText: translatedText,
    UUID: recupID,
  });
});

app.listen(port, () => {
  console.log(port);
});
