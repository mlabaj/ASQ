/**
    @fileoverview Socket code for the admin client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

/** Connect back to the server with a websocket */
var connect = function(host, port) {
    var socket = io.connect('http://' + host + ':' + port);
    socket.on('connect', function(event) {
        socket.emit('admin', {});

        /**
          Handle socket event 'new'
          Notifies the admin of a new connection to the presentation.
         */
        socket.on('new', function(event){
            console.log('New viewer connected');
        });
    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:stepgoto", function(event) {
        socket.emit('goto', {slide:event.target.id});
    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:start", function(event) {
        console.log('going to ' + event.target.id);
        socket.emit('impress:start', {});
    });
}