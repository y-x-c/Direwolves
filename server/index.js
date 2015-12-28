/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

global.clients = [];
global.docs = {};

const electron = require('electron');
const electronApp = electron.app;
const BrowserWindow = electron.BrowserWindow;

var Socket = require('./socket');

var socket = new Socket('0.0.0.0', '8888');

socket.start();

//////

var mainWindow = null;

electronApp.on('window-all-closed', function() {
    client.end();
    electronApp.quit();
});

electronApp.on('ready', function() {
    global.mainWindow =  mainWindow = new BrowserWindow({width: 300, height: 180});

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});

