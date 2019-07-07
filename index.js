const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const Assistant = require('watson-developer-cloud/assistant/v2');
const keys = require('./secrets');
const path = require('path');

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

let sessionId

service.createSession({
  assistant_id: keys.assistantIdPer,
}, (err, res) => sessionId = res.session_id);

app.post('/api/sendMessage', (req, res) => {
  const { message } = req.body;
  service.message(
    {
      input: { text: message},
      assistant_id: keys.assistantIdPer,
      session_id: sessionId,
    },
    async (err, response) => {
      if (err) {
        console.log('Error received', err);
        return;
      }
      const ans = await processResponse(response);
      res.send(ans);
    }
  );
});

async function processResponse(response) {
  const intents = response.output.intents;
  const generics = response.output.generic;

  console.log(response,'****')
  console.log(response.output.entities, 'response.output.entities')

  if (intents.length > 0) {
    if (intents[0].intent === 'event_location') {
      const location = response.output.entities.find((elm) => elm.entity === 'sys-location');
      console.log(location,'******location***')
      const events = await axios.get(
        'https://www.eventbriteapi.com/v3/events/search',
        {
          params: {
            'location.address': location.value,
            'location.within': '10mi'
          },
          headers: {
            Authorization: `Bearer ${keys.eventBrite}`
          }
        }
      );
      let ans = ``;

      events.data.events.forEach(event => {
        ans += `
          **** NAME OF THE EVENT: ****: ${event.name.text}
        `;
      });

      return ans;
    }  else if (generics.length > 0) {
      return generics[0].text;
    }
  }
}

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

const port = process.env.PORT || 5000;
app.listen(port);

console.log(`App listening on ${port}`);
