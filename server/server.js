var http = require("http").Server(app);
var io = require('socket.io')(http);
var express = require ('express');
var path = require ('path');
var app = express();

var port = io.listen(app.listen(process.env.PORT || 3000));

app.use(express.static(path.join(__dirname,"../public")));

var users = {};

io.on('connection', function(socket){
  socket.on('new user', function(username,state,img){
    console.log('a user connected: ' + socket.id + username);
    var usernameAvailable = true;
    for (var key in users){
      if (users[key][0] == username) {
        usernameAvailable = false;
        break;
      }
    }
    if (usernameAvailable) {
      console.log('disponible');
    }else{
      console.log('ocupado');
    }
    users[socket.id] = [username,state,img];
    socket.emit('user info',users[socket.id]);
    io.emit('list user', users);
    socket.broadcast.emit('new user joined', username);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected: ' + socket.id);
    socket.broadcast.emit('delete user', users[socket.id]);
    delete users[socket.id];
    io.emit('disconnect', users);
  });
  
  socket.on('chat message', function(msg){
    io.emit('chat message', msg, users[socket.id][0], socket.id);
  });

  socket.on('writing', function(){
    io.emit('writing', socket.id);
  });

  socket.on('end writing', function(){
    io.emit('end writing', socket.id);
  });
});