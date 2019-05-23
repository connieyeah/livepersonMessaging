const app = require('express')();
const http = require('http').createServer(app);
const WebSocket = require('ws');
const request = require('request');

const getPublishMessage = (cId) => {
  return {
    "kind": "req",
    "id": 2,
    "type": "ms.PublishEvent",
    "body": { 
      "dialogId": cId,
      "event": {
        "type": "ContentEvent",
        "contentType": "text/plain",
        "message": "HELLO TESTING TESTING"
      }
    }
  }
};

// define your api endpoint e
request.post('https://va.idp.liveperson.net/api/account/40912224/signup', (err, res, body) => {
  let LIVEPERSON_JWT = JSON.parse(res.body).jwt;

  const ws = new WebSocket ('wss://va.msg.liveperson.net/ws_api/account/40912224/messaging/consumer?v=3', {
    headers : {
      Authorization: "jwt " + LIVEPERSON_JWT
    }});

    ws.onopen = function (socket) {
      console.log('socket connection opened');
      const newConversation = { "kind":"req","id":1,"type":"cm.ConsumerRequestConversation" }
      ws.send(JSON.stringify(newConversation));
    
      console.log('Request for new conversation sent');
    };
    
    ws.onmessage = function (evt) {
      const cId = JSON.parse(evt.data).body.conversationId;
      const message = getPublishMessage(cId);
      if (cId) {
        ws.send(JSON.stringify(message))
        ws.close()
      }
      ws.close()
    };

    ws.onclose = function () {
      // websocket is closed.
      console.log("Connection closed...");
    };
});

const port = process.env.PORT || 3000;
http.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`listening on port ${port}!`);
})
