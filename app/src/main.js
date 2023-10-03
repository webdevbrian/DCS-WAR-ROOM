import path from 'path';
import url from 'url';
import { app, Menu, ipcMain, BrowserWindow, shell, dialog } from 'electron';
import appMenuTemplate from './menu/app_menu_template';
import devMenuTemplate from './menu/dev_menu_template';
import createWindow from './helpers/window';
import sqlite3 from 'sqlite3';

const rootPath = process.cwd();
const dbPath = path.join(rootPath, 'resources', 'database', 'default_db.sqlite3');

import env from 'env';

if (env.name !== 'production') {
  const userDataPath = app.getPath('userData');
  app.setPath('userData', `${userDataPath} (${env.name})`);
}

const setApplicationMenu = () => {
  const menus = [appMenuTemplate];
  if (env.name !== 'production') {
    menus.push(devMenuTemplate);
  }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

const openDatabase = () => {
  const database = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error(`Database opening error: ${err}`);
  });
  return database;
};

const handleDatabaseRequest = async (event, sql) => {
  return new Promise((resolve, reject) => {
    const database = openDatabase();
    database.serialize(() => {
      database.all(sql, (err, data) => {
        if (err) {
          console.error(`Database query error: ${err}`);
          reject(err);
        } else {
          resolve(data);
        }
      });

      database.close((err) => {
        if (err) {
          console.error(`Database closing error: ${err}`);
        }
      });
    });
  });
};

const initIpc = () => {
  ipcMain.on('need-app-path', (event) => {
    event.reply('app-path', app.getAppPath());
  });

  ipcMain.on('open-external-link', (event, href) => {
    shell.openExternal(href);
  });

  ipcMain.handle('getEvents', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Events GET Done');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('getLocations', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Locations GET Done');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('getServerList', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Server list GET Done');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('addServer', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('addServer update Done');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('addFlightLog', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('addFlightLog Done');

      const lastFlightLog = await handleDatabaseRequest('getFlightLog', 'SELECT * FROM flightlogs ORDER BY id DESC LIMIT 1;');
      return lastFlightLog;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('addPilot', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('addPilot Done');
      const lastAddedPilot = await handleDatabaseRequest('getPilots', 'SELECT * FROM pilotdata ORDER BY id DESC LIMIT 1;');
      return lastAddedPilot;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('flightlogs', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('flightlogs');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('updateTacview', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('updateTacview');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('getPilots', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('getPilots');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.handle('getFlightLog', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('getFlightLog ');
      return data;
    } catch (error) {
      return [];
    }
  });

  ipcMain.on('deletePilot', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Closed the database connection (Pilot Delete).');
      event.reply('deletePilot', data);
    } catch (error) {
      console.error(`Error With Server delete db query: ${error}`);
    }
  });

  ipcMain.on('deleteFlight', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Closed the database connection (Flight Delete).');
      event.reply('deleteFlight', data);
    } catch (error) {
      console.error(`Error With Server delete db query: ${error}`);
    }
  });

  ipcMain.on('deleteServer', async (event, arg) => {
    try {
      const data = await handleDatabaseRequest(event, arg);
      console.log('Closed the database connection (Server Delete).');
      event.reply('serverDeleted', data);
    } catch (error) {
      console.error(`Error With Server delete db query: ${error}`);
    }
  });

  // Handle other database requests in a similar manner...

  ipcMain.on('show-open-dialog', async (event) => {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Import Tacview ✈️',
        buttonLabel: 'Import Tacview ✈️',
        filters: [{ name: 'ACMI', extensions: ['acmi'] }],
        message: 'Select a tacview file you would like to import',
      });

      if (!result.canceled) {
        event.reply('open-dialog-paths-selected', result.filePaths);
      }
    } catch (err) {
      console.error(err);
    }
  });
};

app.on('ready', () => {
  setApplicationMenu();
  initIpc();

  const mainWindow = createWindow('main', {
    width: 1200,
    height: 800,
    titleBarOverlay: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: env.name === 'test',
    },
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'app.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  if (env.name === 'development') {
    mainWindow.openDevTools();
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
