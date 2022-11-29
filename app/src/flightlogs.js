import { ipcRenderer } from "electron";
import jetpack from "fs-jetpack";
import { contextIsolated } from "process";
const fs = require('fs');
const exec = require('child_process').exec;
const rootPath = process.cwd();

let tableRowId;
let tacviewFileName;
document.querySelector(".importing").style.display = "none";

//
// IPC Renderer communications
//
ipcRenderer.send("need-app-path");

ipcRenderer.on('open-dialog-paths-selected', (event, arg)=> {
  console.log('fired get paths from dialog');
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
})

ipcRenderer.on("app-path", (event, appDirPath) => {
  const appDir = jetpack.cwd(appDirPath);
  const manifest = appDir.read("package.json", "json");
  document.querySelector("title").innerHTML = "DCS War Room v" + manifest.version;

  console.log(appDirPath);
  console.log(rootPath);
});

ipcRenderer.on("flightlogsDeleteFlight", () => {

  //
  // Remove Row from UI
  //
  console.log('Deleted:', tableRowId);
  document.getElementById('row-' + tableRowId).outerHTML = "";
});

ipcRenderer.on("flightLogAddFlight", (event, flightLogData) => {
  const flightLog = flightLogData[0];

  //
  // Format dates
  //
  const date1 = new Date(flightLog.import_date);
  const date2 = date1.getFullYear()+'-' + (date1.getMonth()+1) + '-'+date1.getDate() + ' @ ' + date1.getHours() + ':' + date1.getMinutes();

  //
  // Add Row to UI (add to top of table as table is ordered DESC sort)
  //
  let flightLogsTable = document.querySelector(".flight-logs");
  let flightLogsTableRow = document.createElement("tr");

  flightLogsTable.insertBefore(flightLogsTableRow, flightLogsTable.firstChild).setAttribute('id', 'row-' + flightLog.id);

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flightLog.id

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flightLog.filename

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = date2;

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flightLog.flight_date;

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + flightLog.id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';
});

//
// Initially get all flightlogs from database
//
ipcRenderer.send("flightlogs", 'SELECT * FROM flightlogs ORDER BY id DESC LIMIT 500'); // TODO: Add pagination to table?

let tableRendered = false;
ipcRenderer.on("flightlogsDBResponse", (event, flightLog) => {

  //
  // Format dates
  //
  const import_date1 = new Date(flightLog.import_date);
  const import_date = import_date1.getFullYear() + '-' + (import_date1.getMonth() + 1) + '-' + import_date1.getDate() + ' @ ' + ('0' + import_date1.getHours()).substr(-2) + ':' + ('0' + import_date1.getMinutes()).substr(-2);

  const flight_date1 = new Date(flightLog.flight_date);
  const flight_date = flight_date1.getFullYear() + '-' + (flight_date1.getMonth() + 1) + '-' + flight_date1.getDate() + ' @ ' + ('0' + flight_date1.getHours()).substr(-2) + ':' + ('0' + flight_date1.getMinutes()).substr(-2);

  //
  // Create flight log table
  //
  let flightLogsTable = document.querySelector(".flight-logs");
  let flightLogsTableRow = document.createElement("tr");
  flightLogsTable.appendChild(flightLogsTableRow).setAttribute('id', 'row-' + flightLog.id);

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flightLog.id

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flightLog.filename

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = import_date;

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = flight_date;

  flightLogsTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + flightLog.id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';

    if(flightLogsTable.childElementCount > 1) {
      const noFlightLogs = document.getElementById('noFlightLogs');
      noFlightLogs?.remove();
    }
  });

//
// Get just the tacview file name, no directories and no extensions.
//
function getTacviewFileName(fullPath) {
  if(fullPath){
    return fullPath.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace(/\.[^/.]+$/, ""); // TODO: Clean this up
  }
}

