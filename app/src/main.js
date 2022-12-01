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
  ipcMain.handle('flightlogs', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error: ', err);
        });

        database.serialize(() => {
          database.all(sql , (err , data) => {
            if(err){
              console.log(err);
              return;
            }

            responseData = data;
            resolve(responseData);
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection.');
          });
        });
      } catch (error) {
          console.log(`Error With Select ALL(): \r\n ${error}`)
          reject();
      }
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

        console.log('Closed the database connection (Delete flight).');
      });
    });
  });

  ipcMain.handle('addFlightLog', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error: ', err);
        });

        database.serialize(() => {
          database.run(sql, (err) => {
            if(err){
              console.log('Insertion Error', err);
              return;
            }

            console.log("Insertion Done");
          });

          //
          // Get the last row (last updated) to send back to get added to the flightlog UI
          //
          database.all('SELECT * FROM flightlogs ORDER BY id DESC LIMIT 1;' , (err , data) => {
            if(err){
              console.log(err);
              return;
            }

            responseData = data;
            resolve(responseData);
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Add flight).');
          });
        });
      } catch (error) {
        console.log(`Error With Select ALL(): \r\n ${error}`)
        reject();
      }
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

      console.log('Closed the database connection (Get flights).');
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
