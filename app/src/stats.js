import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

document.querySelector("#app").style.display = "block";

let selectedPilot;
let selectedServer;
let selectedLocation;
let selectedEvent;

(async () => {

  //
  // Build ALL tracked pilot query (Default)
  //
  let masterQuery;

  //
  // Populate tracked pilots dropdown
  //
  const trackedPilotData = await ipcRenderer.invoke('getPilots', 'SELECT * FROM pilotdata');
  let pilotSelectedOption = '';
  const pilotSelectEl = document.querySelector('#pilotSelect');

  if(trackedPilotData.length < 1) {
    const pilotSelectedOption = document.createElement('option');
    const selectName = document.createTextNode('No pilots added!');
    pilotSelectedOption.appendChild(selectName);
    pilotSelectedOption.setAttribute('value',`69`);
    pilotSelectEl.appendChild(pilotSelectedOption);
  } else {
    for(let i = 0; i < trackedPilotData.length; i++) {
      const pilotSelectedOption = document.createElement('option');
      const selectName = document.createTextNode(trackedPilotData[i].trackby);
      pilotSelectedOption.appendChild(selectName);
      pilotSelectedOption.setAttribute('value',`${trackedPilotData[i].id}`);
      pilotSelectEl.appendChild(pilotSelectedOption);
    };
  }

  //
  // Populate servers dropdown
  //
  const serverData = await ipcRenderer.invoke('getServerList', 'SELECT * FROM multiplayerservers');
  let serverSelectedOption = '';
  const serverSelectEl = document.querySelector('#serverSelect')

  for(let i = 0; i < serverData.length; i++) {
    const serverSelectedOption = document.createElement('option');
    const selectName = document.createTextNode(serverData[i].name);
    serverSelectedOption.appendChild(selectName);
    serverSelectedOption.setAttribute('value',`${serverData[i].id}`);
    serverSelectEl.appendChild(serverSelectedOption);
  };

  //
  // Populate locations dropdown
  //
  const locationData = await ipcRenderer.invoke('getLocations', 'SELECT * FROM locations');
  let locationSelectedOption = '';
  const locationSelectEl = document.querySelector('#locationSelect')

  for(let i = 0; i < locationData.length; i++) {
    const locationSelectedOption = document.createElement('option');
    const selectName = document.createTextNode(locationData[i].name);
    locationSelectedOption.appendChild(selectName);
    locationSelectedOption.setAttribute('value',`${locationData[i].id}`);
    locationSelectEl.appendChild(locationSelectedOption);
  }

  //
  // Populate events dropdown
  //
  // const eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events');
  // let eventSelectedOption = '';
  // const eventSelectEl = document.querySelector('#eventSelect')

  // for(let i = 0; i < eventData.length; i++) {
  //   const eventSelectedOption = document.createElement('option');
  //   const selectName = document.createTextNode(eventData[i].prettyname);
  //   eventSelectedOption.appendChild(selectName);
  //   eventSelectedOption.setAttribute('value',`${eventData[i].name}`);
  //   eventSelectEl.appendChild(eventSelectedOption);
  // }

  document.querySelector("#search").addEventListener(
    "click",
    event => {

      masterQuery = '';

      //
      // Build query function to run off of dropdown selections
      //
      selectedPilot = document.querySelector('#pilotSelect').value;
      selectedServer = document.querySelector('#serverSelect').value;
      selectedLocation = document.querySelector('#locationSelect').value;
      // selectedEvent = document.querySelector('#eventSelect').value;

      (async () => {
        //
        // Pilot
        //
        let trackedPilotData;
        if(selectedPilot == 69) {
          trackedPilotData = await ipcRenderer.invoke('getPilots', 'SELECT * FROM pilotdata');
        } else {
          trackedPilotData = await ipcRenderer.invoke('getPilots', 'SELECT * FROM pilotdata WHERE id='+selectedPilot);
        }

        if(trackedPilotData.length >= 1 && trackedPilotData.length < 2) { // we only have one tracked pilot so bail out but check for both idents
          masterQuery = 'primary_object_pilot LIKE "%' + trackedPilotData[0].ident1 + '%"';

          if(trackedPilotData[0].ident2 !== '') { // if they added another ident, add that to the query
            masterQuery += ' OR primary_object_pilot LIKE "%' + trackedPilotData[0].ident2 + '%"';
          }

          console.log('only searching for one pilot');
        } else if(trackedPilotData.length > 1) {
          let firstQuery = 'primary_object_pilot LIKE "%' + trackedPilotData[0].ident1 + '%" OR (';

          for(let i = 0; i < trackedPilotData.length; i++) {
            if(i < 1){
              masterQuery = firstQuery;

              if(trackedPilotData[i].ident2 !== '') {
                masterQuery += ' OR primary_object_pilot LIKE "%' + trackedPilotData[i].ident2 + '%"';
              }
            } else {
              if (i === trackedPilotData.length - 1) {
                if(trackedPilotData[i].ident2 === '') { // if the last pilot in the list does not have a second ident, bail out
                  masterQuery += 'primary_object_pilot LIKE "%' + trackedPilotData[i].ident1 + '%")';
                } else {
                  masterQuery += ' primary_object_pilot LIKE "%' + trackedPilotData[i].ident2 + '%")';
                }
              } else {
                masterQuery += 'primary_object_pilot LIKE "%' + trackedPilotData[i].ident1 + '%" OR ';

                if(trackedPilotData[i].ident2 !== '') {
                  masterQuery += ' primary_object_pilot LIKE "%' + trackedPilotData[i].ident2 + '%" OR ';
                }
              }
            }
          }

          console.log('Searching for all pilots');
        }

        //
        // Server
        //
        let serverData;

        if(selectedServer == 69) { // If they selected all servers
          serverData = await ipcRenderer.invoke('getServerList', 'SELECT * FROM multiplayerservers');
        } else {
          serverData = await ipcRenderer.invoke('getServerList', 'SELECT * FROM multiplayerservers WHERE id='+selectedServer);
        }

        if(serverData.length >= 1 && serverData.length < 2) { // we only have one server added / tagged
          masterQuery += ' AND server='+ selectedServer;

          console.log('only searching for one server');
        } else if(serverData.length > 1) {
          let firstQuery = ' AND (server='+ serverData[0].id;

          masterQuery += firstQuery;

          for(let i = 1; i < serverData.length; i++) {
            masterQuery += ' OR server=' + serverData[i].id;

            if (i === serverData.length - 1) {
              masterQuery += ')';
            }
          }

          console.log('Searching for all servers');
        }

        //
        // Location
        //
        let locationData;

        if(selectedLocation == 69) { // If they selected all locationss
          locationData = await ipcRenderer.invoke('getLocations', 'SELECT * FROM locations');
        } else {
          locationData = await ipcRenderer.invoke('getLocations', 'SELECT * FROM locations WHERE id='+selectedLocation);
        }

        if(locationData.length && locationData.length < 2) { // we only have one location added / tagged
          masterQuery += ' AND location='+ selectedLocation;

          console.log('only searching for one location');
        } else if(locationData.length > 1) {
          let firstQuery = ' AND (location='+ locationData[0].id;

          masterQuery += firstQuery;

          // for(let i = 0; i < trackedPilotData.length; i++) {
          for(let i = 1; i < locationData.length; i++) {
            masterQuery += ' OR location=' + locationData[i].id;

            if (i === locationData.length - 1) {
              masterQuery += ')';
            }
          }

          console.log('Searching for all locations');
        }

        //
        // Event
        //
        let eventData;

        if(selectedEvent == 69) { // If they selected all events
          eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events');
        } else {
          eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events WHERE name="'+selectedEvent+'"');
        }

        if(eventData.length && eventData.length < 2) { // we only have one event added / tagged
          masterQuery += ' AND event="'+ selectedEvent+'"';

          console.log('only searching for one event');
        } else if(eventData.length > 1) {
          let firstQuery = ' AND (event="'+ eventData[0].name+'"';

          masterQuery += firstQuery;

          for(let i = 1; i < eventData.length; i++) {
            masterQuery += ' OR event="' + eventData[i].name+'"';

            if (i === eventData.length - 1) {
              masterQuery += ')';
            }
          }

          console.log('Searching for all events');
        }

        if(trackedPilotData.length > 0 && serverData.length > 0) {
          const query = `SELECT * FROM flightlogimports WHERE (${masterQuery}) ORDER BY flightlog_id ASC`;
          console.log(query);

          const results = await ipcRenderer.invoke('flightlogs', query);
          console.log('result: ', results); //result.length > 0?
        } else {
          console.log('There are no pilots or servers added...');
        }

      })();

      event.preventDefault();
    },
    false
  );

})();

window.addEventListener('load', function () {
  // const ctx = document.getElementById('myChart');

  // new Chart(ctx, {
  //   type: 'bar',
  //   data: {
  //     labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  //     datasets: [{
  //       label: '# of test pilot data',
  //       data: [12, 19, 3, 5, 2, 3],
  //       borderWidth: 3
  //     }]
  //   },
  //   options: {
  //     scales: {
  //       y: {
  //         beginAtZero: true
  //       }
  //     }
  //   }
  // });
}, false); // end load
