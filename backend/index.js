import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("test", (test) => {
    console.log(test);
    socket.broadcast.emit("test", "Server: Hello World");
  });
});

httpServer.listen(3000);
