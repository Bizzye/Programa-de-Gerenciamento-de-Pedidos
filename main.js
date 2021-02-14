const { app, BrowserWindow, ipcMain } = require('electron')

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
