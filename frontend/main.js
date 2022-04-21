const SERVER_URL = "http://localhost:3000/";

const joinRoom = (roomName) => {
  const n = document.getElementsByTagName("video").length;
  const video = document.getElementsByTagName("video")[n - 1];

  window.__buddy__["roomId"] = roomId;
  window.__buddy__["player"] = new SocketVideoPlayer(socket, roomId, video);
};

const main = () => {
  window.__buddy__ = {};
  window.__buddy__.socket = io(SERVER_URL);

  renderRoomControls();
  //   joinRoom("");
};

(async () => main())();
