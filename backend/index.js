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
    socket.emit("create-room", data);
  });

  socket.on("join-room", (data) => {
    const { recordingId, roomName, userName } = data;
    for (let room of recordings[recordingId]) {
      if (room.name === roomName) {
        room.users.push({ userName, socketId: socket.id });
      }
    }
    socket.emit("join-room", data);
  });
});

httpServer.listen(3000);
