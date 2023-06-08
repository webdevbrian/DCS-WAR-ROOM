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
  //if (env.name !== "production") {
    menus.push(devMenuTemplate);
  //}

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
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
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Events GET): ', err);
        });

        database.serialize(() => {
          database.all(sql, (err , data) => {
            if(err){
              console.log('Error (Events GET)', err);
              return;
            }
            responseData = data;
            resolve(responseData);
            console.log("Events GET Done");
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Events).');
          });
        });
      } catch (error) {
        console.log(`Error With Events GET db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('getLocations', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Locations GET): ', err);
        });

        database.serialize(() => {
          database.all(sql, (err , data) => {
            if(err){
              console.log('Error (Locations GET)', err);
              return;
            }
            responseData = data;
            resolve(responseData);
            console.log("Locations GET Done");
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Locations).');
          });
        });
      } catch (error) {
        console.log(`Error With Locations GET db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('getServerList', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Server list GET): ', err);
        });

        database.serialize(() => {
          database.all(sql, (err , data) => {
            if(err){
              console.log('Error (Server list GET)', err);
              return;
            }
            responseData = data;
            resolve(responseData);
            console.log("Server list GET Done");
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Server list).');
          });
        });
      } catch (error) {
        console.log(`Error With Server list GET db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('addServer', (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database update error (addServer): ', err);
        });

        console.log('fired addServer event');

        database.serialize(() => {
          database.run(sql, (err , data) => {
            if(err){
              console.log('Error (addServer update)', err);
              return;
            }

            console.log("addServer update Done");
            responseData = data;
            resolve(responseData);
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (addServer).');
          });
        });
      } catch (error) {
        console.log(`Error With addServer UPDATE db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.on('deleteServer', (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        console.log('Server delete fired: ', arg);
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Server Delete): ', err);
        });

        database.serialize(() => {
          database.run(sql, (err , data) => {
            if(err){
              console.log(err);
              return;
            }

            responseData = data; // If anything TODO: Respond with deleted row information
            resolve(responseData);
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Server Delete).');
          });
        });
      } catch (error) {
        console.log(`Error With Server delete db query: \r\n ${error}`)
        reject();
      }
    });
  });

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

  ipcMain.handle('updateTacview', (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database update error (updateTacview): ', err);
        });

        console.log('fired update tacview event');

        database.serialize(() => {
          database.run(sql, (err , data) => {
            if(err){
              console.log('Error (updateTacview update)', err);
              return;
            }

            console.log("updateTacview update Done");
            responseData = data;
            resolve(responseData);
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (updateTacview).');
          });
        });
      } catch (error) {
        console.log(`Error With updateTacview UPDATE db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('getFlightLog', (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Flightlog): ', err);
        });

        database.serialize(() => {
          database.all(sql, (err , data) => {
            if(err){
              console.log('Error (Flightlog GET)', err);
              return;
            }
            responseData = data;
            resolve(responseData);
            console.log("Flightlog GET Done");
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Flightlog).');
          });
        });
      } catch (error) {
        console.log(`Error With Flightlog GET db query: \r\n ${error}`)
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
          if (err) console.error('Database opening error (Add flightlog): ', err);
        });

        database.serialize(() => {
          database.run(sql, (err) => {
            if(err){
              console.log('Insertion Error (Add flightlog)', err);
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

            console.log('Closed the database connection (Add flightlog).');
          });
        });
      } catch (error) {
        console.log(`Error With Add flightlog query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('getPilots', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Pilot Track GET): ', err);
        });

        database.serialize(() => {
          database.all(sql, (err , data) => {
            if(err){
              console.log('Error (Pilot Track GET)', err);
              return;
            }
            responseData = data;
            resolve(responseData);
            console.log("Pilot GET Done");
          });

          database.close((err) => {
            if (err) {
              console.error(err.message);
            }

            console.log('Closed the database connection (Pilot Track).');
          });
        });
      } catch (error) {
        console.log(`Error With Pilot track add db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.handle('addPilot', async (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Pilot Track): ', err);
        });

        database.serialize(() => {
          database.run(sql, (err) => {
            if(err){
              console.log('Insertion Error (Pilot Track)', err);
              return;
            }

            console.log("Insertion Done");
          });

          //
          // Get the last row (last updated) to send back
          //
          database.all('SELECT * FROM pilotdata ORDER BY id DESC LIMIT 1;' , (err , data) => {
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

            console.log('Closed the database connection (Pilot Track).');
          });
        });
      } catch (error) {
        console.log(`Error With Pilot track add db query: \r\n ${error}`)
        reject();
      }
    });
  });

  ipcMain.on('deletePilot', (event, arg) => {
    let responseData;

    return new Promise((resolve, reject) => {
      try {
        console.log('Pilot delete fired: ', arg);
        const sql = arg;
        const database = new sqlite3.Database(dbPath, (err) => {
          if (err) console.error('Database opening error (Pilot Track): ', err);
        });

        database.serialize(() => {
          //
          // Get the last row (last updated) to send back
          //
          database.run(sql, (err , data) => {
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

            console.log('Closed the database connection (Pilot Delete).');
          });
        });
      } catch (error) {
        console.log(`Error With Pilot track delete db query: \r\n ${error}`)
        reject();
      }
    });
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
