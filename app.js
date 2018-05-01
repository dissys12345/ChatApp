var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
   res.sendfile('index.html');
});

users = [];
var userdict = {};
io.on('connection', function(socket) {
   console.log('A user connected');
   socket.on('setUsername', function(data) {
      console.log(data);
      console.log(users.length)
      if(users.indexOf(data) > -1) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push(data);
         socket.emit('userSet', {username: data});
         userdict[data] = socket.id;
         console.log("socket id : " + socket.id + " is mapped to username : " + data);
      }
   });
   
   socket.on('selectGroup', function(data){
      console.log("event groupid");
      console.log("group = " + data.group);
      socket.join(data.group);
      console.log(data.username +" joins group "  +data.group);
      io.sockets.in(data.group).emit('newmsg',{message:data.username +" joins group "  +data.group, user:""});
      socket.emit('connectToRoom', "joined group " + data.group)
   });

   socket.on('msg', function(data) {
      //Send message to everyone
      io.sockets.in(data.group).emit('newmsg', data);

   });
});

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});