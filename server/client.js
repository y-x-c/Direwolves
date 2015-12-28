/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

const Changeset = require('changesets').Changeset;
const Doc = require('./doc');

var __id = 0;

module.exports = function Client(socket) {
    var self = this;

    (function() {
        self.socket = socket;
        self.socket.id = self.id = ++__id;
        socket.callback = function(cmd) {
            self.onCmd.call(self, cmd);
        }
    })();

    self.onCmd = function(cmd) {
        switch (cmd.type) {
            case 'join':
                self.join(cmd);
                break;
            case 'submitChgset':
                self.submitChgset(cmd);
                break;
            case 'end':
                self.end();
                break;
        }
    };

    self.join = function(cmd) {
        if(!(cmd.docid in global.docs)) {
            global.docs[cmd.docid] = new Doc();
        }
        global.docs[cmd.docid].join(self);
        self.doc = global.docs[cmd.docid];
    };

    self.submitChgset = function(cmd) {
        self.doc.applyChgset(self, Changeset.unpack(cmd.chgset), cmd.version);
    };

    self.ACKChgset = function(version) {
        var data = {
            type: 'ACK',
            version: version
        };
        
        self.socket.sendData(JSON.stringify(data));
    };

    self.sendData = function(data) {
        self.socket.sendData(data);
    };

    self.end = function(idx) {
        if(!idx) {
            for (var i = 0; i < global.clients.length; i++) {
                if (global.clients[i].id == this.id) {
                    idx = i;
                    break;
                }
            }
        }
        global.clients.splice(idx, 1);
        self.doc.leave(self);
        console.log('close connection with client', this.id);
    };
};
