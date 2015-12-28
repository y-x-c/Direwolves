/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

const electron = require('electron');
const electronApp = electron.app;
const BrowserWindow = electron.BrowserWindow;

const Client = require('./client');

var mainWindow = null,
    client = null;

electronApp.on('window-all-closed', function() {
    electronApp.quit();
});

electronApp.on('ready', function() {
    global.mainWindow =  mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL('file://' + __dirname + '/index.html');

    mainWindow.webContents.openDevTools();

    client = new Client();

    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
