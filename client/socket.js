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
    constructor(callback, host, port) {
        var self = this;

        this.host = host || DEFAULT_HOST;
        this.port = port || DEFAULT_PORT;

        this.socket = new net.Socket();
        this.socket.callback = callback;
        this.sendData = function(data) {
            data = data.length + ' ' + data;
            this.socket.write(data);
        };
    }

    start() {
        var socket = this.socket;

        socket.connect(this.port, this.host, function() {
            console.log('server connected');

            socket.buffer = '';
            socket.sepIdx = -1;

            socket.on('data', function(data) {
                socket.buffer += data;
                console.log('buffer', socket.buffer);

                function readComplete() {
                    if(socket.sepIdx < 0) socket.sepIdx = socket.buffer.search(/ /);

                    if(socket.sepIdx < 0) return false;

                    var expected = parseInt(socket.buffer.substr(0, socket.sepIdx));

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
        })
    }
};
