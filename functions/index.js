const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Assistant = require('watson-developer-cloud/assistant/v2');

// Set up assistant service wrapper
const service =  new Assistant({
  iam_apikey: keys.chatbotKey,
  version: '2018-09-20'
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

