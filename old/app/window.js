const { Console } = require('console');
const { ipcRenderer } = require('electron');
const fs = require('fs');
const exec = require('child_process').exec;
if (require('electron-squirrel-startup')) app.quit();
const rootPath = process.cwd(); // Windows -- production: process.cwd() + '/resources/app/'

//
// TODO: Move all DB things to utils/db.js
//
const initSqlJs = require('sql.js');
const dbFile = fs.readFileSync(rootPath + "/default_db.sqlite3"); // Windows "make" location const dbFile = fs.readFileSync(rootPath + "\\resources\\app\\dwr.sqlite3");

function dbQ(query) {
  return new Promise((resolve) => {
    initSqlJs().then(function (SQL) {
      console.log(query);
      const db = new SQL.Database(dbFile);
      const res = db.exec(query);
      const modified = db.getRowsModified(query);

      console.log(res);
      console.log(modified);

      resolve(res);
      db.close();
    });
  });
}

//
// Delete a row from the flight logs table
//
function db_flightlogDelete(rowId) {
  //const db_flightlogDeleteQuery = db("DELETE FROM flightlogs WHERE tracked_pilots = " + parseInt(rowId) + ";");
  
  const db_flightlogDeleteQuery = dbQ("DELETE FROM flightlogs WHERE id = " + parseInt(rowId) + ";");
  
  db_flightlogDeleteQuery.then((res) => {
    if(res.length !== 0) {
      const dwrToast = document.getElementById('liveToast');
      const toast = new bootstrap.Toast(dwrToast);
      //$('#flightLogs').find("tr#row-" + element[0]).remove();

      $('.toast-title').text(res[0].value);
      $('.tacview-toast .toast-body').text('Success!');
      toast.show();
    } else {
      console.log('Response is empty');
    }
  });
}

//
// Example DB Call
//
// const db_flightlogTableDelete = Promise.resolve(dbQuery("SELECT * FROM flightlogs"));
// db_flightlogTableDelete.then((res) => {
//   if(res.length !== 0) {
//   } else {
//     console.log('Response is empty');
//   }
// });



//
// Build the Flight logs table 
//
const db_flightlogTable = dbQ("SELECT * FROM flightlogs;");
db_flightlogTable.then((res) => {

  if(res.length !== 0) {

    //
    // Build the table
    //

    console.log(res);
    //
    res[0]['values'].forEach(element => {
      $("#flightLogs").find('tbody')
        .append($('<tr class="align-middle" id="row-' + element[0] + '">')
          .append($('<td>')
            .append($('<div>')
              .html(element[0])
            )
          )
          .append($('<td>')
            .append($('<div>')
              .html(element[2])
            )
          )
          .append($('<td>')
            .append($('<div>')
              .html('hi')
            )
          )
          .append($('<td>')
            .append($('<div>')
              .html('hi')
            )
          )
          .append($('<td class="text-end">')
            .append($('<div>')
              .html('<button type="button" id="rowDelete-' + element[0] + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>')
            )
          )
        );

      //
      // Create deletion functionality
      //

      $('#rowDelete-' + element[0]).click( function () {
        db_flightlogDelete(element[0]);
      })

    });
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
      });
    }
  };

  n(function() {
    dialog.handler.init();
    $('.importing, .no-tacviews').hide();
  })
}(jQuery);