function disableUI(disable){
  if(disable){
    document.querySelector(".importing").style.display = "block";
    document.querySelector(".import-tacview").style.display = "none";
    document.querySelector("body").style.cursor = 'wait';
    document.querySelectorAll('.nav-link')
    .forEach(function(element) {
      element.classList.add("disabled")
    });
  } else {
    document.querySelector(".importing").style.display = "none";
    document.querySelector(".import-tacview").style.display = "block";
    document.querySelector("body").style.cursor = 'default';
    document.querySelectorAll('.nav-link')
    .forEach(function(element) {
      element.classList.remove("disabled")
    });
  }
};

//
// Execute cli commands
//
function execute(command, props) {
  console.log('fired execute');

  exec(command, props, (error, stdout, stderr) => {
    if (error || stderr || stdout) {
      // Enable UI
      disableUI(false);

      console.log(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);
    } else {

      //
      // Check the execution type
      // Current types are STRING: tacview
      //
      if(props[0] ==='tacview') {
        let fileName = props[1];

        //
        // Get and convert tacview file date from filename to ISO
        //
        let date = fileName.substring(0, 23);
        date = date.substring(8);
        let dateYear = date.slice(0, 4);
        let dateMonth = date.slice(4,6);
        let dateDay = date.slice(6,8);
        let dateHour = date.slice(9,11);
        let dateMinute = date.slice(11,13);
        let dateSeconds = date.slice(13,17);
        let importDate = dateYear + '-' + dateMonth + '-' + dateDay + 'T' + dateHour + ':' + dateMinute + ':' + dateSeconds;

        //
        // Get and convert current date and time to ISO
        //
        const currentDate = new Date().toISOString()

        //
        // Handle the SQLite database import here
        // After successful import delete the old CSV file for cleanup
        //
        ipcRenderer.send("addFlight", 'INSERT INTO flightlogs (filename, import_date, flight_date) VALUES("' + tacviewFileName + '", "' + currentDate + '", "' + importDate + '")');

        // Enable UI
        disableUI(false);
        console.log('Success');
      }
    }
  });
};

//
// Tacview file import dialog handler
//
window.dialog = window.dialog || {};
dialog.handler = {

  // Show the open file dialog
  showOpenDialog: function() {
    console.log('fired show open dialog');
    ipcRenderer.send('show-open-dialog');
  },

  outputSelectedPathsFromOpenDialog: function(paths) {
    if(paths !== null){

      //
      // Automate Tacview csv export
      // Find out if user installed it with or without steam
      //
      tacviewFileName = getTacviewFileName(paths[0]);
      const tacviewPath = fs.existsSync('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview') ? 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview' : 'C:\Program Files (x86)\Tacview';
      const command = '"' + tacviewPath + '\\Tacview.exe" -Open:"' + paths[0] + '" -ExportFlightLog:"' + rootPath + '\\' + getTacviewFileName(paths[0]) + '.csv" -Quiet –Quit';

      // Disable UI
      disableUI(true);

      console.log('fired output selected paths from dialog');
      document.querySelector(".importing").innerHTML = '<span class="spinner-border spinner-border-sm importing-text" role="status" aria-hidden="true"></span> Importing ' + getTacviewFileName(paths[0]);
      execute(command, ['tacview', tacviewFileName]);
    }
  },

  init: function() {
    //
    // Click event for tacview import button
    //
    document.querySelector(".import-tacview").addEventListener(
      "click",
      event => {
        dialog.handler.showOpenDialog();
        event.preventDefault();
      },
      false
    );
  }
};

dialog.handler.init();

//
// DOM clicks / etc
//

//
// Insert BRUH meme. TODO: Fix this up.
//
document.addEventListener("click", function(e){
  let target = e.target.closest(".delete"); // Or any other selector.

  if(target){
    tableRowId = target.id.split("-").pop();

    //
    // Delete Row from database (flightlogs and flightlogimports) TODO: Multi selection for delete via checkboxs!
    //
    ipcRenderer.send("deleteFlight", 'DELETE FROM flightlogs WHERE id =' + tableRowId);
  }
});

// Launch all links with this class externally
// document.querySelector(".electron-website-link").addEventListener(
//   "click",
//   event => {
//     ipcRenderer.send("open-external-link", event.target.href);
//     event.preventDefault();
//   },
//   false
// );
