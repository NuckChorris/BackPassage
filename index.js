var net = require('net');

var parser = exports.parser = function (socket) {
	var events = new process.EventEmitter();
	events._emit = events.emit;

	var callbacks = {};

	var i = 0; // incremental message IDs

	var send = function (event, id, payload) {
		var args = Array.prototype.slice.apply(arguments);
		socket.write(JSON.stringify(args) + "\0");
	};

	events.emit = function (event, payload, fn) {
		var args = Array.prototype.slice.apply(arguments);
		var id = i++;
		args = [args[0], id].concat(args.slice(1));


		if (args[0] === 'newListener') {
			args.pop();
		} else if (typeof args[args.length-1] === 'function') {
			callbacks[args[0].toLowerCase()+'_'+id] = args.pop();
		}
		send.apply(null, args);
	}

	var buf = '';

	var doThing = function (data) {
		var data = JSON.parse(data);

		var ev = data.shift();
		var id = data.shift();
		data.unshift(ev);


		var callback = callbacks[ev.toLowerCase() + '_' + id];
		if (callback) {
			callback.apply(null, data);
		}

		data.push(function reply (payload) {
			var args = Array.prototype.slice.apply(arguments);
			send.apply(null, [ev, id].concat(args));
		});

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

	events.socket = socket;

	return events;
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