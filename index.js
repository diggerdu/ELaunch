const electron = require('electron');
const {app, BrowserWindow} = electron;
const ipcMain = require('electron').ipcMain
const plugin = require('./plugins')
let mainWin;

function init() {
  const shouldQuit = makeSingleInstance()
  if (shouldQuit) return app.quit()

  app.on('ready', createmainWindow);
  // Quit when all mainWindows are closed.
  app.on('mainWindow-all-closed', () => {
    if (process.platform !== 'darmainWin') {
      app.quit();
    }
  });
  app.on('activate', () => {
    if (mainWin === null) {
      createmainWindow();
    }
  });
  ipcMain.on('exec', (event, args)=>{
    console.log(args);
    plugin.exec(args, (items)=>{
      event.sender.send('execReply', items)
    })
  })
  ipcMain.on('execItem', (event, args)=>{
    console.log(args);
    plugin.execItem(args.cmd, args.item, (ret)=>{
      event.sender.send('execItemReply', ret)
    })
  })
  ipcMain.on('hide',()=>{
    hideWindow()
  })
}

function createmainWindow() {
  mainWin = new BrowserWindow({width: 800, height: 600});
  mainWin.loadURL(`file://${__dirname}/browser/search/index.html`);
//  mainWin.webContents.openDevTools();
  mainWin.on('closed', () => {
    mainWin = null;
  });
}

function hideWindow() {
  mainWin.hide()
}
function makeSingleInstance(){
  return app.makeSingleInstance((commandLine, workingDirectory) => {
    if (mainWin) {
      if (mainWin.isMinimized()) mainWin.restore();
      mainWin.focus();
      plugin.shouldUpdate=true;
    }
  });
}

init()
