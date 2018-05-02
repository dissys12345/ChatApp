(function($){
  $(function() {

    var socket = io();
    var userName;
    var userId;
    var userConfirm;
    var groupConfirm;
    var userGroup;    
    var nameIden;
    socket.on('connect', function() {
        nameIden = true;
        userName = prompt('Please Enter Your Name: ');
        socket.emit('setUsername', userName);
        socket.on('userExists', function(data) {
          confirm(data);
          socket.emit('connect');
          nameIden = false;
        });
        if(nameIden==true){
          userConfirm = confirm('Your Name: ' + userName);
          userGroup = prompt('Please Enter Group No: ');
          groupConfirm = confirm('Your Name: ' + userName + '\n'
            + 'Group: ' + userGroup);
          if (groupConfirm && userConfirm) {
            socket.emit('selectGroup', {user: userName, group: userGroup});
          }
        }
    });

    $('form').submit(function() {
          socket.emit('newmsg', {user: userName, group:userGroup, msg:$('#message').val()});
          $('#message').val('');
          return false;
        });
    document.getElementById("leave").onclick = leaveGroup;
    function leaveGroup() {
      socket.emit('leaveGroup',{user: userName, group: userGroup});
    }

    socket.on('reconnect', function(data) {
      ;$('#chat-body').empty();
	  userGroup = prompt('Please Enter Group No: ');
      groupConfirm = confirm('Your Name: ' + data + '\n'
        + 'Group: ' + userGroup);
      if (groupConfirm) {
        socket.emit('selectGroup', {user: data, group: userGroup});
      }        
    });

    socket.on('newmsg', function(data) {
      $('#chat-body').append($('<li>').text(data.user+": "+data.msg));
      $('html, body').animate({
        scrollTop: $(document).height()
      });      
    });

  });
})(jQuery);