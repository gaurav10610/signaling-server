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

const deRegisterUserButton = document.getElementById("de-register-user-button");
const deRegisterGroupButton = document.getElementById("de-register-group-button");

const context = {
  username: "",
  selectedUser: "",
  selectedGroup: "",
  connectionId: null,
  isUserRegistered: false,
  isUserRegisteredInGroup: false,
};

const activeUsers = {};

registerButton.addEventListener("click", () => {
  registerUser(usernameInput.value, true);
});

deRegisterUserButton.addEventListener("click", () => {
  if (context.username && context.username.length > 0) {
    registerUser(context.username, false);
  }
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
  context.username = username;
}

function selectGroup(groupName) {
  selectedGroupDiv.innerText = `selected group: ${groupName}`;
  context.selectedGroup = groupName;
}

function selectUser(selectedUser) {
  selectedUserDiv.innerText = `selected user: ${selectedUser}`;
  context.selectedUser = selectedUser;
}

function logMessage(message) {
  const node = document.createElement("p");
  node.appendChild(document.createTextNode(message));
  node.classList.add("header-font");
  messageDiv.appendChild(node);
  messageDiv.scrollTop = messageDiv.scrollHeight;
}

function init() {
  logMessage(`trying to ${connectedOnce ? "reconnect" : "connect"} web socket connection`);
  webSocket = new WebSocket("ws://localhost:9090");

  webSocket.addEventListener("error", function (event) {
    logMessage(`error occured while ${connectedOnce ? "reconnecting" : "connecting"} with signaling  server`);
    setTimeout(() => {
      init();
    }, 1000);
  });

  // Connection opened
  webSocket.addEventListener("open", function (event) {
    logMessage(`web socket client ${connectedOnce ? "reconnected" : "connected"}`);

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

      context.isUserRegistered = false;
      context.isUserRegisteredInGroup = false;
      context.connectionId = null;
      showUsername("");
      selectUser("");
      selectGroup("");
    });
    connectedOnce = true;
  });
}

function handleSignalingMessage(message) {
  try {
    const signalingMessage = JSON.parse(message);
    switch (signalingMessage.type) {
      case "conn":
        logMessage(`new connectionId: ${signalingMessage.connectionId}`);
        context.connectionId = signalingMessage.connectionId;
        break;

      default: //do nothing here
    }
  } catch (error) {
    logMessage(`error while handling signaling message: ${message}`);
  }
}

async function registerUser(username, needRegister) {
  const logText = needRegister ? "register" : "de-register";
  logMessage(`${logText} user with username: ${username}`);
  try {
    const response = await sendHttpRequest("POST", "users/register", {
      username,
      needRegister,
    });
    const responseBody = await response.json();
    if (response.ok) {
      isUserRegistered = true;
      if (needRegister) {
        showUsername(username);
      } else {
        showUsername("");
      }

      console.log(`user ${logText} successful`);
      console.log(`response body: ${JSON.stringify(responseBody)}`);
    } else {
      console.log(`user ${logText} failed with status ${response.status}`);
      if (response.bodyUsed) {
        console.log(`response body: ${JSON.stringify(responseBody)}`);
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function registerUserInGroup(groupName) {
  logMessage(`registering in group with group name: ${groupName}`);
}

function sendMessage(message) {
  logMessage(`sending message: ${message}`);
  if (context.connectionId === null) {
    logMessage("last message cannot be sent because there is no connection id");
    return;
  }
  webSocket.send(JSON.stringify(message));
}

function sendHttpRequest(method, uri, body) {
  const init = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "connection-id": context.connectionId,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return fetch(`http://localhost:9191/api/v1/${uri}`, init);
}

init();
showUsername(context.username);
selectGroup(context.selectedGroup);
selectedUserDiv.innerText = `selected user: ${context.selectedUser}`;
updateOnlineUsers();
