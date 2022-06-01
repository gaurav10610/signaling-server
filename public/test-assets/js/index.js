console.log("this is the web test script!");

const webSocket = new WebSocket("ws://localhost:9191");

// Connection opened
webSocket.addEventListener('open', function (event) {
    console.log("web socket client connected!");
});

// Listen for messages
webSocket.addEventListener('message', function (event) {
    console.log('message from server ', event.data);
    webSocket.send(JSON.stringify({
        name: 'gaurav'
    }));
});
