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

const dbPath = rootPath + '\\resources\\database\\default_db.sqlite3';

console.log(rootPath);

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

//
// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
//
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

//
// All IPC messages to render files (app.js / flightlogs.js etc)
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
  ipcMain.on('flightlogs', (event, arg) => {

    console.log('DB Path');
    console.log(dbPath);

    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database opening error: ', err);
    });

    const sql = arg;

    database.serialize(() => {
      database.each(sql, (err, rows) => {
        event.reply('flightlogsDBResponse', (err && err.message) || rows);
      });

      database.close((err) => {
        if (err) {
          console.error(err.message);
        }

        console.log('Closed the database connection.');
      });
    });
  });

  ipcMain.on('deleteFlight', (event, arg) => {
    const sql = arg;
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database opening error: ', err);
    });

    database.serialize(() => {
      database.run(sql, (err) => {
        event.reply('flightlogsDeleteFlight', err);
      });

      database.close((err) => {
        if (err) {
          console.error(err.message);
        }

        console.log('Closed the database connection.');
      });
    });
  });

  ipcMain.on('addFlight', (event, arg) => {
    const sql = arg;
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database opening error: ', err);
    });

    database.serialize(() => {
      database.run(sql, (err) => {
        if(err){
          console.log(err);
          return;
        }

        console.log("Insertion Done");
      });

      //
      // Get the last row (last updated) to send back to get added to the UI
      //
      database.all('SELECT * FROM flightlogs ORDER BY id DESC LIMIT 1;' , (err , data) => {
        if(err){
          console.log(err);
          return;
        }

        event.reply('flightLogAddFlight', data);
      });

      database.close((err) => {
        if (err) {
          console.error(err.message);
        }

        console.log('Closed the database connection.');
      });
    });
  });

  ipcMain.on('getFlights', (event, arg) => {
    const sql = arg;
    const database = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('Database opening error: ', err);
    });

    database.serialize(() => {
      database.each(sql, (err, rows) => {
        event.reply('getFlightLogs', (err && err.message) || rows);
      });
    });

    database.close((err) => {
      if (err) {
        console.error(err.message);
      }

      console.log('Closed the database connection.');
    });
  });

  //
  // Show the main tacview file select dialog
  //
  ipcMain.on('show-open-dialog', (event, arg)=> {
    dialog.showOpenDialog({
      title: 'Import Tacview',
      buttonLabel: 'Import Tacview',
      filters: [
        { name: 'ACMI', extensions: ['acmi'] }
        //{ name: 'CSV', extensions: ['csv'] } TODO: Potential support for tacview csv files in the future ... needs acceptance criteria.
      ],
      message: 'Select a tacview file you would like to import'
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

  mainWindow.openDevTools();

  // if (env.name === "development") {
  //   mainWindow.openDevTools();
  // }
});

app.on("window-all-closed", () => {
  app.quit();
});
