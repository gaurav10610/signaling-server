let connectedOnce = false;
let webSocket;

const messageDiv = document.getElementById("message-div");
const selectedUserDiv = document.getElementById("selected-user-div");
const onlineUsersDiv = document.getElementById("online-users");
const selectedGroupDiv = document.getElementById("selected-group-div");

let selectedUser = "";
let selectedGroup = "";

const activeUsers = {};

function updateOnlineUsers() {
  onlineUsersDiv.replaceChildren();
  for (const username of Object.keys(activeUsers)) {
    const node = document.createElement("p");
    const textnode = document.createTextNode(username);
    node.appendChild(textnode);
    node.classList.add("header-font");
    node.classList.add("active-user");
    node.id = username;
    node.addEventListener("click", function () {
      selectedUserDiv.innerText = `selected user: ${username}`;
      this.selectUser = username;
    });
    onlineUsersDiv.appendChild(node);
  }
}

function selectGroup(groupName) {
  selectedGroupDiv.innerText = `selected group: ${groupName}`;
  selectedGroup = groupName;
}

function logMessage(message) {
  const node = document.createElement("p");
  const textnode = document.createTextNode(message);
  node.appendChild(textnode);
  node.classList.add("header-font");
  messageDiv.appendChild(node);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

function init() {
  logMessage(
    `trying to ${connectedOnce ? "reconnect" : "connect"} web socket connection`
  );
  webSocket = new WebSocket("ws://localhost:9090");

  webSocket.addEventListener("error", function (event) {
    logMessage(
      `error occured while ${
        connectedOnce ? "reconnecting" : "connecting"
      } with signaling  server`
    );
    setTimeout(() => {
      init();
    }, 1000);
  });

  // Connection opened
  webSocket.addEventListener("open", function (event) {
    logMessage(
      `web socket client ${connectedOnce ? "reconnected" : "connected"}`
    );

    // Listen for messages
    webSocket.addEventListener("message", function (event) {
      logMessage(event.data);
      handleSignalingMessage(event.data);
      // if (message.type === "connect") {
      //   webSocket.send(
      //     JSON.stringify({
      //       from: "shikha",
      //       to: "theinstashare-server",
      //       type: "register",
      //     })
      //   );
      // }
    });

    webSocket.addEventListener("close", function (event) {
      logMessage("disconnected from signaling server!");
      setTimeout(() => {
        init();
      }, 3000);
    });
    connectedOnce = true;
  });
}

function handleSignalingMessage(message) {
  try {
    const signalingMessage = JSON.parse(message);
    switch (signalingMessage.type) {
      case "connect":
        break;

      default: //do nothing here
    }
  } catch (error) {
    logMessage(`error while handling signaling message: ${message}`);
  }
}

function registerUser(username) {}

function registerUserInGroup(groupName) {}

function sendMessage(message) {}

init();
selectGroup(selectedGroup);
selectedUserDiv.innerText = `selected user: ${selectedUser}`;
updateOnlineUsers();
