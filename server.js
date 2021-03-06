const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const EventHubReader = require('./scripts/event-hub-reader.js');
const CloudToDeviceMessages = require('./scripts/cloud-to-device-messages.js');

//process.env.IotHubConnectionString
const iotHubConnectionString = 'HostName=Milestone3.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=lib1zIKPJ0C8P+HdQ6kQto//222/dUloAtjGVxeedjg=';
//process.env.EventHubConsumerGroup
const eventHubConsumerGroup = 'Deltaconsumergroup';

// Redirect requests to the public subdirectory to the root
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res /* , next */) => {
  res.redirect('/');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function (ws, req) {
  console.log("hej din lille gnu");
  ws.on("message", function (data){
    console.log("hej din fede laks");
    CloudToDeviceMessages(data); //2 blue 1 yellow 3 green
  });
});

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        console.log(`Broadcasting data ${data}`);
        client.send(data);
      } catch (e) {
        console.error(e);
      }
    }
  });
};

server.listen(process.env.PORT || '3000', () => {
  console.log('Listening on %d.', server.address().port);
});

const eventHubReader = new EventHubReader(iotHubConnectionString, eventHubConsumerGroup);

(async () => {
  await eventHubReader.startReadMessage((message, date, deviceId) => {
    try {
      const payload = {
        IotData: message,
        MessageDate: date || Date.now().toISOString(),
        DeviceId: deviceId,
      };

      wss.broadcast(JSON.stringify(payload));
    } catch (err) {
      console.error('Error broadcasting: [%s] from [%s].', err, message);
    }
  });
})().catch();