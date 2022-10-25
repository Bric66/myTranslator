const axios = require("axios");
const apiKey = process.env.API_KEY;
const express = require("express");
const app = express();

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

module.exports = translate;
