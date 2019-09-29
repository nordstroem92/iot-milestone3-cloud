'use strict';

var Client = require('azure-iothub').Client;
var Message = require('azure-iot-common').Message;

var connectionString = 'HostName=Milestone3.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=lib1zIKPJ0C8P+HdQ6kQto//222/dUloAtjGVxeedjg=';
var targetDevice = 'deltapi1';

var serviceClient = Client.fromConnectionString(connectionString);

function printResultFor(op) {
  return function printResult(err, res) {
    if (err) console.log(op + ' error: ' + err.toString());
    if (res) console.log(op + ' status: ' + res.constructor.name);
  };
}

function receiveFeedback(err, receiver){
  receiver.on('message', function (msg) {
    console.log('Feedback message:')
    console.log(msg.getData().toString('utf-8'));
  });
}

module.exports = function(msg){
  serviceClient.open(function (err) {
    if (err) {
      console.error('Could not connect: ' + err.message);
    } else {
      console.log('Service client connected');
      serviceClient.getFeedbackReceiver(receiveFeedback);
      var message = new Message(msg);
      message.ack = 'full';
      message.messageId = "My Message ID";
      serviceClient.send(targetDevice, message, printResultFor('send'));
    }
  })
}