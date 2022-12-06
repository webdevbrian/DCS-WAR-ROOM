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
  const trackedPilotData = await ipcRenderer.invoke('getPilots', 'SELECT * FROM pilotdata');
  let allTrackPilotQuery;

  if(trackedPilotData.length < 2) { // we only have one tracked pilot so bail out but check for both idents
    allTrackPilotQuery = 'primary_object_pilot LIKE "%' + trackedPilotData[0].ident1 + '%"';

    if(trackedPilotData[0].ident2 !== '') { // if they added another ident, add that to the query
      allTrackPilotQuery += ' or LIKE "%' + trackedPilotData[0].ident2 + '%"';
    }

  } else if(trackedPilotData.length > 1) {
    let firstQuery = 'primary_object_pilot LIKE "%' + trackedPilotData[0].ident1 + '%"';

    for(let i = 0; i < trackedPilotData.length; i++) {
      if(i < 1){
        allTrackPilotQuery = firstQuery;

        if(trackedPilotData[i].ident2 !== '') {
          allTrackPilotQuery += ' or primary_object_pilot LIKE "%' + trackedPilotData[i].ident2 + '%"';
        }
      } else {
        allTrackPilotQuery += ' or primary_object_pilot LIKE "%' + trackedPilotData[i].ident1 + '%"';

        if(trackedPilotData[i].ident2 !== '') {
          allTrackPilotQuery += ' or primary_object_pilot LIKE "%' + trackedPilotData[i].ident2 + '%"';
        }
      }
    }
  }

  const query = `SELECT * FROM flightlogimports
                          WHERE (
                            ${allTrackPilotQuery}
                          )
                          AND (event="HasBeenDestroyed")
                          ORDER BY flightlog_id ASC`;
  console.log(allTrackPilotQuery);
  const allTrackedPilots = await ipcRenderer.invoke('flightlogs', query);
  console.log('all tracked pilots: ', allTrackedPilots);

//
// Populate tracked pilots dropdown
//

console.log(trackedPilotData);



  // for(let i = 0; i < flightLogs.length; i++) {

  //   let location = '';

  //   if(flightLogs[i].location == '0') {
  //     location = 'Caucuses';
  //   } else if(flightLogs[i].location == '1') {
  //     location = 'Nevada';
  //   } else if(flightLogs[i].location == '2') {
  //     location = 'Normandy';
  //   } else if(flightLogs[i].location == '3') {
  //     location = 'Persian Gulf';
  //   } else if(flightLogs[i].location == '4') {
  //     location = 'The Channel';
  //   } else if(flightLogs[i].location == '5') {
  //     location = 'Syria';
  //   } else if(flightLogs[i].location == '6') {
  //     location = 'Mariana Islands';
  //   } else if(flightLogs[i].location == '7') {
  //     location = 'South Atlantic';
  //   } else {
  //     location = 'Not set'
  //   }

  //   console.log(location);
  // }


  // console.log(flightLogs);
  // console.log(pilotLogs);

  // let selected,
  //     selected0,
  //     selected1,
  //     selected2,
  //     selected3,
  //     selected4,
  //     selected5,
  //     selected6,
  //     selected7 = '';

  // if(!flightLog['location']) {
  //   selected = 'selected';
  // } else if(flightLog['location'] == 0) {
  //   selected0 = 'selected';
  // } else if(flightLog['location'] == 1){
  //   selected1 = 'selected';
  // } else if(flightLog['location'] == 2){
  //   selected2 = 'selected';
  // } else if(flightLog['location'] == 3){
  //   selected3 = 'selected';
  // } else if(flightLog['location'] == 4){
  //   selected4 = 'selected';
  // } else if(flightLog['location'] == 5){
  //   selected5 = 'selected';
  // } else if(flightLog['location'] == 6){
  //   selected6 = 'selected';
  // } else if(flightLog['location'] == 7){
  //   selected7 = 'selected';
  // };

  // document.getElementById('pilotSelect').innerHTML = `
  // <select id="pilotSelection" class="form-select form-select-lg mb-3" aria-label=".form-select-lg example">
  //   <option value="69" ${selected}>Select tacview map location</option>
  //   <option value="0" ${selected0}>Caucuses</option>
  //   <option value="1" ${selected1}>Nevada</option>
  //   <option value="2" ${selected2}>Normandy</option>
  //   <option value="3" ${selected3}>Persian Gulf</option>
  //   <option value="4" ${selected4}>The Channel</option>
  //   <option value="5" ${selected5}>Syria</option>
  //   <option value="6" ${selected6}>Marianas Islands</option>
  //   <option value="7" ${selected7}>South Atlantic</option>
  // </select>`;


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
