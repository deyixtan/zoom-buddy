const SERVER_URL = "http://localhost:3000/";
//const SERVER_URL = "http://e155-138-75-22-3.ngrok.io/" // << if you wanna host it remotely and test
const ZOOM_REC_URL = "https://nus-sg.zoom.us/rec/play/";

let socket = null;
let video = null;

// Need to be rewritten
// ********************************************
let isPlaying = true;

const test = (event) => {
  socket.emit("video-time-updated", event.target.currentTime);
};

// Play video function
async function playVid() {
  if (video.paused && !isPlaying) {
    return video.play();
  }
}

// Pause video function
function pauseVid() {
  if (!video.paused && isPlaying) {
    video.pause();
  }
}

// *******************************************

const initSocket = async () => {
  // connect to server
  socket = io(SERVER_URL);

  // set up socket handlers
  socket.on("new-user", (name) => console.log(name));
  socket.on("video-time-updated", async (time) => {
    video.removeEventListener("seeked", test);
    video.currentTime = time;
    setTimeout(async () => {
      video.addEventListener("seeked", test);
      await playVid();
    }, 1000);
  });
};

const init = async () => {
  initSocket();

  // On video playing toggle values
  video.onplaying = () => (isPlaying = true);
  // On video pause toggle values
  video.onpause = () => (isPlaying = false);

  video.addEventListener("seeked", test);

  // add chatbox
  const div = document.querySelector(
    "#app > section > div > div.player-panel-l"
  );

  const messageContainer = document.createElement("div");
  messageContainer.id = "message-container";
  const form = document.createElement("form");
  form.id = "send-container";

  form.innerHTML =
    '<input type="text" id="message-input"/>' +
    '<button type="submit" id="send-btn" style="height:50px">Send</button>';
  div.append(messageContainer);
  div.append(form);

  const messageForm = document.getElementById("send-container");
  const messageInput = document.getElementById("message-input");

  function appendMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.innerText = message;
    messageContainer.append(messageElement);
  }

  socket.on("chat-message", (data) => {
    appendMessage(`${data.name}: ${data.message}`);
  });

  socket.on("new-user", (name) => {
    appendMessage(`${name} connected`);
  });

  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const message = messageInput.value;
    socket.emit("send-chat-message", message);
    messageInput.value = "";
  });

  // ask for user name and update server
  const name = prompt("What is your name?");
  appendMessage("You joined");
  socket.emit("new-user", name);

  setTimeout(async () => {
    await playVid();
  }, 1000);
};

const scriptEntryCheck = () => {
  if (!location.href.startsWith(ZOOM_REC_URL)) return;

  video = document.getElementsByTagName("video")[1];
  if (video === null) return;

  init();
};

(async () => {
  window.addEventListener("load", scriptEntryCheck);
})();

// https://stackoverflow.com/questions/36803176/how-to-prevent-the-play-request-was-interrupted-by-a-call-to-pause-error
