/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

var Changeset = require('changesets').Changeset;
var dmp = require('diff_match_patch'),
	engine = new dmp.diff_match_patch;

module.exports = function Doc() {
    var self = this;

    (function() {
        self.clients = [];
        self.text = "";
        self.chgsets = [];
        self.version = 0;
    })();

    self.applyChgset = function(client, chgset, version) {
        // adapt chgset to newest version
        for(var i = version + 1; i < self.chgsets.length; i++) {
            chgset = chgset.transformAgainst(self.chgsets[i]);
        }

        // save chgset
        self.version++;
        self.chgsets.push(chgset);

        // apply to cached text
        self.text = chgset.apply(self.text);

        // broadcast to clients
        var data = {
            type: 'broadcastChgset',
            chgset: chgset.pack(),
            version: self.version
        };

        for(var i = 0; i < self.clients.length; i++) {
            if(self.clients[i].id == client.id) continue;

            self.clients[i].sendData(JSON.stringify(data));
        }

        // ACK
        client.ACKChgset(self.version);
    };

    // new client joins self doc
    self.join = function(client) {
        self.clients.push(client);

        var data = {
            type: 'joined',
            text: self.text,
            version: self.version
        };

        client.sendData(JSON.stringify(data));
    };

    self.leave = function(client) {
        for(var i = 0; i < self.clients.length; i++) {
            if(self.clients[i].id == client.id) {
                self.clients.splice(i, 1);
                break;
            }
        }
    }
};
