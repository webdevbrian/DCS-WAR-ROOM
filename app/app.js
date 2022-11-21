const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')

let window = null

var nodeConsole = require('console');
var appconsole = new nodeConsole.Console(process.stdout, process.stderr);

ipcMain.on('show-open-dialog', (event, arg)=> {

  const options = {
    title: 'Open a file',
    //defaultPath: '/',
    buttonLabel: 'Import Tacview',
    filters: [
      { name: 'CSV', extensions: ['csv'] },
      { name: 'ACMI', extensions: ['acmi'] }
    ],
    message: 'Select a tacview file you would like to import'
  };

  dialog.showOpenDialog(null, options, (filePaths) => {
    event.sender.send('open-dialog-paths-selected', filePaths)
  });
})

const template = [
  {
    label: 'DWR',
    submenu:[],
  },
  {
     label: 'Edit',
     submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
         role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'About DCS War Room'
      }
    ]
  }
]

// Wait until the app is ready
app.once('ready', () => {

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  // Create a new window
  window = new BrowserWindow({
    width: 1200,
    height: 600,
    minWidth: 800,
    minHeight: 600,
    center: true,
    backgroundColor: "#D6D8DC",
    // Don't show the window until it's ready, this prevents any white flickering
    show: false
  })

  // Open the dev tools by default
  window.webContents.openDevTools();

  // Load a URL in the window to the local index.html path
  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Show window when page is ready
  window.once('ready-to-show', () => {
    window.show()
  })

  appconsole.log('Console Logging test');
  
  // Open select file dialog
  //appconsole.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
  //appconsole.log(dialog.showOpenDialog({ properties: ['openFile'] }))
  
})
