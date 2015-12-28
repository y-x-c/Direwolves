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
            case 'init':
                self.init(cmd);
                break;
            case 'submitChgset':
                self.submitChgset(cmd);
                break;
        }
    };

    self.init = function(cmd) {
        if(global.docs.length == 0) {
            var doc = new Doc();
            global.docs.push(doc);
        }
        global.docs[0].join(self);

        self.doc = global.docs[0];
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

    self.end = function() {
        self.doc.leave(self);
    };
};
