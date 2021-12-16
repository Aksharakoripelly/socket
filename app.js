var express = require('express');
const http = require("http");

var app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowEIO3: true,
  }
});

var path = require('path');
const PORT = 5002

app.use(express.static(path.join(__dirname, './public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


var name;
const sockets = []
var users = []


// io.on('connection', (socket) => {

//   console.log('new user connected');
//   socket.emit("Welcome", "Welcome to spacecode Your socket ID is " + socket.id)

//   socket.on('joining msg', (username) => {
//   	name = username;
//     users[name] = socket.id
//     console.log(users,'---------------38')
//     socket.join(name)
//     console.log(name + "socket Id is: " + socket.id)
//   	io.emit('send message', `---${name} joined the chat---`);
//     io.emit('name', name + "socket Id is: " + socket.id)
//     sockets.push(socket.id)
//   });

//   // socket.on('chat message', (msg) => {
//   //   socket.broadcast.emit('chat message', msg);         //sending message to all except the sender
//   // });

//   socket.on('send message', (msg) => {
//     console.log(msg.name,'------50')
//     console.log(msg),
//     console.log(name)
//     console.log(sockets,'---------------------send message')

//     io.sockets.in(sockets).emit('chat',msg)
//   });

//   socket.on('disconnect', () => {
//     console.log(sockets,'---------------------disconnect');
//     console.log('user disconnected');
//     io.emit('send message', `---${name} left the chat---`);
//     sockets.slice()
//   });
// });

// server.listen(PORT, () => {
//   console.log('Server listening on :'+PORT);
// });

// simple '/' endpoint sending a Hello World
// response
app.get("/", (req, res) => {
  const pj = require('./package.json')
  console.log(pj.version)
  res.send("hello world");
});

var roomno = 1;
var usernames = {}
var socketids = [];

io.on("connection", async function (socket) {
  console.log("New user connected " + socket.id);
  socket.emit("Welcome", "welcome to spacecode")
  // socket.join("room-"+roomno);
  // io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);
  socket.on('adduser', function (username) {
    socket.username = username;
    socket.room = 'room1';
    usernames[username] = socket.id;
    console.log(usernames, '-----94')
    socket.join('room1');
    socket.emit('updatechat', 'you have connected to' + `${socket.room}`);
    socket.broadcast.to('room1').emit('updatechat', username + ' has connected to this room');
    io.sockets.emit('updateusers', usernames);
    socketids.push(socket.id)
    console.log(usernames,socketids, '---------100')
    // socket.emit('updaterooms', "your room no is: "+roomno);
  })

  socket.on('chat', function (data) {
    console.log(data + ' sent by ' + socket.username)

    socket.broadcast.to('room1').emit('updatechat', data + ' sent by ' + socket.username); //to send all users in room
  })


  socket.on('sendsinglechat', function (data) {
    // io.sockets.in(socket.room).emit('updatechat', data+" sent by "+socket.username, ); //to send all users including sender
    console.log(usernames[data.receiver], data.receiver, data.msg, socket.username)
    io.sockets.to(usernames[data.receiver]).emit('sendsinglechat', data.msg + 'from' + socket.username) // to send only specific user
    // socket.to(usernames[data.receiver]).emit('sendsinglechat',' Message to specific user '+ data.msg);
  });



  socket.on('disconnect', function () {
    delete usernames[socket.username];
    io.sockets.emit('updateusers', usernames);
    console.log(usernames)
    socket.broadcast.emit('updatechat', socket.username + ' has disconnected');
    socket.leave(socket.room);
  });
});

server.listen(PORT, () => {
  console.log('Server listening on :' + PORT);
});

