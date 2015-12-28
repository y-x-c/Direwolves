/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

const ipc = require('ipc');

const Changeset = require('changesets').Changeset;
const dmp = require('diff_match_patch'),
    engine = new dmp.diff_match_patch;

var app = angular.module('direwolves');

app.service('Doc', function($interval) {
    var self = this;
    this.text = '';
    var A = '', X;

    init();

    this.join = function(docid) {
        send({type: 'join',
              docid: docid || 0});
    };

    function recvBroadcast(cmd) {
        if(cmd.version != self.version + 1) {
            console.warn('broadcast version error: local', self.version, 'server', cmd.version);
        }
        self.version = cmd.version;

        var chgset = Changeset.unpack(cmd.chgset);

        var nA = chgset.apply(A),
            nX = X && X.transformAgainst(chgset);

        var XY = Changeset.fromDiff(engine.diff_main(A, self.text)),
            D = chgset.transformAgainst(XY);

        A = nA, X = nX, self.text = D.apply(self.text);
    }

    function submitChgset() {
        if(X || A == self.text) return;

        var chgset = Changeset.fromDiff(engine.diff_main(A, self.text));
        var data = {
            type: 'submitChgset',
            chgset: chgset.pack(),
            version: self.version
        };

        X = chgset;

        send(data);
    }

    function recvACK(cmd) {
        if(cmd.version != self.version + 1) {
            console.warn('ACK version error: local', self.version, 'server', cmd.version);
        }
        self.version = cmd.version;
        A = X.apply(A);
        X = null;
    }

    function joined(cmd) {
        self.version = cmd.version;
        A = self.text = cmd.text;
    }

    function init() {
        ipc.on('cmd-recv', function(cmd) {
            console.log('cmd-recv', cmd);
            switch (cmd.type){
                case 'broadcastChgset':
                    recvBroadcast(cmd);
                    break;
                case 'ACK':
                    recvACK(cmd);
                    break;
                case 'joined':
                    joined(cmd);
                    break;
            }
        });


        var period = $interval(function() {
            submitChgset();
        }, 500);
    }

    function send(cmd) {
        ipc.send('cmd-send', cmd);
    }
});