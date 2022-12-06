import "./stylesheets/main.css";
import { ipcRenderer } from "electron";
import jetpack from "fs-jetpack";
import { contextIsolated } from "process";
const fs = require('fs');
const exec = require('child_process').exec;
const rootPath = process.cwd();
import { getCSV } from './utils/getCSV.js';
const sqlite3 = require('sqlite3');
const dbPath = rootPath + '\\resources\\database\\default_db.sqlite3';

let tableRowId;
let tacviewLocation;
let tacviewFileName;
let manifest;
document.querySelector(".importing").style.display = "none";

//
// Modals
//
let flightLogModal = new bootstrap.Modal(
  document.getElementById("flightLogModal"),
  {}
);

let deleteTacviewModal = function(tableRowID) {
  const deleteButton = document.getElementById('deleteTacviewConfirm');
  const saveButton = document.getElementById('saveTacview');
  deleteButton?.remove();
  saveButton?.remove();
  document.getElementById('flightLogModalTitle').innerHTML = 'Confirm tacview deletion';
  document.getElementById('flightLogModalBody').innerHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg> Are you sure you want to Tacview ID #' + tableRowID + '?';
  document.getElementById('flightLogModalFooter').appendChild(document.createElement("div")).innerHTML = '<button type="button" class="btn btn-secondary btn-danger" id="deleteTacviewConfirm">Delete</button>';
  flightLogModal.show();
}

let tacviewModalEdit = function(flightLog) {
  const deleteButton = document.getElementById('deleteTacviewConfirm');
  const saveButton = document.getElementById('saveTacview');
  deleteButton?.remove();
  saveButton?.remove();

  //
  // Build map location dropdown and set selected options if one is saved previously
  // NULL = none set, 0 = caucuses, 1 = nevada, 2 = normandy, 3 = persian gulf, 4 = the channel, 5 = syria, 6 = marianas, 7 = south atlantic
  // TODO: Redo this - this was done quickly, this should be a for loop with a set of locations based on an array of locations
  //
  let selected,
      selected0,
      selected1,
      selected2,
      selected3,
      selected4,
      selected5,
      selected6,
      selected7 = '';

  if(!flightLog['location']) {
    selected = 'selected';
  } else if(flightLog['location'] == 0) {
    selected0 = 'selected';
  } else if(flightLog['location'] == 1){
    selected1 = 'selected';
  } else if(flightLog['location'] == 2){
    selected2 = 'selected';
  } else if(flightLog['location'] == 3){
    selected3 = 'selected';
  } else if(flightLog['location'] == 4){
    selected4 = 'selected';
  } else if(flightLog['location'] == 5){
    selected5 = 'selected';
  } else if(flightLog['location'] == 6){
    selected6 = 'selected';
  } else if(flightLog['location'] == 7){
    selected7 = 'selected';
  };

  document.getElementById('flightLogModalTitle').innerHTML = 'Editing Tacview #' + flightLog['id'];
  document.getElementById('flightLogModalBody').innerHTML = `
  <select id="tacviewLocation" class="form-select form-select-lg mb-3" aria-label=".form-select-lg example">
    <option value="69" ${selected}>Select tacview map location</option>
    <option value="0" ${selected0}>Caucuses</option>
    <option value="1" ${selected1}>Nevada</option>
    <option value="2" ${selected2}>Normandy</option>
    <option value="3" ${selected3}>Persian Gulf</option>
    <option value="4" ${selected4}>The Channel</option>
    <option value="5" ${selected5}>Syria</option>
    <option value="6" ${selected6}>Marianas Islands</option>
    <option value="7" ${selected7}>South Atlantic</option>
  </select>`;

  document.getElementById('flightLogModalFooter').appendChild(document.createElement("div")).innerHTML = '<button type="button" class="btn btn-secondary btn-success" id="saveTacview">Save</button>';

  flightLogModal.show();
};

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
  manifest = appDir.read("package.json", "json");
  document.querySelector("title").innerHTML = "DCS War Room v" + manifest.version;
});

ipcRenderer.on("flightlogsDeleteFlight", () => {
// TODO: make all ipcRenderers promises using `await ipcRenderer.invoke`
});

