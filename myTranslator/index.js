const axios = require("axios");
require("dotenv").config();
const express = require("express");
const app = express();
const port = +process.env.PORT_KEY;
const translate = require("./translate.js");

app.use(express.json());

app.post("/translate", async (req, res) => {
  const body = req.body;
  const result = {
    textjson: body.text,
    languagejson: body.language,
    sourceLanguagejson: body.sourceLanguage,
  };
  const traduction = await translate(
    result.textjson,
    result.languagejson,
    result.sourceLanguagejson
  );

  return res.send({
    translatedText: traduction.data.translations[0].translatedText,
    originalText: result.textjson,
  });
});

app.listen(port, () => {
  console.log(port);
});
