# sockit
A Node.js TCP/TLS communications system styled after socket.io, aimed at bidirectional inter-server communications.

**>>> UNSTABLE <<<**

## Install
*(soon, but not yet)*

	$ npm install server.io

## Test
I haven't written the tests yet, but they will be written using [Mocha](https://github.com/visionmedia/mocha) and [Should](https://github.com/visionmedia/should.js).

## Use
Using this is incredibly easy simple, having an API based on a mixture of EventEmitters and TCP Sockets.

## Example
The following example shows the two ends of a connection, the client and server, setting up a connection, then creating an annoying feedback loop.

### Server Server
```javascript
var sockit = require('sockit');

sockit.createServer(function (socket) {
	console.log('connected');
	socket.on('foo', function () {
		socket.emit('bar');
	});
}).listen(4567);
```

### Client Server
```javascript
var sockit = require('sockit');
var client = sockit.createConnection(4567);

client.emit('foo');
client.on('bar', function () {
	client.emit('foo');
});