class SocketVideoPlayer {
  constructor(socket, roomId, video) {
    if (socket === null || roomId === null || video === null) {
      return null;
    }

    this.socket = socket;
    this.roomId = roomId;
    this.video = video;

    this.initSocketEvents();
  }

  initSocketEvents() {
    this.socket.on("player.play", this.video.play);
    this.socket.on("player.pause", this.video.pause);
    this.socket.on(
      "player.seekTo",
      ({ time }) => (this.video.currentTime = time)
    );
  }

  play() {
    const data = { roomId: this.roomId };
    this.socket.emit("player.play", data);
    this.video.play();
  }

  pause() {
    const data = { roomId: this.roomId };
    this.socket.emit("player.pause", data);
    this.video.pause();
  }

  seekTo(time) {
    const data = { roomId: this.roomId, time: time };
    this.socket.emit("player.seekTo", data);
    this.video.currentTime = time;
  }
}
