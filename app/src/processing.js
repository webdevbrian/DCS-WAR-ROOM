import "./stylesheets/main.css";
import { ipcRenderer, getCurrentWindow } from "electron";

document.querySelector("#app").style.display = "block";
let tableRowId;


//
// Modals
//
let processingModal = new bootstrap.Modal(
  document.getElementById("processingModal"),
  {}
);

let deletePilotModal = function(tableRowID) {
  const deleteButton = document.getElementById('deletePilotConfirm');
  deleteButton?.remove();
  document.getElementById('processingModalTitle').innerHTML = 'Confirm pilot deletion';
  document.getElementById('processingModalBody').innerHTML = '<svg class="bi flex-shrink-0 me-2" width="24" height="24" role="img" aria-label="Warning:"><use xlink:href="#exclamation-triangle-fill"/></svg> Are you sure you want to delete pilot ID #' + tableRowID + '?';
  document.getElementById('processingModalFooter').appendChild(document.createElement("div")).innerHTML = '<button type="button" class="btn btn-secondary btn-danger" id="deletePilotConfirm">Delete</button>';
  processingModal.show();
};

ipcRenderer.on("pilotDelete", () => {
// TODO: make all ipcRenderers promises using `await ipcRenderer.invoke`
});

document.addEventListener("click", function(e){
  let target = e.target.closest("#deletePilotConfirm");

  //
  // Delete tracked pilot
  //
  if(target) {
    ipcRenderer.send("deletePilot", 'DELETE FROM pilotdata WHERE id=' + tableRowId);
    document.getElementById('row-' + tableRowId).outerHTML = "";
    processingModal.hide();
  }
});

document.addEventListener("click", function(e){
  let target = e.target.closest(".delete");

  if(target){
    tableRowId = target.id.split("-").pop();
    deletePilotModal(tableRowId);
  }
});

//
// Build pilot mini table
//
(async () => {
  try {
    const pilotLogs = await ipcRenderer.invoke('getPilots', "SELECT * FROM pilotdata ORDER BY id DESC");
    let pilotTable = document.querySelector(".pilot-logs");

    for(let i = 0; i < pilotLogs.length; i++) {

      //
      // TODO: Need to add the "Last seen" data when that gets added to the pilot model
      //
      // const import_date1 = new Date(pilotLogs[i].date_added);
      // const date1Month = import_date1.getMonth() + 1;
      // const date_added = import_date1.getFullYear() + '-' + ('0' + date1Month).substr(-2) + '-' + ('0' + import_date1.getDate()).substr(-2) + ' @ ' + ('0' + import_date1.getHours()).substr(-2) + ':' + ('0' + import_date1.getMinutes()).substr(-2);

      //
      // Append to pilot table
      //
      let pilotTableRow = document.createElement("tr");
      pilotTable.appendChild(pilotTableRow).setAttribute('id', 'row-' + pilotLogs[i].id);

      pilotTableRow.appendChild(document.createElement("td"))
        .appendChild(document.createElement("div")).innerHTML = pilotLogs[i].id;

      pilotTableRow.appendChild(document.createElement("td"))
        .appendChild(document.createElement("div")).innerHTML = pilotLogs[i].ident1;

      // pilotTableRow.appendChild(document.createElement("td"))
      //   .appendChild(document.createElement("div")).innerHTML = pilotLogs[i].ident2;

      pilotTableRow.appendChild(document.createElement("td"))
        .appendChild(document.createElement("div")).innerHTML = pilotLogs[i].trackby;

      pilotTableRow.appendChild(document.createElement("td"))
      .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + pilotLogs[i].id + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';
    }

    document.querySelectorAll('.pilot-logs')
    .forEach(function(el) {
      el.querySelectorAll('td').forEach(function(el) {
        el.setAttribute('class', 'align-middle')
      });
    });

    const loading = document.getElementById('loading');
    loading?.remove();

    if(pilotTable.childElementCount > 1) {
      const noPilots = document.getElementById('noPilots');
      noPilots?.remove();
    }

    $('#trackedPilots').DataTable();
  } catch(err) {
    console.log(err);
  }

})();

//
// Handle the SQLite database import here
// After successful import delete the old CSV file for cleanup
//
let addPilot = function(pilot) {
  (async () => {

    if(!pilot){
      return;
    }

    //
    // Add pilot to database
    //
    const pilotData = await ipcRenderer.invoke('addPilot', 'INSERT INTO pilotdata (ident1, trackby, date_added) VALUES("' + pilot[0] + '", "' + pilot[1] + '", "' + pilot[2] + '");');
    const pilotLog = pilotData[0];

    //
    // Add Row to UI (add to top of table as table is ordered DESC sort)
    //
    let pilotTable = document.querySelector(".pilot-logs");
    let pilotTableRow = document.createElement("tr");

    pilotTable.insertBefore(pilotTableRow, pilotTable.firstChild).setAttribute('id', 'row-' + pilotLog['id']);

    pilotTableRow.appendChild(document.createElement("td"))
      .appendChild(document.createElement("div")).innerHTML = pilotLog['id'];

    pilotTableRow.appendChild(document.createElement("td"))
      .appendChild(document.createElement("div")).innerHTML = pilotLog['ident1'];

    // pilotTableRow.appendChild(document.createElement("td"))
    //   .appendChild(document.createElement("div")).innerHTML = pilotLog['ident2'];

    pilotTableRow.appendChild(document.createElement("td"))
      .appendChild(document.createElement("div")).innerHTML = pilotLog['trackby'];

    pilotTableRow.appendChild(document.createElement("td"))
    .appendChild(document.createElement("div")).innerHTML = '<button type="button" id="rowDelete-' + pilotLog['id'] + '" class="btn btn-danger delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg></button>';

    if(pilotTable.childElementCount > 1) {
      const noPilots = document.getElementById('noPilots');
      noPilots?.remove();
    }

    document.querySelectorAll('.pilot-logs')
    .forEach(function(el) {
      el.querySelectorAll('td').forEach(function(el) {
        el.setAttribute('class', 'align-middle')
      });
    });

    const loading = document.getElementById('loading');
    loading?.remove();

    document.getElementById('identifier1').value = '';
    // document.getElementById('identifier2').value = '';
    document.getElementById('trackBy').value = '';
  })();
}

document.querySelector("#closeModal").addEventListener(
  "click",
  e => {
    processingModal.hide();
    e.preventDefault();
  },
  false
);

document.querySelector("#addPilot").addEventListener(
  "click",
  e => {

    //
    // Add pilot for tracking
    //
    let identifier1 = document.getElementById('identifier1').value;
    // let identifier2 = document.getElementById('identifier2').value;
    let trackBy = document.getElementById('trackBy').value;
    let dateAdded = new Date().toISOString();

    if(!identifier1 || !trackBy) {
      document.getElementById('processingModalTitle').innerHTML = 'Error adding pilot';
      document.getElementById('processingModalBody').innerHTML = 'You need to supply at least the first identifier and a "track by" for the pilot you are trying to add.';
      processingModal.show();
      return;
    } else {
      let pilot = [
        identifier1,
        // identifier2,
        trackBy,
        dateAdded
      ];

      addPilot(pilot);
    }
    e.preventDefault();
  },
  false
);