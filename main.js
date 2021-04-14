const { app, BrowserWindow, ipcMain } = require('electron')
// const  electronInstaller  =  require ( 'electron-winstaller' ) ;

const url = require("url");
const path = require("path");
const { PosPrinter } = require("electron-pos-printer");
//import * as path from "path";

const options = {
  preview: true,
  width: '71000px',       
  margin: '0 0 0 0',    
  copies: 2,
  printerName: 'Diebold',
  timeOutPerLine: 400,
  pageSize: { height: 301000, width: 71000 } // page size
};

let win;

function createWindow () {
    //Create the browser window.
    win = new BrowserWindow({ 
    width:600,
    height:600,
    backgroundColor: '#ffffff',
    webPreferences: {
      nodeIntegration: true,
    }
    //icon
    })

     win.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
    
   //mainWindow.loadFile('index.html');

    // open the DevTools.
    //win.webContents.openDevTools()

    // Event when the window is closed.
    win.on('closed',function (){
        win = null
    })
}

ipcMain.on('print', (event, arg) => {
	const data = JSON.parse(arg);
	
	PosPrinter.print( data, {
    printerName: 'Diebold Procomp IM453HU_A',
    preview: false,
    width: '250px',
    margin: '10px 0 10px 0',
    copies: 1,
    silent: true,
    timeOutPerLine: 1000,
    pageSize: { height: 301000, width: 71000 }
  })
	.then(() => {})
    .catch((error) => {
      console.error(error);
  });
})

// Create window on electron initialization
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
})
/*try  { 
  await  electronInstaller . createWindowsInstaller ( { 
    appDirectory : '/ tmp / build / my-app-64' , 
    outputDirectory : '/ tmp / build / installer64' , 
    autores : 'My App Inc.' , 
    exe : 'myapp.exe' 
  } ) ; 
  console . log ( 'Funcionou!' ) ; 
}  catch  ( e )  {
  console . log ( `Sem dados: $ { e . mensagem } ` ) ; 
}
// Module to control application life. (this variable should already exist)
const app = electron.app

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}
function handleSquirrelEvent(application) {
  if (process.argv.length === 1) {
      return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
      let spawnedProcess, error;

      try {
          spawnedProcess = ChildProcess.spawn(command, args, {
              detached: true
          });
      } catch (error) {}

      return spawnedProcess;
  };

  const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
          // Optionally do things such as:
          // - Add your .exe to the PATH
          // - Write to the registry for things like file associations and
          //   explorer context menus

          // Install desktop and start menu shortcuts
          spawnUpdate(['--createShortcut', exeName]);

          setTimeout(application.quit, 1000);
          return true;

      case '--squirrel-uninstall':
          // Undo anything you did in the --squirrel-install and
          // --squirrel-updated handlers

          // Remove desktop and start menu shortcuts
          spawnUpdate(['--removeShortcut', exeName]);

          setTimeout(application.quit, 1000);
          return true;

      case '--squirrel-obsolete':
          // This is called on the outgoing version of your app before
          // we update to the new version - it's the opposite of
          // --squirrel-updated

          application.quit();
          return true;
  }
};*/