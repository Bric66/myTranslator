const axios = require("axios");
require("dotenv").config();
const apiKey = process.env.API_KEY;

async function translate(text, language, sourceLanguage) {
  const encodedParams = new URLSearchParams();
  encodedParams.append("q", text);
  encodedParams.append("target", language);
  encodedParams.append("source", sourceLanguage);

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
