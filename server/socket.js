/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

var net = require('net');
var Client = require('./client');

const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = '8888';

module.exports = class Socket {
    constructor(host, port) {
        var self = this;

        this.host = host || DEFAULT_HOST;
        this.port = port || DEFAULT_PORT;

        this.server = net.createServer(function (socket) {
            console.log('client connected');

            var client = new Client(socket);
            global.clients.push(client);

            socket.buffer = '';
            socket.sepIdx = -1;

            socket.on('data', function(data) {
                socket.buffer += data;

                function readComplete() {
                    if(socket.sepIdx < 0) socket.sepIdx = socket.buffer.search(/ /);

                    if(socket.sepIdx < 0) return false;

                    var expected = parseInt(socket.buffer.substr(0, socket.sepIdx));

                    console.log('parse', socket.buffer.substr(socket.sepIdx + 1, expected));
                    if(expected + socket.sepIdx < socket.buffer.length) {
                        var cmd = JSON.parse(socket.buffer.substr(socket.sepIdx + 1, expected));
                        socket.buffer = socket.buffer.substr(socket.sepIdx + expected + 1).replace(/^\s+/, '');
                        socket.sepIdx = -1;

                        socket.callback(cmd);
                        return true;
                    }

                    return false;
                }

                while(readComplete());
            });

            socket.on('error', function() {
                console.warn('socket of client', this.id, 'error');

                for(var i = 0; i < global.clients.length; i++) {
                    if(global.clients[i].id == this.id) {
                        global.clients[i].end(i);
                        break;
                    }
                }
            });

            socket.sendData = function(data) {
                data = data.length + ' ' + data;
                console.log('send', data);
                socket.write(data);
            };

        });
    }

    start() {
        var self = this;
        this.server.listen(this.port, this.host, function() {
            var address = self.server.address();
            console.log("opened server on %j", address);
        });
    }
}
