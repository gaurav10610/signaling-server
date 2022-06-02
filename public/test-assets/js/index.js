console.log("this is the web test script!");

const webSocket = new WebSocket("ws://localhost:9191");

// Connection opened
webSocket.addEventListener("open", function (event) {
  console.log("web socket client connected!");
});

// Listen for messages
webSocket.addEventListener("message", function (event) {
  const message = JSON.parse(event.data);
  console.log("message from server ", event.data);

  if (message.type === "connect") {
    webSocket.send(
      JSON.stringify({
        from: "shikha",
        to: "theinstashare-server",
        type: "register",
      })
    );
  }
});
