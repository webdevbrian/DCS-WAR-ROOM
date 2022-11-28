// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, ipcMain, BrowserWindow, shell, dialog } from "electron";
import appMenuTemplate from "./menu/app_menu_template";
import editMenuTemplate from "./menu/edit_menu_template";
import devMenuTemplate from "./menu/dev_menu_template";
import createWindow from "./helpers/window";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

let mainWindow;

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

const setApplicationMenu = () => {
  const menus = [appMenuTemplate, editMenuTemplate];
  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// We can communicate with our window (the renderer process) via messages.
const initIpc = (dialog) => {
  ipcMain.on("need-app-path", (event, arg) => {
    event.reply("app-path", app.getAppPath());
  });
  ipcMain.on("open-external-link", (event, href) => {
    shell.openExternal(href);
  });
  // Show the main tacview dialog
  ipcMain.on('show-open-dialog', (event, arg)=> {
    console.log('ICP main show open dialog recieved');

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

    console.log('mainjs show open dialog:');

    console.log(dialog);

    dialog.showOpenDialog({
      title: 'Import Tacview',
      buttonLabel: 'Import Tacview',
      filters: [
        { name: 'ACMI', extensions: ['acmi'] },
        //{ name: 'CSV', extensions: ['csv'] } TODO: Potential support for tacview csv files in the future ... needs acceptance criteria.
      ],
      message: 'Select a tacview file you would like to import'
    }).then(result => {
      if(!result.canceled){
        event.reply('open-dialog-paths-selected', result.filePaths)
      }
    }).catch(err => {
      console.log(err)
    })

    // dialog.showOpenDialog(null, options, (filePaths) => {
    //   event.sender.send('open-dialog-paths-selected', filePaths)
    // });

    // dialog.showOpenDialog(null, options, (filePaths) => {
    //   console.log('mainjs show open dialog 2');

    //   event.sender.send('open-dialog-paths-selected', filePaths)

    // });
  })
};

app.on("ready", () => {
  setApplicationMenu();
  initIpc(dialog);

  mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    webPreferences: {
      // Two properties below are here for demo purposes, and are
      // security hazard. Make sure you know what you're doing
      // in your production app.
      nodeIntegration: true,
      contextIsolation: false,
      // Spectron needs access to remote module
      enableRemoteModule: env.name === "test"
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }
});

app.on("window-all-closed", () => {
  app.quit();
});
