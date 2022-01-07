const io = require("socket.io")(3000, {
  cors: {
    origin: "*",
  },
});

const users = {};

io.on("connection", (socket) => {
  socket.on("new-user", (name) => {
    users[socket.id] = name;
    socket.broadcast.emit("new-user", name);
    console.log(name);
  });

  socket.on("video-time-updated", (time) => {
    socket.broadcast.emit("video-time-updated", time);
    console.log(time);
  });

  socket.on("send-chat-message", (message) => {
    socket.broadcast.emit("chat-message", {
      message: message,
      name: users[socket.id],
    });
  });
});
