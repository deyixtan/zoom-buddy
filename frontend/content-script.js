const SERVER_URL = "http://localhost:3000/";

let socket = null;

const initSocket = async () => {
  socket = io(SERVER_URL);

  socket.on("test", (test) => console.log(test));
  socket.emit("test", "Browser: Hello World");
  console.log('asda')
};

(async () => {
  window.addEventListener("load", initSocket);
})();
