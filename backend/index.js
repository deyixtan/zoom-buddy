import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

const recordings = {};

io.on("connection", (socket) => {
  socket.on("fetch-rooms", (recordingId) => {
    if (!(recordingId in recordings)) {
      recordings[recordingId] = [];
    }
    socket.emit("fetch-rooms", recordings[recordingId]);
  });

  socket.on("fetch-rooms-broadcast", (recordingId) => {
    if (!(recordingId in recordings)) {
      recordings[recordingId] = [];
    }
    socket.broadcast.emit("fetch-rooms-broadcast", recordings[recordingId]);
  });

  socket.on("create-room", (data) => {
    const { recordingId, roomName, userName } = data;
    recordings[recordingId].push({
      name: roomName,
      users: [{ userName, socketId: socket.id }],
    });
    socket.join(recordingId + roomName)
    socket.emit("create-room", data);
  });

  socket.on("join-room", (data) => {
    const { recordingId, roomName, userName } = data;
    for (let room of recordings[recordingId]) {
      if (room.name === roomName) {
        room.users.push({ userName, socketId: socket.id });
      }
    }
    socket.join(recordingId + roomName)
    socket.emit("join-room", data);
  });

  socket.on("send-chat-message", (data) => {
    const { recordingId, roomName, message } = data;
    socket.broadcast.to(recordingId + roomName).emit("chat-message", message);
  });
  
  socket.on("video-time-updated", (data) => {
    const { recordingId, roomName, time } = data;
    socket.to(recordingId + roomName).emit("video-time-updated", time);
    console.log(recordingId + roomName, time);
  })

  socket.on("play", (data) => {
    const { recordingId, roomName } = data;
    socket.to(recordingId + roomName).emit("play");
    console.log(`play broadcasted to ${recordingId + roomName}`);
  })

  socket.on("pause", (data) => {
    const { recordingId, roomName } = data;
    socket.to(recordingId, roomName).emit("pause");
    console.log(`pause broadcasted to ${recordingId, roomName}`);
  })
});

httpServer.listen(3000);
