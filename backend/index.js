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
    socket.join(`${recordingId}-${roomName}`);
  });

  socket.on("join-room", (data) => {
    const { recordingId, roomName, userName } = data;
    for (let room of recordings[recordingId]) {
      if (room.name === roomName) {
        room.users.push({ userName, socketId: socket.id });
      }
    }
    socket.emit("join-room", data);
    socket.join(`${recordingId}-${roomName}`);
  });

  socket.on("video-time-updated", (data) => {
    const { time, room } = data;
    socket.to(room).emit("video-time-updated", time);
    console.log(room, time);
  })

  socket.on("play", (room) => {
    socket.to(room).emit("play");
    console.log(`play broadcasted to ${room}`);
  })

  socket.on("pause", (room) => {
    socket.to(room).emit("pause");
    console.log(`pause broadcasted to ${room}`);
  })
});

httpServer.listen(3000);
