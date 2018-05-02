var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var io      = require('socket.io')(server);
require('jsdom/lib/old-api').env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }

    var $ = require("jquery")(window);
});

//Add recent chats to messages array
var messages  = [];
var prevChats = 10;
var storeMessage = function(name, data){
  messages.push({name: name, data: data});
  if (messages.length > prevChats) {
    messages.shift();
  }
};

//Setup the app with Express
app.use(express.static(__dirname + '/public'));

users = [];
var userdict = {};
var messages  = [];
var index;
var storeMessage = function(name, data){
  messages.push({name: name, data: data});
};

var id = users.length + 1;
var found;

io.on('connection', function(socket) {
   console.log('ABC user connected');
   socket.on('setUsername', function(data) {
      found = users.some(function (el) {
        return el.username === data;
      });       
      if(found) {
         socket.emit('userExists', data + ' username is taken! Try some other username.');
      } else {
         users.push({ id: socket.id, username: data});
         userdict[socket.id] = data;
      }
      console.log(data);
      console.log(users.length);    
   });
   
   socket.on('selectGroup', function(data){
      socket.join(data.group);
      io.in(data.group).emit('newmsg',{user: data.user, msg:" has joined group "  +data.group, group: data.group});

      socket.on('disconnect', function(){
        io.in(data.group).emit('newmsg', data.user + ' has left the chat');
        index = users.map(function(e) { return e.username; }).indexOf(data.user);
        console.log('index of '+data.user+': '+index);
        if (index > -1) {
          users.splice(index, 1);
          console.log(data.user+' has deleted');
        }        
        console.log(data.user + ' has left the chat');
      });         
   });

   socket.on('newmsg', function(data) {
      //Send message to everyone
      console.log(data.user+' group '+data.group);
      io.in(data.group).emit('newmsg', {user: data.user, msg: data.msg, group: data.group});
       storeMessage(data.user, data.msg);
       console.log(data.user + ': ' + data.msg);
   });

   socket.on('leaveGroup', function(data){
      io.in(data.group).emit('newmsg',{user: data.user, msg:" left group "  +data.group, group: data.group});
      console.log('willleave');
      socket.leave(data.group);
      socket.emit('reconnect', data.user);
   });

});

server.listen(process.env.PORT || 3000);