//
// Initially get all flightlogs from database
//
async function loadFlightLogs(refresh) {
  (async () => {
    try {
      const flightLogs = await ipcRenderer.invoke('flightlogs', 'SELECT * FROM flightlogs ORDER BY id DESC;');
      let flightLogsTable = document.querySelector(".flight-logs");

      if(refresh) {
        flightLogsTable.innerHTML = '';
      };

      for(let i = 0; i < flightLogs.length; i++) {

        let location = '';

        if(flightLogs[i].location == '0') {
          location = 'Caucuses';
        } else if(flightLogs[i].location == '1') {
          location = 'Nevada';
        } else if(flightLogs[i].location == '2') {
          location = 'Normandy';
        } else if(flightLogs[i].location == '3') {
          location = 'Persian Gulf';
        } else if(flightLogs[i].location == '4') {
          location = 'The Channel';
        } else if(flightLogs[i].location == '5') {
          location = 'Syria';
        } else if(flightLogs[i].location == '6') {
          location = 'Mariana Islands';
        } else if(flightLogs[i].location == '7') {
          location = 'South Atlantic';
        } else {
          location = 'Not set'
        }

        //
        // Format dates
        //
        const import_date1 = new Date(flightLogs[i].import_date);
        const date1Month = import_date1.getMonth() + 1;
        const import_date = import_date1.getFullYear() + '-' + ('0' + date1Month).substr(-2) + '-' + ('0' + import_date1.getDate()).substr(-2) + ' @ ' + ('0' + import_date1.getHours()).substr(-2) + ':' + ('0' + import_date1.getMinutes()).substr(-2);

        const flight_date1 = new Date(flightLogs[i].flight_date);
        const date2Month = flight_date1.getMonth() + 1;
        const flight_date = flight_date1.getFullYear() + '-' + ('0' + date2Month).substr(-2) + '-' + ('0' + flight_date1.getDate()).substr(-2) + ' @ ' + ('0' + flight_date1.getHours()).substr(-2) + ':' + ('0' + flight_date1.getMinutes()).substr(-2);

        //
        // Append to flightlog table
        //
        let flightLogsTableRow = document.createElement("tr");
        flightLogsTable.appendChild(flightLogsTableRow).setAttribute('id', 'row-' + flightLogs[i].id);

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = flightLogs[i].id

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = flightLogs[i].filename

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = flightLogs[i].server;

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = location;

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = import_date;

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = flight_date;

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowEdit-' + flightLogs[i].id + '" class="btn btn-secondary edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/></svg></button>';

        flightLogsTableRow.appendChild(document.createElement("td"))
          .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + flightLogs[i].id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';
      };

      document.querySelectorAll('.flight-logs')
      .forEach(function(el) {
        el.querySelectorAll('td').forEach(function(el) {
          el.setAttribute('class', 'align-middle')
        });
      });

      const loading = document.getElementById('loading');
      loading?.remove();

      if(flightLogsTable.childElementCount > 1) {
        const noFlightLogs = document.getElementById('noFlightLogs');
        noFlightLogs?.remove();
      }
    } catch(err) {
      console.log(err);
    }
  })();
}
loadFlightLogs();

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
    document.querySelector("title").innerHTML = "DCS War Room v" + manifest.version + ' !!!IMPORTING TACVIEW!!!';
    document.querySelector(".importing").style.display = "block";
    document.querySelector(".import-tacview").style.display = "none";
    document.querySelector("body").style.cursor = 'wait';
    document.querySelectorAll('.nav-link')
    .forEach(function(element) {
      element.classList.add("disabled")
    });
    document.querySelectorAll('.delete')
    .forEach(function(element) {
      element.classList.add("disabled")
    });
  } else {
    document.querySelector("title").innerHTML = "DCS War Room v" + manifest.version;
    document.querySelector(".importing").style.display = "none";
    document.querySelector(".import-tacview").style.display = "block";
    document.querySelector("body").style.cursor = 'default';
    document.querySelectorAll('.nav-link')
    .forEach(function(element) {
      element.classList.remove("disabled")
    });
    document.querySelectorAll('.delete')
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

      //
      // Enable UI
      //
      disableUI(false);

      console.log(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);
    } else {

      //
      // Check the execution type
      // Current types are STRING: tacview
      //
      if(props[0] ==='tacview') {
        let fileName = props[1];
        let flightId;

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
        const currentDate = new Date().toISOString();

        //
        // Handle the SQLite database import here
        // After successful import delete the old CSV file for cleanup
        //
        (async () => {
          const flightLogData = await ipcRenderer.invoke('addFlightLog', 'INSERT INTO flightlogs (filename, import_date, flight_date) VALUES("' + tacviewFileName + '", "' + currentDate + '", "' + importDate + '");');
          const flightLog = flightLogData[0];
          flightId = flightLog.id;

          //
          // Format dates
          //
          const date1 = new Date(flightLog.import_date);
          const date1Month = date1.getMonth() + 1;
          const date2 = date1.getFullYear()+'-' +('0' + date1Month).substr(-2) + '-' + ('0' + date1.getDate()).substr(-2) + ' @ ' + ('0' + date1.getHours()).substr(-2) + ':' + ('0' + date1.getMinutes()).substr(-2);

          const flight_date1 = new Date(flightLog.flight_date);
          const date2Month = flight_date1.getMonth() + 1;
          const flight_date = flight_date1.getFullYear() + '-' + ('0' + date2Month).substr(-2) + '-' + ('0' + flight_date1.getDate()).substr(-2) + ' @ ' + ('0' + flight_date1.getHours()).substr(-2) + ':' + ('0' + flight_date1.getMinutes()).substr(-2);

          let location = '';
          if(flightLog.location == '0') {
            location = 'Caucuses';
          } else if(flightLog.location == '1') {
            location = 'Nevada';
          } else if(flightLog.location == '2') {
            location = 'Normandy';
          } else if(flightLog.location == '3') {
            location = 'Persian Gulf';
          } else if(flightLog.location == '4') {
            location = 'The Channel';
          } else if(flightLog.location == '5') {
            location = 'Syria';
          } else if(flightLog.location == '6') {
            location = 'Mariana Islands';
          } else if(flightLog.location == '7') {
            location = 'South Atlantic';
          } else {
            location = 'Not set'
          }

          //
          // Add Row to UI (add to top of table as table is ordered DESC sort)
          //
          let flightLogsTable = document.querySelector(".flight-logs");
          let flightLogsTableRow = document.createElement("tr");

          flightLogsTable.insertBefore(flightLogsTableRow, flightLogsTable.firstChild).setAttribute('id', 'row-' + flightLog.id);

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = flightLog.id;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = flightLog.filename;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = flightLog.server;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = location;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = date2;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = flight_date;

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowEdit-' + flightLog.id + '" class="btn btn-secondary edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16"><path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z"/></svg></button>';

          flightLogsTableRow.appendChild(document.createElement("td"))
            .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + flightLog.id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';

          if(flightLogsTable.childElementCount > 1) {
            const noFlightLogs = document.getElementById('noFlightLogs');
            noFlightLogs?.remove();
          }

          const loading = document.getElementById('loading');
          loading?.remove();

          document.querySelectorAll('.flight-logs')
          .forEach(function(el) {
            el.querySelectorAll('td').forEach(function(el) {
              el.setAttribute('class', 'align-middle')
            });
          });

          //
          // Insert CSV rendered from Tacview generation into flightlogimports
          // + Add flightlog id for inserted flight log into flightlogimport flightlog_id column
          //
          let CSVFileLocation = rootPath + '\\' + tacviewFileName + '.csv';
          let csvPromise = getCSV(CSVFileLocation);
          csvPromise.then(function(result) {

            const database = new sqlite3.Database(dbPath, (err) => {
              if (err) console.error('Database opening error (Flight Log Import): ', err);
            });

            database.serialize(function() {

              //
              // Insert items from CSV into flightlogimports table
              //
              for(let i = 0; i < result.length; i++) {
                let log = result[i];
                database.run("INSERT INTO flightlogimports"
                  + " (mission_time, primary_object_id, primary_object_name, primary_object_coalition, primary_object_pilot, primary_object_registration, primary_object_squawk, event, occurences, secondary_object_id, secondary_object_name, secondary_object_coalition, secondary_object_pilot, secondary_object_registration, secondary_object_squawk, relevant_object_id, relevant_object_name, relevant_object_coalition, relevant_object_pilot, relevant_object_registration, relevant_object_squawk, flightlog_id) VALUES"
                  + " ($missionTime, $primaryObjectID, $primaryObjectName, $PrimaryObjectCoalition, $PrimaryObjectPilot, $PrimaryObjectRegistration, $PrimaryObjectSquawk, $Event, $Occurences, $SecondaryObjectID, $SecondaryObjectName, $SecondaryObjectCoalition, $SecondaryObjectPilot, $SecondaryObjectRegistration, $SecondaryObjectSquawk, $RelevantObjectID, $RelevantObjectName, $RelevantObjectCoalition, $RelevantObjectPilot, $RelevantObjectRegistration, $RelevantObjectSquawk, $flightLogID)",
                {
                  $missionTime: log.missionTime,
                  $primaryObjectID: log.primaryObjectID,
                  $primaryObjectName: log.primaryObjectName,
                  $PrimaryObjectCoalition: log.PrimaryObjectCoalition,
                  $PrimaryObjectPilot: log.PrimaryObjectPilot,
                  $PrimaryObjectRegistration: log.PrimaryObjectRegistration,
                  $PrimaryObjectSquawk: log.PrimaryObjectSquawk,
                  $Event: log.Event,
                  $Occurences: log.Occurences,
                  $SecondaryObjectID: log.SecondaryObjectID,
                  $SecondaryObjectName: log.SecondaryObjectName,
                  $SecondaryObjectCoalition: log.SecondaryObjectCoalition,
                  $SecondaryObjectPilot: log.SecondaryObjectPilot,
                  $SecondaryObjectRegistration: log.SecondaryObjectRegistration,
                  $SecondaryObjectSquawk: log.SecondaryObjectSquawk,
                  $RelevantObjectID: log.RelevantObjectID,
                  $RelevantObjectName: log.RelevantObjectName,
                  $RelevantObjectCoalition: log.RelevantObjectCoalition,
                  $RelevantObjectPilot: log.RelevantObjectPilot,
                  $RelevantObjectRegistration: log.RelevantObjectRegistration,
                  $RelevantObjectSquawk: log.RelevantObjectSquawk,
                  $flightLogID: flightId
                });
              }

            });

            //
            // Delete the CSV file
            //
            fs.unlinkSync(CSVFileLocation);

            //
            // Enable UI
            //
            disableUI(false);
            console.log('Fired CSV import queries:', result.length);
          });
        })();
      }
    }
  });
};

