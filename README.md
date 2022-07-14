## 40 Days of Prayer Bot
This Telegram bot sends daily prayer guides pulled from the 40 Days of Prayer website.

## Contributions
Please feel free to file new issues for bugs encountered. Pull requests are welcomed too!

## Getting started
We use TypeScript, and the [serverless](https://www.serverless.com/framework/docs/getting-started) framework to deploy the application.

1. Install NodeJS v14 and the [serverless](https://www.serverless.com/framework/docs/getting-started) framework.
1. Clone this repository, `cd` to this repository directory and run `yarn install` to install the necessary dependencies.
1. Run `yarn localScrape` to get the latest HTML content pulled from the website.
1. Use the `src/parser/__test__/testParse.js` file to test any updates to the parser located at `src/parser/parser.js`.

### Help needed in:
- Major refactoring of the `jsdom` parser logic
- Adding of test cases to test parsing logic
- Updating the parser yearly owing to changes in the website HTML content and format
