const axios = require("axios");
const apiKey = process.env.API_KEY;
import express from "express";
const db = new Map();
const router = express.Router();
import { authorization } from "../middlewares/authorizationMiddleware";
import { AuthentifiedRequest } from "../types/AuthentifiedRequest";

router.use(authorization);

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

async function translate(text, targetlanguage) {
  const encodedParams = new URLSearchParams();
  encodedParams.append("q", text);
  encodedParams.append("target", targetlanguage);

  const options = {
    method: "POST",
    url: "https://google-translate1.p.rapidapi.com/language/translate/v2",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "application/gzip",
      "X-RapidAPI-Key": `${apiKey}`,
      "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
    },
    data: encodedParams,
  };

  const response = await axios.request(options);
  return response.data;
}

router.post("/", async (req: AuthentifiedRequest, res) => {
  try {
    const body = {
      text: req.body.text,
      language: req.body.language,
    };
    const idUser = req.user.userId;
    const isAlreadyTranslated = search(idUser, body.text);
    if (isAlreadyTranslated) {
      return res.send({
        originalText: body.text,
        translatedText: isAlreadyTranslated.translation,
        userId: idUser,
      });
    }
    const translation = await translate(body.text, body.language);

    const translatedText = translation.data.translations[0].translatedText;

    const savedTranslation = {
      originalText: body.text,
      translation: translatedText,
      language: body.language,
    };

    const hasAlreadySavedTranslation = db.get(idUser);
    if (hasAlreadySavedTranslation) {
      hasAlreadySavedTranslation.push(savedTranslation);
      db.set(idUser, hasAlreadySavedTranslation);
    } else {
      db.set(idUser, [savedTranslation]);
    }
    return res.send({
      originalText: body.text,
      translatedText: translatedText,
      UserId: idUser,
    });
  } catch (error) {
    console.log(error.response.data.error.details[0].fieldViolations);
    return res.sendStatus(400);
  }
});

module.exports = router;
