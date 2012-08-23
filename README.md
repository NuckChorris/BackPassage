[![build status](https://secure.travis-ci.org/NuckChorris/BackPassage.png)](http://travis-ci.org/NuckChorris/BackPassage)
# BackPassage
A Node.js TCP/TLS communications system styled after socket.io, aimed at bidirectional inter-server communications.

Also butts.

**>>> UNSTABLE, MIGHT SHIT ALL OVER <<<**

## Install
*(soon, but not yet)*

	$ npm install backpassage

## Test
I haven't written the tests yet, but they will be written using [Mocha](https://github.com/visionmedia/mocha) and [Should](https://github.com/visionmedia/should.js).

## Use
Using this is incredibly easy, having an API based on a combination of EventEmitters and TCP Sockets.

## Example
The following example shows the two ends of a connection, the client and server, setting up a connection, then creating an annoying feedback loop.

### Server Server
```javascript
var backpassage = require('backpassage');

backpassage.createServer(function (socket) {
	console.log('connected');
	socket.on('probe', function () {
		socket.emit('accept');
	});
}).listen(4567);
```

### Client Server
```javascript
var backpassage = require('backpassage');
var client = backpassage.createConnection(4567);

client.emit('probe');
client.on('accept', function () {
	client.emit('probe');
});