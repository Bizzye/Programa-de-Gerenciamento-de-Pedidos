const { app, BrowserWindow, ipcMain } = require('electron')

const url = require("url");
const path = require("path");
const { PosPrinter } = require("electron-pos-printer");
//import * as path from "path";

const print_data = [
 {type: 'text', value: 'Sample text siqhfkjnadfnja', style: 'text-align:center;font-weight: bold'},
 {type: 'text', value: 'Another text asdadfad', style: 'color: #fff'},
 {type: 'barCode', value: 'HB4587896 adasd', height: 12, width: 1, fontsize: 9},
 {type: 'qrCode', value: 'https://google.com', height: 55, width: 55, style: 'margin: 10 20px 20 20px'},
 {
  type: 'table',
  // style the table
  style: 'border: 1px solid #ddd',
  // list of the columns to be rendered in the table header
  tableHeader: ['Animal', 'Age'],
  // multi dimensional array depicting the rows and columns of the table body
  tableBody: [
      ['Cat', 2],
      ['Dog', 4],
      ['Horse', 12],
      ['Pig', 4],
  ],
  // list of columns to be rendered in the table footer
  tableFooter: ['Animal', 'Age'],
  // custom style for the table header
  tableHeaderStyle: 'background-color: #000; color: white;',
  // custom style for the table body
  tableBodyStyle: 'border: 0.5px solid #ddd',
  // custom style for the table footer
  tableFooterStyle: 'background-color: #000; color: white;',
},{
  type: 'table',
  style: 'border: 1px solid #ddd',             // style the table
  // list of the columns to be rendered in the table header
  tableHeader: [{type: 'text', value: 'Animal'}, {type: 'image', path: path.join(__dirname, 'icons/animal.png')}],
  // multi dimensional array depicting the rows and columns of the table body
  tableBody: [
      [{type: 'text', value: 'Cat'}, {type: 'image', path: './animals/cat.jpg'}],
      [{type: 'text', value: 'Dog'}, {type: 'image', path: './animals/dog.jpg'}],
      [{type: 'text', value: 'Horse'}, {type: 'image', path: './animals/horse.jpg'}],
      [{type: 'text', value: 'Pig'}, {type: 'image', path: './animals/pig.jpg'}],
  ],
  // list of columns to be rendered in the table footer
  tableFooter: [{type: 'text', value: 'Animal'}, 'Image'],
  // custom style for the table header
  tableHeaderStyle: 'background-color: #000; color: white;',
  // custom style for the table body
  tableBodyStyle: 'border: 0.5px solid #ddd',
  // custom style for the table footer
  tableFooterStyle: 'background-color: #000; color: white;',
},
];

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
    win.webContents.openDevTools()

    // Event when the window is closed.
    win.on('closed',function (){
        win = null
    })
}

ipcMain.on('print', (event, arg) => {
	const data = JSON.parse(arg);
	
	PosPrinter.print( data, {
    printerName: 'Diebold',
    preview: true,
    width: '710px',               //  width of content body
    margin: '0 0 0 0',            // margin of content body
    copies: 2,
    silent: true
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
