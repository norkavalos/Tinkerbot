const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Assistant = require('watson-developer-cloud/assistant/v2');

const keys = functions.config();
const assistantId = keys.watson.assistant_id;
const eventBrite_key = keys.eventbrite.key;
// Set up assistant service wrapper
const service =  new Assistant({
  iam_apikey: keys.watson.key,
  version: '2018-09-20'
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json
// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

