/**
 * New Room Controls
 */

const renderUserNameField = () => {
  const input = document.createElement("input");
  input.id = "room-controls-username";
  input.classList.add("form-control");
  input.type = "text";
  input.placeholder = "Enter user name";
  input.style.marginBottom = "50px";
  return input;
};

const renderRoomNameField = () => {
  const input = document.createElement("input");
  input.classList.add("form-control");
  input.type = "text";
  input.placeholder = "Enter room name";
  return input;
};

const renderNewRoomButton = () => {
  const button = document.createElement("button");
  button.classList.add("btn", "btn-dark", "form-control");
  button.textContent = "New Room";
  return button;
};

const renderNewRoomForm = (userNameField, roomNameField, newRoomButton) => {
  newRoomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const roomId = window.__data__.recordingId + ";" + roomNameField.value;
    window.__buddy__.roomId = roomId;
    window.__buddy__.socket.emit("room-controls-new-room", {
      roomId: roomId,
      roomName: roomNameField.value,
      userName: userNameField.value,
    });

    // hide container after creating new room
    const roomControls = document.getElementById("room-controls");
    roomControls.style.display = "none";
  });

  const form = document.createElement("form");
  form.append(userNameField, roomNameField, newRoomButton);
  return form;
};

const renderNewRoomControls = () => {
  const userNameField = renderUserNameField();
  const roomNameField = renderRoomNameField();
  const newRoomButton = renderNewRoomButton();
  const newRoomForm = renderNewRoomForm(
    userNameField,
    roomNameField,
    newRoomButton
  );
  return newRoomForm;
};

/**
 * Join Room Controls
 */

const renderJoinRoomList = () => {
  const ul = document.createElement("ul");
  ul.classList.add("list-group");
  return ul;
};

const renderJoinRoomControls = () => {
  const joinRoomList = renderJoinRoomList();

  // fetches all room entries from backend
  window.__buddy__.socket.on("room-controls-fetch-rooms", ({ rooms }) => {
    for (let room of rooms) {
      const button = document.createElement("button");
      button.classList.add("btn", "btn-success");
      button.textContent = "Join";
      button.addEventListener("click", () => {
        window.__buddy__.socket.emit("room-controls-join-room", {
          roomId: window.__data__.recordingId + ";" + room,
          userName: document.getElementById("room-controls-username").value,
        });

        // hide container after creating new room
        const roomControls = document.getElementById("room-controls");
        roomControls.style.display = "none";
      });

      const li = document.createElement("li");
      li.classList.add("list-group-item", "list-group-item");
      li.textContent = room;
      li.append(button);
      joinRoomList.append(li);
    }
  });

  // add entry locally when someone else creates a room
  window.__buddy__.socket.on("room-controls-new-room", ({ roomName }) => {
    const button = document.createElement("button");
    button.classList.add("btn", "btn-success");
    button.textContent = "Join";
    button.addEventListener("click", () => {
      window.__buddy__.socket.emit("room-controls-join-room", {
        roomId: window.__data__.recordingId + ";" + room,
        userName: usernameInput.value,
      });

      // hide container after creating new room
      const roomControls = document.getElementById("room-controls");
      roomControls.style.display = "none";
    });

    const li = document.createElement("li");
    li.classList.add("list-group-item", "list-group-item");
    li.textContent = roomName;
    li.append(button);
    joinRoomList.append(li);
  });

  return joinRoomList;
};

/**
 * room-controls entry point
 */

const renderRoomControls = async () => {
  const newRoomControls = renderNewRoomControls();
  const joinRoomControls = renderJoinRoomControls();

  const roomControls = document.createElement("div");
  roomControls.id = "room-controls";
  roomControls.append(newRoomControls);
  roomControls.append(joinRoomControls);

  const leftPanel = document.getElementsByClassName("player-panel-l")[0];
  leftPanel.style.display = "flex";
  leftPanel.style.flexDirection = "column";
  leftPanel.style.justifyContent = "flex-start";
  leftPanel.append(roomControls);

  const data = { recordingId: window.__data__.recordingId };
  window.__buddy__.socket.emit("room-controls-fetch-rooms", data);
};

// socket.on("room-controls-new-room", (data) => {
//   // room info
//   const roomInfo = document.createElement("p");
//   roomInfo.innerHTML =
//     "\n<strong>Room Name</strong>: " +
//     roomName +
//     "\t<strong>User Name</strong>: " +
//     userName;

//   const leftPanel = document.getElementById("leftPanel");
//   leftPanel.append(roomInfo);

//   // chat box
//   setUpChatBox();

//   // broadcast new room
//   socket.emit("fetch-rooms-broadcast", recordingId);
// });
