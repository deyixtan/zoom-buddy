const SERVER_URL = "http://localhost:3000/";
let socket = null;
let video = null;
let recordingId = null;
let roomName = null;
let userName = null;

const seekHandler = () => {
  socket.emit("video-time-updated", {
    recordingId,
    roomName,
    time: event.target.currentTime,
  });
};

const playHandler = () => {
  socket.emit("play", { recordingId, roomName });
};

const pauseHandler = () => {
  socket.emit("pause", { recordingId, roomName });
};

const initSockets = async () => {
  socket = io(SERVER_URL);

  socket.on("fetch-rooms", (rooms) => {
    const roomListUl = document.getElementById("roomListUl");
    roomListUl.innerHTML = "";

    for (let room of rooms) {
      const joinButton = document.createElement("button");
      joinButton.classList.add("btn", "btn-success", "form-control");
      joinButton.textContent = "Join " + room.name;
      joinButton.addEventListener("click", () => {
        socket.emit("join-room", {
          recordingId: recordingId,
          roomName: room.name,
          userName: usernameInput.value,
        });
      });

      const roomLi = document.createElement("li");
      roomLi.classList.add("list-group-item", "list-group-item");

      roomLi.append(joinButton);
      roomListUl.append(roomLi);
    }
  });

  socket.on("fetch-rooms-broadcast", (rooms) => {
    const roomListUl = document.getElementById("roomListUl");
    roomListUl.innerHTML = "";

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

      const roomLi = document.createElement("li");
      roomLi.classList.add("list-group-item", "list-group-item");

      roomLi.append(joinButton);
      roomListUl.append(roomLi);
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
    roomInfo.innerHTML =
      "\n<strong>Room Name</strong>: " +
      roomName +
      "\t<strong>User Name</strong>: " +
      userName;

    const leftPanel = document.getElementById("leftPanel");
    leftPanel.append(roomInfo);

    // chat box
    const messageContainer = document.createElement("ul");
    messageContainer.id = "messageContainer";
    messageContainer.classList.add("list-group");
    messageContainer.style.minHeight = "20%";
    messageContainer.style.maxHeight = "20%";
    messageContainer.style.overflow = "scroll";

    const messageInput = document.createElement("input");
    messageInput.id = "messageInput";
    messageInput.classList.add("form-control");
    messageInput.type = "text";
    messageInput.placeholder = "Enter message";

    const messageSend = document.createElement("button");
    messageSend.id = "messageSend";
    messageSend.classList.add("btn", "btn-dark", "form-control");
    messageSend.type = "submit";
    messageSend.textContent = "Send";

    const messageForm = document.createElement("form");
    messageForm.id = "messageForm";
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;
      if (message === "") return;
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
    roomInfo.innerHTML =
      "\n<strong>Room Name</strong>: " +
      roomName +
      "\t<strong>User Name</strong>: " +
      userName;

    const leftPanel = document.getElementById("leftPanel");
    leftPanel.append(roomInfo);

    // chat box
    const messageContainer = document.createElement("ul");
    messageContainer.id = "messageContainer";
    messageContainer.classList.add("list-group");
    messageContainer.style.minHeight = "20%";
    messageContainer.style.maxHeight = "20%";
    messageContainer.style.overflow = "scroll";

    const messageInput = document.createElement("input");
    messageInput.id = "messageInput";
    messageInput.classList.add("form-control");
    messageInput.type = "text";
    messageInput.placeholder = "Enter message";

    const messageSend = document.createElement("button");
    messageSend.id = "messageSend";
    messageSend.classList.add("btn", "btn-dark", "form-control");
    messageSend.type = "submit";
    messageSend.textContent = "Send";

    const messageForm = document.createElement("form");
    messageForm.id = "messageForm";
    messageForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const message = messageInput.value;
      if (message === "") return;
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
    appendMessage(`${message}`);
  });

  socket.on("video-time-updated", async (time) => {
    video.removeEventListener("seeked", seekHandler);
    video.currentTime = time;
  });

  socket.on("play", () => {
    video.play();
  });

  socket.on("pause", () => {
    video.pause();
  });
};

function appendMessage(message) {
  const time = new Date().toLocaleTimeString();

  const messageElement = document.createElement("li");
  messageElement.classList.add("list-group-item");
  messageElement.textContent = "[" + time + "]: " + message;

  const messageContainer = document.getElementById("messageContainer");
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight; // scroll to end of list
}

const initRoomControls = async () => {
  // username
  const usernameInput = document.createElement("input");
  usernameInput.id = "usernameInput";
  usernameInput.classList.add("form-control");
  usernameInput.type = "text";
  usernameInput.placeholder = "Enter user name";
  usernameInput.style.marginBottom = "50px";

  const usernameDiv = document.createElement("div");
  usernameDiv.id = "usernameDiv";
  usernameDiv.append(usernameInput);

  // room list
  const roomListUl = document.createElement("ul");
  roomListUl.id = "roomListUl";
  roomListUl.classList.add("list-group");

  // new room
  const newRoomTextField = document.createElement("input");
  newRoomTextField.id = "newRoomTextField";
  newRoomTextField.classList.add("form-control");
  newRoomTextField.type = "text";
  newRoomTextField.placeholder = "Enter room name";

  const newRoomButton = document.createElement("button");
  newRoomButton.id = "newRoomButton";
  newRoomButton.classList.add("btn", "btn-dark", "form-control");
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
  roomControlsDiv.append(roomListUl);
  roomControlsDiv.append(newRoomDiv);

  const leftPanel = document.getElementsByClassName("player-panel-l")[0];
  leftPanel.id = "leftPanel";
  leftPanel.append(roomControlsDiv);
  leftPanel.style.display = "flex";
  leftPanel.style.flexDirection = "column";
  leftPanel.style.justifyContent = "flex-start";
};

const initListeners = async () => {
  video.addEventListener("play", playHandler);
  video.addEventListener("pause", pauseHandler);
  video.addEventListener("seeked", seekHandler);
};

const init = async () => {
  recordingId = window.__data__.recordingId;

  initSockets();
  initRoomControls();
  initListeners();

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
