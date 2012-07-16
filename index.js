var net = require('net');
var _ = require('_');

var parser = exports.parser = function (socket) {
	var events = new process.EventEmitter();
	events._emit = events.emit;

	events.emit = events.send = function (event, params) {
		var args = Array.prototype.slice.apply(arguments);
		socket.write(JSON.stringify(args) + "\0");
	}

	var buf = '';

	var doThing = function (data) {
		var data = JSON.parse(data);

		events._emit.apply(events, data);
	}

	socket.setEncoding('utf8');
	socket.on('data', function (data) {
		var pieces = data.split("\0");
		switch (pieces.length) {
			case 1:
				buf += pieces[0];
				break;
			case 2:
				buf += pieces[0];
				doThing(buf);
				buf = pieces[1];
				break;
			default:
				buf += pieces[0];
				doThing(buf);

				// We're looping through all pieces except the first and last
				for (var i = 1, l = pieces.length -1; i < l; i++) {
					doThing(pieces[i]);
				}
				buf = pieces[pieces.length];
		}
	});

	var obj = _.extend(socket, events);
	obj.socket = socket;

	return obj;
}

exports.createServer = function (opts, fn) {
	if (typeof opts === 'function') fn = opts;

	var socket = net.createServer(function (socket) {
		var obj = parser(socket);

		fn(obj);
	});

	return socket;
};

exports.connect = exports.createConnection = function () {
	var socket = net.createConnection.apply(net, arguments);

	var obj = parser(socket);

	return obj;
};