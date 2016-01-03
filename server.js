var express = require('express'),
	app = express(),
	http = require('http'),
	socketIo = require('socket.io');

// start webserver on port 8080
var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);

// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var draw_history = [];
var message_history = [];

//Generate random username
function username() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for( var i=0; i < 5; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	return text;
}

// handler for incoming connections
io.on('connection', function (socket) {
	socket.name = username();

	// send canvas history
	for (var i in draw_history) {
		socket.emit('draw', draw_history[i]);
	}
	// send message history
	for (var i in message_history) {
		socket.emit('chat_message', message_history[i]);
	}

	socket.on('clear_canvas', function () {
		draw_history.length = 0;
		io.emit('clear_canvas', true);
	});

	// handler for draw event
	socket.on('draw', function (data) {
		// add received line to history
		draw_history.push(data);
		// send line to all clients
		io.emit('draw', data);
	});

	// handler for draw event
	socket.on('chat_message', function (data) {
		data = "<b>"+socket.name +":</b> "+data;
		// add received line to history
		message_history.push(data);
		// send line to all clients
		io.emit('chat_message', data);
	});
});
