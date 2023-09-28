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
const sqlite3 = require('sqlite3');
const rootPath = process.cwd();
const dbPath = path.join(rootPath, 'resources', 'database', 'default_db.sqlite3');
// console.log(rootPath);

//
// Special module holding environment variables which are declared in config/env_xxx.json file.
//
import env from "env";

//
// Save userData in separate folders for each environment.
//
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

const setApplicationMenu = () => {
  //const menus = [appMenuTemplate, editMenuTemplate];
  const menus = [appMenuTemplate];
  //if (env.name !== "production") {
    menus.push(devMenuTemplate);
  //}

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

//
// Create our lead database connection function to be used within all of our IPC calls ...
//
const createDatabaseConnection = () => {
  return new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Database opening error:', err);
  });
};

//
// Create our lead database query run function
//

const runDatabaseQuery = (sql) => {
  return new Promise((resolve, reject) => {
    const database = createDatabaseConnection();
    database.serialize(() => {
      database.all(sql, (err, data) => {
        if (err) {
          console.error(`Error in query: ${sql}`, err);
          reject(err);
        } else {
          resolve(data);
        }
      });

      database.close((err) => {
        if (err) {
          console.error(err.message);
        }
      });
    });
  });
};

//
// All IPC messages to render files (app.js / flightlogs.js etc).
// NOTE: These can all be optimized, simplified and cleaned up. I just wanted to get it working first.
//
const initIpc = (dialog) => {
  ipcMain.on("need-app-path", (event, arg) => {
    event.reply("app-path", app.getAppPath());
  });

  ipcMain.on("open-external-link", (event, href) => {
    shell.openExternal(href);
  });

  //
  // Database IPCs
  //
  ipcMain.handle('getEvents', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Events GET Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Events GET db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('getLocations', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Locations GET Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Locations GET db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('getServerList', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Server list GET Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Server list GET db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('addServer', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("addServer update Done");
      return responseData;
    } catch (error) {
      console.error(`Error With addServer UPDATE db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.on('deleteServer', async (event, arg) => {
    try {
      const sql = arg;
      await runDatabaseQuery(sql);
      console.log('Server delete fired:', arg);
      event.reply('serverDeleted');
    } catch (error) {
      console.error(`Error With Server delete db query: \n${error}`);
    }
  });

  ipcMain.handle('flightlogs', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      return responseData;
    } catch (error) {
      console.error(`Error With Select ALL(): \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('updateTacview', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("updateTacview update Done");
      return responseData;
    } catch (error) {
      console.error(`Error With updateTacview UPDATE db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('getFlightLog', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Flightlog GET Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Flightlog GET db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.on('deleteFlight', async (event, arg) => {
    try {
      const sql = arg;
      await runDatabaseQuery(sql);
      console.log('Flight delete fired:', arg);
      event.reply('flightDeleted');
    } catch (error) {
      console.error(`Error With Flight delete db query: \n${error}`);
    }
  });

  ipcMain.handle('addFlightLog', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Insertion Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Add flightlog query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('getPilots', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Pilot GET Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Pilot Track GET db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.handle('addPilot', async (event, arg) => {
    try {
      const sql = arg;
      const responseData = await runDatabaseQuery(sql);
      console.log("Insertion Done");
      return responseData;
    } catch (error) {
      console.error(`Error With Pilot track add db query: \n${error}`);
      throw error;
    }
  });

  ipcMain.on('deletePilot', async (event, arg) => {
    try {
      const sql = arg;
      await runDatabaseQuery(sql);
      console.log('Pilot delete fired:', arg);
      event.reply('pilotDeleted');
    } catch (error) {
      console.error(`Error With Pilot track delete db query: \n${error}`);
    }
  });

  //
  // Show the main tacview file select dialog
  //
  ipcMain.on('show-open-dialog', (event, arg)=> {
    dialog.showOpenDialog({
      title: 'Import Tacview ✈️',
      buttonLabel: 'Import Tacview ✈️',
      filters: [
        { name: 'ACMI', extensions: ['acmi'] }
        //{ name: 'CSV', extensions: ['csv'] } TODO: Potential support for tacview csv files in the future ... needs acceptance criteria.
      ],
      message: 'Select a tacview file you would like to import' // This only shows for OSX ... might want to just remove this as our primary is windows
    }).then(result => {
      if(!result.canceled){
        event.reply('open-dialog-paths-selected', result.filePaths)
      }
    }).catch(err => {
      console.log(err)
    });
  })
};

app.on("ready", () => {
  setApplicationMenu();
  initIpc(dialog);

  const mainWindow = createWindow("main", {
    width: 1200,
    height: 800,
    titleBarOverlay: true,
    webPreferences: {
      nodeIntegration: true, // We need to  migrate away from this.
      contextIsolation: false,
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
