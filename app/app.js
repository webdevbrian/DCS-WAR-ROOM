const {app, BrowserWindow, Menu, MenuItem, ipcMain, dialog} = require('electron')
const path = require('path')
const url = require('url')
if (require('electron-squirrel-startup')) app.quit();

let window = null

var nodeConsole = require('console');
var appconsole = new nodeConsole.Console(process.stdout, process.stderr);

ipcMain.on('show-open-dialog', (event, arg)=> {

  const options = {
    title: 'Open a file',
    //defaultPath: '/',
    buttonLabel: 'Import Tacview',
    filters: [
      { name: 'ACMI', extensions: ['acmi'] },
      { name: 'CSV', extensions: ['csv'] }

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
    role: 'window',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, window) {
          if (window) window.reload()
        }
      },
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
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
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // This isn't great. TODO: Fix this and not use this! Info: https://www.electronjs.org/docs/latest/tutorial/context-isolation
    }
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

  //appconsole.log('Console Logging test');

  // Open select file dialog
  //appconsole.log(dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }))
  //appconsole.log(dialog.showOpenDialog({ properties: ['openFile'] }))

})
