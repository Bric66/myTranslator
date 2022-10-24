const axios = require("axios");
require("dotenv").config();
const express = require("express");
const app = express();
const port = +process.env.PORT_KEY;
const translate = require("./translate.js");
const db = new Map();

app.use(express.json());

function search(email, originalText) {
  const translations = db.get(email);
  if (translations) {
    const found = translations.find(
      (element) => element.originalText === originalText
    );
    if (found) {
      return found;
    }
  }
}

app.post("/translate", async (req, res) => {
  const body = {
    text: req.body.text,
    language: req.body.language,
    email: req.body.email,
  };
  const isAlreadyTranslated = search(body.email, body.text);
  if (isAlreadyTranslated) {
    console.log("ça passe");
    return res.send({
      originalText: body.text,
      translatedText: isAlreadyTranslated.translation,
    });
  }
  const translation = await translate(body.text, body.language);

  const translatedText = translation.data.translations[0].translatedText;

  const savedTranslation = {
    originalText: body.text,
    translation: translatedText,
    language: body.language,
  };

  const hasAlreadySavedTranslation = db.get(body.email);
  if (hasAlreadySavedTranslation) {
    hasAlreadySavedTranslation.push(savedTranslation);
    db.set(body.email, hasAlreadySavedTranslation);
  } else {
    db.set(body.email, [savedTranslation]);
  }
  return res.send({
    originalText: body.text,
    translatedText: translatedText,
  });
});

app.listen(port, () => {
  console.log(port);
});