//
// Tacview file import dialog handler
//
window.dialog = window.dialog || {};
dialog.handler = {

  //
  // Show the open file dialog
  //
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

      //
      // Strip file name and LOOSELY check for proper file format ex: Tacview-20221116-141049. TODO: Check with regex on this rather than just "Tacview"
      //
      let correctFormat = tacviewFileName.substring(0,7);

      if(correctFormat !== 'Tacview') {
        document.getElementById('flgihtLogModalTitle').innerHTML = 'Error importing Tacview';
        document.getElementById('flgihtLogModalBody').innerHTML = 'It looks like the tacview file you are trying to import does not follow the normal file naming for Tacview! Please read the warning message above the "Import" button.';
        flgihtLogModal.show();
        return;
      }

      //
      // TODO: Check for duplicate tacview file importing via file name, warn the user
      //
      let dupeName;
      if(tacviewFileName === dupeName) {
        document.getElementById('flgihtLogModalTitle').innerHTML = 'Error importing Tacview';
        document.getElementById('flgihtLogModalBody').innerHTML = 'Warning! It looks like you are going to import a duplicate tacview file! Proceed with caution.';
        flgihtLogModal.show();
        return;
      }

      //
      // Disable UI
      //
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

document.addEventListener("click", function(e){
  let target = e.target.closest("#deleteTacviewConfirm");

  //
  // Delete tacview
  //
  if(target) {
    ipcRenderer.send("deleteFlight", 'DELETE FROM flightlogs WHERE id =' + tableRowId);
    ipcRenderer.send("deleteFlight", 'DELETE FROM flightlogimports WHERE flightlog_id =' + tableRowId);
    document.getElementById('row-' + tableRowId).outerHTML = "";
    flightLogModal.hide();
  }
});

document.addEventListener("click", function(e){
  let target = e.target.closest("#saveTacview");

  //
  // Save location for tacview
  //
  if(target) {
    (async () => {
      try {
        tacviewLocation = document.querySelector('#tacviewLocation').value;
        console.log('UPDATE flightlogs SET location="' + tacviewLocation +'" WHERE id=' + tableRowId);
        const flightLog = await ipcRenderer.invoke("updateTacview", 'UPDATE flightlogs SET location=' + tacviewLocation +' WHERE id=' + tableRowId);
        flightLogModal.hide();
      } catch(err) {
        console.log(err);
      }
      flightLogModal.hide();
      loadFlightLogs(true);
    })();
  }
});

document.querySelector("#closeModal").addEventListener(
  "click",
  e => {
    flightLogModal.hide();
    e.preventDefault();
  },
  false
);

//
// Insert BRUH meme. TODO: Fix this up.
//
document.addEventListener("click", function(e){
  let target = e.target.closest(".delete");

  if(target){
    tableRowId = target.id.split("-").pop();
    deleteTacviewModal(tableRowId);
  }
});

document.addEventListener("click", function(e){
  let target = e.target.closest(".edit");

  if(target){
    tableRowId = target.id.split("-").pop();

    //
    // We need to query the tacview log by id, get the current set location if any and set that for the modal and set the global for that value for saving
    //
    (async () => {
      try {
        const flightLog = await ipcRenderer.invoke('getFlightLog', 'SELECT * FROM flightlogs WHERE id=' + tableRowId);
        tacviewLocation = flightLog[0]['location'];
        tacviewModalEdit(flightLog[0]);

      } catch(err) {
        console.log(err);
      }
    })();
  }
});