const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Retrieve the Telegram bot token from the environment variable
const botToken = process.env.TELEGRAM_BOT_TOKEN;

// Create the Telegram bot instance
const bot = new TelegramBot(botToken, { polling: true });

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const welcomeMessage = **`Hello, ${username}!\n\n`
    + `Welcome To Indishort Links Bot\n`
    + `I'm indishort.live Official Link Converter Bot 🤖 I Can Convert Bulk Links To Your Short Links From Direct Your indishort.live Account With Just a Simple Click 🚀\n\n`
    + `How To Use 🤔\n\n`
    + `✅1. Go To https://indishort.live & Complete Your Registration.\n`
    + `✅2. Get Your API https://indishort.live/member/tools/api Copy Your API\n`
    + `✅3. Add your API using command /api \n`
    + `Example : /api  c49399f821fc020161bc2a31475ec59f35ae5b4b\n\n`
    + `For More Help, Contact @jit362\n\n`
    + `ᴄᴜʀʀᴇɴᴛ sᴇʟᴇᴄᴛᴇᴅ ᴍᴇᴛʜᴏᴅ: shortener\n\n`
    + `Made with ❤️ By: indishort.live`**;
;

  bot.sendMessage(chatId, welcomeMessage);
});

// Command: /setapi
bot.onText(/\/setapi (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1].trim(); // Get the API token provided by the user

  // Save the user's Indishort API token to the database
  saveUserToken(chatId, userToken);

  const response = `Indishort API token set successfully. ✅️ Your token: ${userToken}`;
  bot.sendMessage(chatId, response);
});

// Listen for any message (not just commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // If the message starts with "http://" or "https://", assume it's a URL and try to shorten it
  if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    shortenUrlAndSend(chatId, messageText);
  }
});

// Function to shorten the URL and send the result
async function shortenUrlAndSend(chatId, Url) {
  // Retrieve the user's Indishort API token from the database
  const IndishortToken = getUserToken(chatId);

  if (!IndishortToken) {
    bot.sendMessage(chatId, 'Please provide your Indishort API token first. Use the command: /setapi YOUR_INDISHORT_API_TOKEN');
    return;
  }

  try {
    const apiUrl = `https://indishort.live/api?api=${IndishortToken}&url=${Url}`;

    // Make a request to the Indishort
    API to shorten the URL
    const response = await axios.get(apiUrl);
    const shortUrl = response.data.shortenedUrl;

    const responseMessage = `Shortened URL: ${shortUrl}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    bot.sendMessage(chatId, 'An error occurred while shortening the URL. Please check your API token and try again.');
  }
}

// Function to save user's Indishort API token to the database (Replit JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's Indishort API token from the database
function getUserToken(chatId) {
  const dbData = getDatabaseData();
  return dbData[chatId];
}

// Function to read the database file and parse the JSON data
function getDatabaseData() {
  try {
    return JSON.parse(fs.readFileSync('database.json', 'utf8'));
  } catch (error) {
    // Return an empty object if the file doesn't exist or couldn't be parsed
    return {};
  }
}
