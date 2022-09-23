const http = require("http");
const express = require("express");
const app = express();
const port = 8001;
const cors = require("cors");
const bodyParser = require("body-parser");
const bodyParserErrorHandler = require("express-body-parser-error-handler");
app.use(cors());
// app.use(bodyParser.json({ limit: 10000000 })); //設定BODY能承受的大小
// app.use(bodyParser.urlencoded({ limit: "100mb", extended: false }));
// app.use(bodyParserErrorHandler());

const server = http.createServer(app);

const socket = require("socket.io");
const io = socket(server, {
  cors: {
    origin: "http://localhost:3001",
    method: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.status(200).json({ message: "hello" });
});

io.on("connection", (socket) => {
  //經過連線後在 console 中印出訊息
  // console.log(`${socket.id} success connect!`);

  //加入房間
  socket.on("join_room", ({ username, room }) => {
    console.log(username + " 已加入聊天室！");
    socket.join(room);
    socket.in(room).emit("add_room", username + " 已加入聊天室！");
  });

  socket.on("send_message", (data) => {
    const { room, author, message, time } = data;

    //返回指定的room回傳訊息。
    socket.to(room).emit("receive_message", { ...data, id: Date.now() });
  });
  socket.on("leave_room", ({ username, room, time }) => {
    console.log(username + " leave " + room);
    socket.to(room).emit("receive_message", {
      room: room,
      author: username,
      message: `${username} 已離開聊天！`,
      time: time,
    });
    socket.emit("disconnect_room");
  });
  socket.on("disconnect", () => {
    console.log("User Disconnect", socket.id);
  });

  //test

  // socket.on("getMessage", (message) => {
  //   //回傳 message 給發送訊息的 Client
  //   socket.emit("getMessage", message);
  // });
  // socket.on("getMessageAll", (message) => {
  //   io.sockets.emit("getMessageAll", message);
  // });

  // /*回傳給除了發送者外所有連結著的 client*/
  // socket.on("getMessageLess", (message) => {
  //   socket.broadcast.emit("getMessageLess", message);
  // });
});

server.listen(port, () => {
  console.log("The Express server is run on port:" + port);
});
