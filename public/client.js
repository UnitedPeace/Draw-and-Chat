'use strict';

$(document).ready(function () {
	var socket = io();
	var canvas = document.getElementById('board');
	var brushColor = document.getElementById('brushColor');
	var context = canvas.getContext('2d');
	var offsetX = canvas.offsetLeft,
		offsetY = canvas.offsetTop;
	var toggle = $('.chat-head img');
	var chatText = $('.chat-text textarea');

	//Set default brush color
	var current = {
		color: 'rgb(204, 102, 255)'
	};
	var drawing = false;

	socket.on('draw', onDrawEvent);

	socket.on('clear_canvas', onClearCanvas);

	socket.on('chat_message', onChatMessage);

	//Register event listeners
	toggle.on('click', function () {
		var src = toggle.attr('src');

		$('.chat-body').slideToggle('fast');
		if (src == 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_down-16.png') {
			toggle.attr('src', 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_up-16.png');
		} else {
			toggle.attr('src', 'https://maxcdn.icons8.com/windows10/PNG/16/Arrows/angle_down-16.png');
		}
	});

	chatText.keypress(function (event) {
		var $this = $(this);
		if (event.keyCode == 13) {
			var msg = $this.val();
			socket.emit('chat_message', msg);
			$this.val('');
		}
	});

	$(".jscolor").change(function () {
		current.color = brushColor.style.backgroundColor;
	});

	$("#clearCanvas").click(function () {
		socket.emit('clear_canvas', true);
	});

	$(window).resize(function () {
		offsetX = canvas.offsetLeft, offsetY = canvas.offsetTop;
	});

	$(canvas).on('touchstart mousedown', function (e) {
		if (e.type == 'touchstart') {
			var changedTouch = event.changedTouches[0];
			e.clientX = changedTouch.clientX;
			e.clientY = changedTouch.clientY
		}
		drawing = true;
		current.x = e.clientX - offsetX;
		current.y = e.clientY - offsetY;
	});

	$(canvas).on('touchend mouseup', function (e) {
		if (!drawing) {
			return;
		}
		if (e.type == 'touchend') {
			var changedTouch = event.changedTouches[0];
			e.clientX = changedTouch.clientX;
			e.clientY = changedTouch.clientY
		}
		drawing = false;
		draw(current.x, current.y, e.clientX - offsetX, e.clientY - offsetY, current.color, true);
	});

	$(canvas).on('touchmove mousemove', function (e) {
		if (!drawing) {
			return;
		}
		if (e.type == 'touchmove') {
			var changedTouch = event.changedTouches[0];
			e.clientX = changedTouch.clientX;
			e.clientY = changedTouch.clientY
		}
		draw(current.x, current.y, e.clientX - offsetX, e.clientY - offsetY, current.color, true);
		current.x = e.clientX - offsetX;
		current.y = e.clientY - offsetY;
	});

	//Incoming draw event
	function onDrawEvent(data) {
		draw(data.x0, data.y0, data.x1, data.y1, data.color);
	}

	//Clean the canvas
	function onClearCanvas(data) {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	function onChatMessage(msg) {
		$('.msg-insert').append("<div class='msg-send'>" + msg + "</div>");
		$('.chat-body').animate({
			scrollTop: $(".chat-body")[0].scrollHeight
		}, 100);
	}

	function draw(x0, y0, x1, y1, color, send) {
		context.beginPath();
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.strokeStyle = color;
		context.lineWidth = 2;
		context.stroke();
		context.closePath();

		if (!send) {
			return;
		}

		socket.emit('draw', {
			x0: x0,
			y0: y0,
			x1: x1,
			y1: y1,
			color: color
		});
	}

});
