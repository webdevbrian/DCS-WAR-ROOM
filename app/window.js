const { Console } = require('console');
const { ipcRenderer } = require('electron');
const fs = require('fs');
const exec = require('child_process').exec;
if (require('electron-squirrel-startup')) app.quit();
//const rootPath = require('electron-root-path').rootPath; // OSX
const rootPath = process.cwd(); // Windows -- production: process.cwd() + '/resources/app/'

//
// TODO: Move all DB things to utils/db.js
//
const initSqlJs = require('sql.js');
const dbFile = fs.readFileSync(rootPath + "/dwr.sqlite3"); // Windows "make" location const dbFile = fs.readFileSync(rootPath + "\\resources\\app\\dwr.sqlite3");

function db(query) {
  return new Promise((resolve) => {
    initSqlJs().then(function (SQL) {
      console.log('Query ' + query);
      const db = new SQL.Database(dbFile);
      const res = db.exec(query);
      resolve(res);
      db.close();
    });
  });
}

async function dbQuery(query) {
  const response = await db(query).catch((err) => {
    console.error('Error executing DB Query: ' + err);
    return "Error executing DB Query";
  });

  return response;
}

const dbres = Promise.resolve(dbQuery("SELECT * FROM flightlogimports"));
dbres.then((res) => {

  if(res.length !== 0) {
    console.log(v[0]);
    // all data returned from query
    // console.log(v[0]['columns'][0]); // first column name
    // console.log(v[0]['values'][0]); // first row in query
  } else {
    console.log('Response is empty');
  }

});

//
// TODO: Put all helper functions in utils location
//

ipcRenderer.on('open-dialog-paths-selected', (event, arg)=> {
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
})

ipcRenderer.on('show-message-box-response', (event, args) => {
  dialog.handler.outputMessageboxResponse(args);
})

function disableUI(disable){
  if(disable){
    $('.importing').show();
    $('#import').hide();
    $(document.body).css({'cursor' : 'wait'});
    $('.nav-item a').addClass('disabled');
  } else {
    $('.importing').hide();
    $('#import').show();
    $(document.body).css({'cursor' : 'default'});
    $('.nav-item a').removeClass('disabled');
  }
};

window.dialog = window.dialog || {},

// do not put anything here between window.dialog and the IIFE function(n)

function(n) {

  //
  // Execute cli commands
  //
  function execute(command, toastTitle) {
    const dwrToast = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(dwrToast);

    exec(command, toastTitle, (error, stdout, stderr) => {
      if (error || stderr || stdout) {
        $('.tacview-toast .toast-body').text(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);

        // Enable UI
        disableUI(false);

        toast.show();
      } else {

        //
        // Handle the SQLite database import here
        // After successful import delete the old CSV file for cleanup
        //

        $('.toast-title').text(toastTitle);
        $('.tacview-toast .toast-body').text('Success!');
        toast.show();

        // Enable UI
        disableUI(false);
      }
    });
  };

  //
  // Get just the tacview file name, no directories and no extensions.
  //
  function getTacviewFileName(fullPath) {
    return fullPath.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace(/\.[^/.]+$/, ""); // TODO: Clean this up
  }

  dialog.handler = {

    // Show the open file dialog
    showOpenDialog: function() {
      ipcRenderer.send('show-open-dialog');
    },

    outputSelectedPathsFromOpenDialog: function(paths) {
      if(paths !== null){

        //
        // Automate Tacview csv export
        // Find out if user installed it with or without steam
        //

        const tacviewPath = fs.existsSync('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview') ? 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview' : 'C:\Program Files (x86)\Tacview';
        const command = '"' + tacviewPath + '\\Tacview.exe" -Open:"' + paths[0] + '" -ExportFlightLog:"' + rootPath + '\\' + getTacviewFileName(paths[0]) + '.csv" -Quiet –Quit';
        const toastTitle = 'Imported "' + getTacviewFileName(paths[0]) + '"';

        // Disable UI
        disableUI(true);

        execute(command, toastTitle);
      }
    },

    init: function() {
      $('#import').click( function () {
        dialog.handler.showOpenDialog();
      })
    }
  };

  n(function() {
    dialog.handler.init();
    $('.importing, .no-tacviews').hide();
  })
}(jQuery);