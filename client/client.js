/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

const Socket = require('./socket');
const ipc = require('electron').ipcMain;

module.exports = class Client {
    constructor() {
        var self = this;

        ipc.on('cmd-send', function(event, data) {
            console.log('send', data);
            data = JSON.stringify(data);
            self.socket.sendData(data);
        });
    }

    end() {
        var data = {
            type: 'end'
        };
        this.socket.sendData(JSON.stringify(data));
    }

    connect(host, port) {
        this.socket = new Socket(this.onCmd, host, port);
        this.socket.start();
    }

    onCmd(cmd) {
        global.mainWindow.webContents.send('cmd-recv', cmd);
    }
};

