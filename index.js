const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');

const keep_alive = require('./keep_alive.js');

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('I am now live !');
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
  const welcomeMessage = `Hello, ${username}!\n\n`
    + '**🥰 Welcome to the URL Shortener Bot!**\n'
    + '**You can use this bot to shorten URLs of only indishort service.**\n\n'
    + '**I am SGU_Short Official Link Converter Bot 🤖 I Can short Bulk Links To Yours Short Links From Direct Your sgushort.rf.gd Account With Just a Simple Clicks.  🚀**\n\n'
    + '**How To Use Me 👇👇** \n\n'
    + '✅1. Go to https://indishort.live & Complete Your Registration.\n\n'
    + '✅2. Then Copy Your API Key from here https://indishort.live/member/tools/api Copy Your API Only \n\n'
    + '✅3. Then add your API using the command /setapi \n\n'
    + 'Example : /setapi c49399f821fc020161bc2a31475ec59f35ae5b4\n\n'
    + '⚠️ You must have to send the link with https:// or http://\n\n'
    + 'Made with ❤️ By: @jit362';

  bot.sendMessage(chatId, welcomeMessage);
});

// Command: /setapi
bot.onText(/\/setapi (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userToken = match[1].trim(); // Get the API token provided by the user

  // Save the user's API token to the database
  saveUserToken(chatId, userToken);

  const response = `SHORTENER API token set successfully. Your token: ${userToken}`;
  bot.sendMessage(chatId, response);
});

// Listen for any message (not just commands)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

  // If the message is a URL but doesn't start with "http://" or "https://"
  if (messageText && !messageText.startsWith('http://') && !messageText.startsWith('https://')) {
    bot.sendMessage(chatId, '⚠️ Please provide a valid URL starting with "http://" or "https://".');
  } 
  // If the message starts with "http://" or "https://", assume it's a URL and try to shorten it
  else if (messageText && (messageText.startsWith('http://') || messageText.startsWith('https://'))) {
    shortenUrlAndSend(chatId, messageText);
  }
});

// Function to shorten the URL and send the result
async function shortenUrlAndSend(chatId, Url) {
  // Retrieve the user's API token from the database
  const apiToken = getUserToken(chatId);

  if (!apiToken) {
    bot.sendMessage(chatId, '🚦 Please provide your Shortener API token first. Use the command: /setapi YOUR_SHORTENER_API_TOKEN');
    return;
  }

  try {
    const apiUrl = `https://indishort.live/api?api=${apiToken}&url=${Url}`;

    // Make a request to the shortening service API to shorten the URL
    const response = await axios.get(apiUrl);
    const shortUrl = response.data.shortenedUrl;

    const responseMessage = `Here is your Shortened URL: ${shortUrl}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Shorten URL Error:', error);
    bot.sendMessage(chatId, 'An error occurred while shortening the URL. Please check your API token and try again.');
  }
}

// Function to save user's API token to the database (JSON database)
function saveUserToken(chatId, token) {
  const dbData = getDatabaseData();
  dbData[chatId] = token;
  fs.writeFileSync('database.json', JSON.stringify(dbData, null, 2));
}

// Function to retrieve user's API token from the database
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
