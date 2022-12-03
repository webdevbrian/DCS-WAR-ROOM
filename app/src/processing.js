import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

document.querySelector("#app").style.display = "block";

//
// Quick flightlog statistics - TODO: Join multiple queries here and add multiple stats.
// Stats like: how many flights importing this month, how many tracked pilots, how many tracked munitions
//             how many overall deaths, how many overall kills, the most deadly munition by kill percentage
//             the most used airframe/module by count, the most popular landed airport, the overall most wasted munition (shot but no hits via data)
//

(async () => {
  const flightLogData = await ipcRenderer.invoke('flightlogs', 'SELECT COUNT(*) AS count FROM flightlogs');
  const flightLog = flightLogData[0];
  //document.querySelector("#stats").innerHTML = '<strong>FlightLogs</strong>: ' + flightLog.count;
})();

//
// Get and convert current date and time to ISO
//
const currentDate = new Date().toISOString();

//
// Handle the SQLite database import here
// After successful import delete the old CSV file for cleanup
//
let addPilot = function(pilot) {
  (async () => {
    const flightLogData = await ipcRenderer.invoke('addPilot', 'INSERT INTO flightlogs (ident1, ident2, track_by, date_added) VALUES("' + tacviewFileName + '", "' + currentDate + '", "' + currentDate + '");');
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
      .appendChild(document.createElement("div")).innerHTML = flight_date;

    flightLogsTableRow.appendChild(document.createElement("td"))
      .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + flightLog.id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';

    if(flightLogsTable.childElementCount > 1) {
      const noFlightLogs = document.getElementById('noFlightLogs');
      noFlightLogs?.remove();
    }

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

document.querySelector("#addPilot").addEventListener(
  "click",
  e => {

    let processingModal = new bootstrap.Modal(
      document.getElementById("processingModal"),
      {}
    );

    //
    // Add pilot for tracking
    //
    let identifier1 = document.getElementById('identifier1').value;
    let identifier2 = document.getElementById('identifier2').value;
    let trackBy = document.getElementById('trackBy').value;

    if(!identifier1 || !trackBy) {
      document.getElementById('processingModalTitle').innerHTML = 'Error adding pilot';
      document.getElementById('processingModalBody').innerHTML = 'You need to supply at least the first identifier and a "track by" for the pilot you are trying to add.';
      processingModal.show();
      return;
    } else {
      let pilot = [
        identifier1,
        identifier2,
        trackBy
      ];

      console.log(pilot);

      //addPilot(pilot);

      document.getElementById('identifier1').value = '';
      document.getElementById('identifier2').value = '';
      document.getElementById('trackBy').value = '';
    }

    e.preventDefault();
  },
  false
);

// (async () => {
//   const flightLogData = await ipcRenderer.invoke('flightlogs', "SELECT * FROM flightlogimports WHERE primary_object_pilot LIKE '%Phrozen' COLLATE NOCASE");
//   console.log(flightLogData);
// })();

// document.querySelector(".electron-website-link").addEventListener(
//   "click",
//   event => {
//     ipcRenderer.send("open-external-link", event.target.href);
//     event.preventDefault();
//   },
//   false
// );
