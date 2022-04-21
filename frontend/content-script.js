const SERVER_URL = "http://localhost:3000/";
let socket = null;
let video = null;
let recordingId = null;
let roomName = null;
let userName = null;

const seekHandler = (event) => {
  socket.emit("video-time-updated", {
    recordingId,
    roomName,
    time: event.target.currentTime,
  });
};

const playHandler = (event) => {
  socket.emit("play", { recordingId, roomName });
};

const pauseHandler = (event) => {
  socket.emit("pause", { recordingId, roomName });
};

const setUpChatBox = async () => {
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
    appendMessage(userName, message);
    messageInput.value = "";
  });

  messageForm.append(messageInput);
  messageForm.append(messageSend);

  const leftPanel = document.getElementById("leftPanel");
  leftPanel.append(messageContainer);
  leftPanel.append(messageForm);
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
    setUpChatBox();
  });

  socket.on("chat-message", (data) => {
    const { username, message } = data;
    appendMessage(username, message);
  });

  socket.on("video-time-updated", async (time) => {
    video.removeEventListener("seeked", seekHandler);
    video.currentTime = time;
  });

  socket.on("play", () => {
    if (video.networkState == 1) {
      video.play();
    }
  });

  socket.on("pause", () => {
    if (video.networkState == 1) {
      video.pause();
    }
  });
};

function appendMessage(username, message) {
  const time = new Date().toLocaleTimeString();

  const messageElement = document.createElement("li");
  messageElement.classList.add("list-group-item");
  messageElement.textContent = "[" + time + "] " + username + ": " + message;

  const messageContainer = document.getElementById("messageContainer");
  messageContainer.append(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight; // scroll to end of list
}


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
