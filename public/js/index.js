let connectedOnce = false;
let webSocket;

const messageDiv = document.getElementById("message-div");
const selectedUserDiv = document.getElementById("selected-user");
const onlineUsersDiv = document.getElementById("online-users");
const selectedGroupDiv = document.getElementById("selected-group");
const usernameDiv = document.getElementById("username");

// text fields
const usernameInput = document.getElementById("username-input");
const groupInput = document.getElementById("group-input");
const messageInput = document.getElementById("message-input");

// buttons
const registerButton = document.getElementById("register-user-button");
const registerGroupButton = document.getElementById("register-group-button");
const sendMessageButton = document.getElementById("send-message-button");

let username = "";
let selectedUser = "";
let selectedGroup = "";
let connectionId = null;

const activeUsers = {};

registerButton.addEventListener("click", () => {
  registerUser(usernameInput.value);
});

registerGroupButton.addEventListener("click", () => {
  registerUserInGroup(groupInput.value);
});

sendMessageButton.addEventListener("click", () => {
  sendMessage(messageInput.value);
});

function updateOnlineUsers() {
  onlineUsersDiv.replaceChildren();
  for (const username of Object.keys(activeUsers)) {
    const node = document.createElement("p");
    node.appendChild(document.createTextNode(username));
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

function showUsername(username) {
  usernameDiv.innerText = `username: ${username}`;
  username = username;
}

function selectGroup(groupName) {
  selectedGroupDiv.innerText = `selected group: ${groupName}`;
  selectedGroup = groupName;
}

function logMessage(message) {
  const node = document.createElement("p");
  node.appendChild(document.createTextNode(message));
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
        connectionId = connectionId;
        break;

      default: //do nothing here
    }
  } catch (error) {
    logMessage(`error while handling signaling message: ${message}`);
  }
}

function registerUser(username) {
  logMessage(`registering user with username: ${username}`);
  sendMessage({
    from: username,
    to: "theinstashare-server",
    type: "register",
  });
}

function registerUserInGroup(groupName) {
  logMessage(`registering in group with group name: ${groupName}`);
}

function sendMessage(message) {
  logMessage(`sending message: ${message}`);
  if (connectionId === null) {
    logMessage("last message cannot be sent because there is no connection id");
    return;
  }
  webSocket.send(JSON.stringify(message));
}

init();
showUsername(username);
selectGroup(selectedGroup);
selectedUserDiv.innerText = `selected user: ${selectedUser}`;
updateOnlineUsers();
