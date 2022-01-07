const SERVER_URL = "http://localhost:3000/";
let socket = null;
let video = null;
let recordingId = null;
let roomName = null;
let userName = null;

const initSockets = async () => {
  socket = io(SERVER_URL);

  socket.on("fetch-rooms", (rooms) => {
    const roomListDiv = document.getElementById("roomListDiv");
    roomListDiv.innerHTML = "";

    for (let room of rooms) {
      const joinButton = document.createElement("button");
      joinButton.textContent = "Join " + room.name;
      joinButton.addEventListener("click", () => {
        socket.emit("join-room", {
          recordingId: recordingId,
          roomName: room.name,
          userName: usernameInput.value,
        });
      });

      const roomDiv = document.createElement("div");
      roomDiv.append(joinButton);
      roomListDiv.append(roomDiv);
    }
  });

  socket.on("fetch-rooms-broadcast", (rooms) => {
    const roomListDiv = document.getElementById("roomListDiv");
    roomListDiv.innerHTML = "";

    for (let room of rooms) {
      const joinButton = document.createElement("button");
      joinButton.textContent = "Join " + room.name;
      joinButton.addEventListener("click", () => {
        socket.emit("join-room", {
          recordingId: recordingId,
          roomName: room.name,
          userName: usernameInput.value,
        });
      });

      const roomDiv = document.createElement("div");
      roomDiv.append(joinButton);
      roomListDiv.append(roomDiv);
    }
  });

  socket.on("join-room", (data) => {
    const { recordingId: x, roomName: y, userName: z } = data;
    recordingId = x;
    roomName = y;
    userName = z;

    const roomControlsDiv = document.getElementById("roomControlsDiv");
    roomControlsDiv.style.display = "none";

    // room info
    const roomInfo = document.createElement("p");
    roomInfo.innerText =
      "\nRoom Name: " + roomName + "\nUser Name: " + userName;

    const leftPanel = document.getElementById("leftPanel");
    leftPanel.append(roomInfo);

    // chat box
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";

    const messageInput = document.createElement("input");
    messageInput.id = "messageInput";
    messageInput.type = "text";
    messageInput.placeholder = "Enter message";

    const messageSend = document.createElement("button");
    messageSend.id = "messageSend";
    messageSend.type = "submit";
    messageSend.textContent = "Send";

    const messageForm = document.createElement("form");
    messageForm.id = "messageForm";
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;
      socket.emit("send-chat-message", { recordingId, roomName, message });
      appendMessage(`${message}`);
      messageInput.value = "";
    });

    messageForm.append(messageInput);
    messageForm.append(messageSend);

    leftPanel.append(messageContainer);
    leftPanel.append(messageForm);
  });

  socket.on("create-room", (data) => {
    const { recordingId: x, roomName: y, userName: z } = data;
    recordingId = x;
    roomName = y;
    userName = z;

    const roomControlsDiv = document.getElementById("roomControlsDiv");
    roomControlsDiv.style.display = "none";

    // room info
    const roomInfo = document.createElement("p");
    roomInfo.innerText =
      "\nRoom Name: " + roomName + "\nUser Name: " + userName;

    const leftPanel = document.getElementById("leftPanel");
    leftPanel.append(roomInfo);


    // chat box
    const messageContainer = document.createElement("div");
    messageContainer.id = "messageContainer";

    const messageInput = document.createElement("input");
    messageInput.id = "messageInput";
    messageInput.type = "text";
    messageInput.placeholder = "Enter message";

    const messageSend = document.createElement("button");
    messageSend.id = "messageSend";
    messageSend.type = "submit";
    messageSend.textContent = "Send";

    const messageForm = document.createElement("form");
    messageForm.id = "messageForm";
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;
      socket.emit("send-chat-message", { recordingId, roomName, message });
      appendMessage(`${message}`);
      messageInput.value = "";
    });

    messageForm.append(messageInput);
    messageForm.append(messageSend);

    leftPanel.append(messageContainer);
    leftPanel.append(messageForm);

    // broadcast new room
    socket.emit("fetch-rooms-broadcast", recordingId);
  });

  socket.on("chat-message", (message) => {
    console.log('recevied msg')
    appendMessage(`${message}`);
  });
};

function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;

  const messageContainer = document.getElementById("messageContainer");
  messageContainer.append(messageElement);
}

const initRoomControls = async () => {
  // username
  const usernameInput = document.createElement("input");
  usernameInput.id = "usernameInput";
  usernameInput.type = "text";
  usernameInput.placeholder = "Enter user name";

  const usernameDiv = document.createElement("div");
  usernameDiv.id = "usernameDiv";
  usernameDiv.append(usernameInput);

  // room list
  const roomListDiv = document.createElement("div");
  roomListDiv.id = "roomListDiv";

  // new room
  const newRoomTextField = document.createElement("input");
  newRoomTextField.id = "newRoomTextField";
  newRoomTextField.type = "text";
  newRoomTextField.placeholder = "Enter room name";

  const newRoomButton = document.createElement("button");
  newRoomButton.id = "newRoomButton";
  newRoomButton.textContent = "New Room";
  newRoomButton.addEventListener("click", () =>
    socket.emit("create-room", {
      recordingId,
      roomName: newRoomTextField.value,
      userName: usernameInput.value,
    })
  );

  const newRoomDiv = document.createElement("div");
  newRoomDiv.id = "newRoomDiv";
  newRoomDiv.append(newRoomTextField);
  newRoomDiv.append(newRoomButton);

  // add room controls to page
  const roomControlsDiv = document.createElement("div");
  roomControlsDiv.id = "roomControlsDiv";
  roomControlsDiv.append(usernameDiv);
  roomControlsDiv.append(roomListDiv);
  roomControlsDiv.append(newRoomDiv);

  const leftPanel = document.getElementsByClassName("player-panel-l")[0];
  leftPanel.id = "leftPanel";
  leftPanel.append(roomControlsDiv);
};

const init = async () => {
  recordingId = window.__data__.recordingId;

  initSockets();
  initRoomControls();

  // fetch rooms
  socket.emit("fetch-rooms", recordingId);
};

const scriptEntryCheck = async () => {
  video = document.getElementsByTagName("video")[1];
  if (video === null) {
    return;
  }

  init();
};

(async () => {
  window.addEventListener("load", scriptEntryCheck);
})();
