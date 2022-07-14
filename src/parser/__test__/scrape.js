/**
 * ============================================================
 * This script scrapes the latest HTML content and saves them
 * under the __test__ folder for use in testing the parser.
 * ============================================================
 */

const fs = require("fs");
const axios = require("axios");

(async () => {
  const resp = await axios.get(`https://lovesingapore.org.sg/40day/2022`);
  const text = resp.data;
  fs.writeFile(`./src/parser/__test__/local.html`, text, "utf-8", (e) => {
    if (e) return console.log(e);
  });
})();
