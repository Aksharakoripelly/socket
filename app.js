var express = require('express');
const http = require("http");

var app = express();
const server = http.createServer(app);

const {Server} = require('socket.io');

const io = new Server(server, {
  cors: {
      origin: "*",
      methods: ["GET", "POST"]
  }
});

var path = require('path');

app.use(express.static(path.join(__dirname,'./public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


var name;
const PORT = 5002

io.on('connection', (socket) => {
  console.log('new user connected');
  socket.emit("Welcome", "Welcome to spacecode Your socket ID is " + socket.id)

  socket.on('joining msg', (username) => {
  	name = username;
    console.log(name + "socket Id is: " + socket.id)
  	io.emit('chat message', `---${name} joined the chat---`);
    io.emit("name",name + "socket Id is: " + socket.id)
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chat message', `---${name} left the chat---`);
    
  });
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', msg);
  });
});

server.listen(PORT, () => {
  console.log('Server listening on :'+PORT);
});

