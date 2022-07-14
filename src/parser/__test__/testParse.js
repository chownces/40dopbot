const fs = require("fs");
const { ADMIN_CHAT_ID } = require("../../utils/constants");
const { englishParser, chineseParser } = require("../parser");
const { sendMessage } = require("../../utils/telegram");

(async () => {
  const text = fs.readFileSync("./src/parser/__test__/local.html", "utf-8");

  const message = await englishParser(text);
  // const message = await chineseParser(text);

  console.log(message);
  // await sendMessage(message, ADMIN_CHAT_ID);
})();
