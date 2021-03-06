$(document).ready(function(){
  $('#myModal').modal({backdrop: 'static', keyboard: false});
  var socket = io();

  $('form').submit(function(){
    socket.emit('chat message', $('#message').val());
    $('#message').val('');
    return false;
  });

  $('#btn-modal').click(function(){
    if($('#username').val() && $('#state').val()){
        socket.emit('new user', $('#username').val(), $('#state').val(), $('input[name=avatar]:checked').val());
        $('#username').val("");
        $('#state').val("");
        $('#radio-default').prop("checked", true);
        $('#message').focus();
    }else{
      return false;
    }
  });

  $("#username, #state").keyup(function(e){ 
    if(e.keyCode==13){
      e.preventDefault();
      if($('#username').val() && $('#state').val()){
        socket.emit('new user', $('#username').val(), $('#state').val(), $('input[name=avatar]:checked').val());
        $('#myModal').modal("hide");
        $('#username').val("");
        $('#state').val("");
        $('#radio-default').prop("checked", true);
      }
    }
  });

  function checkWriting () {
    timer = setInterval(function(){
        socket.emit('end writing');
        clearTimeout(timer);
        timer = false;
      }, 1000);
  }

  var timer = false;

  $("#message").keyup(function(e){ 
    if (!timer) {
      socket.emit('writing');
      checkWriting();
    }else{
      clearTimeout(timer);
      checkWriting();
    }
  });

  socket.on('new user joined', function(username){
    if (username !== null) {
      $('#list-messages').append($('<li class="new-user-message">').text(username + " se ha conectado"));
    }
  });
  socket.on('delete user', function(user){
    if (user !== null) {
      $('#list-messages').append($('<li class="delete-user-message">').text(user[0] + " se ha desconectado"));
    }
  });

  socket.on('user info', function(user){
    if (user !== null) {
      $('#label-username').text(user[0]);
      $('#label-state').text(user[1]);
      $('#user-avatar').attr({src: user[2], hidden: false});
    }
  });

  socket.on('list user', function(users){
    $('#list-users').empty();
    for (var key in users) {
      if (key != socket.id) {
        $('#list-users').append($('<li>'));
        $('#list-users li:last-child').append($('<img src="' + users[key][2] +'">'));
        $('#list-users li:last-child').append($('<label>&nbsp;' + users[key][0] + '</label><br>'));
        $('#list-users li:last-child').append($('<i> ' + users[key][1] + '</i>'));
        $('#list-users li:last-child').append($('<p id="' + key + '"></p>'));
      }
    }
  });

  socket.on('chat message', function(msg, username, id){
    var time = new Date($.now());
    if (id == socket.id) {
      $('#list-messages').append($('<li class="own-message">').text(username + ": " + msg));
    }else{
      $('#list-messages').append($('<li>').text(username + ": " + msg));
    }
  });

  socket.on('writing', function(id){
    $('#' + id).text("...");
  });

  socket.on('end writing', function(id){
    $('#' + id).text("");
  });
  
  socket.on('disconnect', function(users){
    $('#list-users').empty();
    for (var key in users) {
      if (key != socket.id) {
        $('#list-users').append($('<li>'));
        $('#list-users li:last-child').append($('<img src="' + users[key][2] +'">'));
        $('#list-users li:last-child').append($('<label>&nbsp;' + users[key][0] + '</label><br>'));
        $('#list-users li:last-child').append($('<i>' + users[key][1] + '</i>'));
        $('#list-users li:last-child').append($('<p id="' + key + '"></p>'));
      }
    }
  });
});