import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

const rooms = {};

io.on("connection", (socket) => {
  // video player
  socket.on("player.play", ({ roomId }) => {
    socket.broadcast.to(roomId).emit("player.play");
  });

  socket.on("player.pause", ({ roomId }) => {
    socket.broadcast.to(roomId).emit("player.pause");
  });

  socket.on("player.seekTo", ({ roomId, time }) => {
    const data = { time: time };
    socket.broadcast.to(roomId).emit("player.seekTo", data);
  });

  // room controls
  socket.on("room-controls-fetch-rooms", ({ recordingId }) => {
    const tmpRooms = [];

    for (const roomId in rooms) {
      const tmpRecordingId = roomId.split(";")[0];
      if (tmpRecordingId === recordingId) {
        const tempName = rooms[roomId].name;
        tmpRooms.push(tempName);
      }
    }

    const data = { rooms: tmpRooms };
    socket.emit("room-controls-fetch-rooms", data);
  });

  socket.on("room-controls-new-room", ({ roomId, roomName, userName }) => {
    rooms[roomId] = { name: roomName, users: {} };
    rooms[roomId].users[socket.id] = userName;

    const data = { roomName: roomName };
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("room-controls-new-room", data);
  });

  socket.on("fetch-rooms-broadcast", (recordingId) => {
    if (!(recordingId in recordings)) {
      recordings[recordingId] = [];
    }
    socket.broadcast.emit("fetch-rooms-broadcast", recordings[recordingId]);
  });

  socket.on("join-room", (data) => {
    const { recordingId, roomName, userName } = data;
    for (let room of recordings[recordingId]) {
      if (room.name === roomName) {
        room.users.push({ userName, socketId: socket.id });
      }
    }
    socket.join(recordingId + roomName);
    socket.emit("join-room", data);
  });

  socket.on("send-chat-message", (data) => {
    const { recordingId, roomName, message } = data;
    for (let room of recordings[recordingId]) {
      if (room.name === roomName) {
        for (let user of room.users) {
          if (user.socketId == socket.id)
            socket.broadcast
              .to(recordingId + roomName)
              .emit("chat-message", { username: user.userName, message });
        }
      }
    }
  });

  socket.on("video-time-updated", (data) => {
    const { recordingId, roomName, time } = data;
    socket.to(recordingId + roomName).emit("video-time-updated", time);
    console.log(recordingId + roomName, time);
  });

  socket.on("play", (data) => {
    const { recordingId, roomName } = data;
    socket.to(recordingId + roomName).emit("play");
    console.log(`play broadcasted to ${recordingId + roomName}`);
  });

  socket.on("pause", (data) => {
    const { recordingId, roomName } = data;
    socket.to(recordingId + roomName).emit("pause");
    console.log(`pause broadcasted to ${(recordingId, roomName)}`);
  });
});

httpServer.listen(3000);
