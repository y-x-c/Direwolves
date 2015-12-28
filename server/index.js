/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

global.clients = [];
global.docs = [];

var Socket = require('./socket');

var socket = new Socket('0.0.0.0', '8888');

socket.start();
