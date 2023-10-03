import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

document.querySelector("#app").style.display = "block";

let selectedPilot;
let selectedServer;
let selectedLocation;
//let selectedEvent;

(async () => {

  //
  // All queries TODO: Refactor
  //
  let masterQuery = '';
  let pilotQuery = '';
  let serverQuery = '';
  //let eventQuery = '';
  let locationQuery = '';

  //
  // Set up charts
  //
  let kdChart = document.getElementById("killDeathChart");
  let killDeathChart = new Chart(kdChart, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'NO DATA',
        data: [],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: [
          'rgb(232, 42, 25)'
        ]
      },
      {
        label: 'NO DATA',
        data: [],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: [
          'rgb(51, 207, 70)'
        ]
      }
    ]
    },
    options: {
      normalized: true,
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        },
        x: {
          ticks: {
            beginAtZero: true,
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        }
      },
      layout: {
        //padding: 0
      },
      ticks: {
        precision:0
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#FFF'
          }
        }
      },
      maintainAspectRatio: false
    }
  });

  let mchart = document.getElementById("munitionsChart");
  let munitionChart = new Chart(mchart, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'Used',
        data: [],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(232, 42, 25)',
          'rgb(51, 207, 70)',
          'rgb(49, 175, 52)',
          'rgb(128, 186, 237)',
          'rgb(204, 167, 158)',
          'rgb(123, 194, 212)',
          'rgb(239, 142, 220)',
          'rgb(89, 1, 37)',
          'rgb(225, 238, 50)',
          'rgb(153, 172, 164)',
          'rgb(208, 12, 123)',
          'rgb(138, 123, 247)'
        ],
        hoverOffset: 20
      }]
    },
    options: {
      normalized: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            display: false
          },
          grid: {
            display:false
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#FFF'
          }
        }
      },
      layout: {
        autoPadding: true,
      },
      maintainAspectRatio: false
    }
  });

  let modulechart = document.getElementById("moduleChart");
  let moduleChart = new Chart(modulechart, {
    type: 'pie',
    data: {
      labels: [],
      datasets: [{
        label: 'Used',
        data: [],
        backgroundColor: [
          'rgb(138, 123, 247)',
          'rgb(208, 12, 123)',
          'rgb(225, 238, 50)',
          'rgb(89, 1, 37)',
          'rgb(239, 142, 220)',
          'rgb(123, 194, 212)',
          'rgb(204, 167, 158)',
          'rgb(128, 186, 237)',
          'rgb(49, 175, 52)',
          'rgb(51, 207, 70)',
          'rgb(232, 42, 25)',
          'rgb(153, 172, 164)',
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)',
          'rgb(255, 99, 132)'
        ],
        hoverOffset: 20
      }]
    },
    options: {
      normalized: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            display: false
          },
          grid: {
            display:false
          },
        }
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#FFF'
          }
        }
      },
      layout: {
        autoPadding: true,
      },
      maintainAspectRatio: false
    }
  });

  let FlightTimeChart = document.getElementById("flightTimeChart");
  let flightTimeChart = new Chart(FlightTimeChart, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'NO DATA',
        data: [],
        borderWidth: 2,
        borderColor: '#FFFFFF',
        backgroundColor: [
          'rgb(232, 42, 25)'
        ]
      }
    ]
    },
    options: {
      normalized: true,
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        },
        x: {
          ticks: {
            beginAtZero: true,
            color: 'white'
          },
          grid: {
            color: 'white'
          }
        }
      },
      layout: {
        //padding: 0
      },
      ticks: {
        precision:0
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: '#FFF'
          }
        }
      },
      maintainAspectRatio: false
    }
  });

// Function to populate dropdown
const populateDropdown = async (data, selectEl, defaultValueText) => {
  if (data.length < 1) {
    const option = document.createElement('option');
    option.textContent = defaultValueText;
    option.value = '69';
    selectEl.appendChild(option);
  } else {
    for (const item of data) {
      const option = document.createElement('option');
      option.textContent = item.name || item.trackby || item.prettyname;
      option.value = item.id;
      selectEl.appendChild(option);
    }
  }
};

// Populate tracked pilots dropdown
const trackedPilotData = await ipcRenderer.invoke('getPilots', 'SELECT * FROM pilotdata');
const pilotSelectEl = document.querySelector('#pilotSelect');
populateDropdown(trackedPilotData, pilotSelectEl, 'No pilots added!');

// Populate servers dropdown
const serverData = await ipcRenderer.invoke('getServerList', 'SELECT * FROM multiplayerservers');
const serverSelectEl = document.querySelector('#serverSelect');
populateDropdown(serverData, serverSelectEl, 'No servers added!');

// Populate locations dropdown
const locationData = await ipcRenderer.invoke('getLocations', 'SELECT * FROM locations');
const locationSelectEl = document.querySelector('#locationSelect');
populateDropdown(locationData, locationSelectEl, '');

// Populate events dropdown
// const eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events');
// const eventSelectEl = document.querySelector('#eventSelect');
// populateDropdown(eventData, eventSelectEl, '');

  document.querySelector("#search").addEventListener(
    "click",
    event => {

      masterQuery = '';
      pilotQuery = '';
      serverQuery = '';
      //eventQuery = '';
      locationQuery = '';

      //
      // Get values of dropdowns to build queries dynamically
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

        let trackedPilots = function(type) {
          let trackedPilotType;
          pilotQuery;

          if(type === 'secondary') {
            trackedPilotType = 'secondary_object_pilot';
          } else {
            trackedPilotType = 'primary_object_pilot';
          }

          if(trackedPilotData.length >= 1 && trackedPilotData.length < 2) { // we only have one tracked pilot so bail out but check for both idents
            pilotQuery = `(${trackedPilotType} LIKE "%${trackedPilotData[0].ident1}%")`;

            console.log('only searching for one pilot');
          } else if(trackedPilotData.length > 1) {
            let firstQuery = `(${trackedPilotType} LIKE "%${trackedPilotData[0].ident1}%" OR `;

            for(let i = 0; i < trackedPilotData.length; i++) {
              if(i < 1){
                pilotQuery = firstQuery;

              } else {
                if (i === trackedPilotData.length - 1) {
                  pilotQuery += `${trackedPilotType} LIKE "%${trackedPilotData[i].ident1}%")`;
                } else {
                  pilotQuery += `${trackedPilotType} LIKE "%${trackedPilotData[i].ident1}%" OR `;
                }
              }
            }

            console.log('Searching for all pilots');
          }

          return pilotQuery;
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
          serverQuery = 'AND server='+ serverData[0].id;

          console.log('only searching for one server');

        } else {
          if(serverData.length > 0){
            let firstQuery = 'AND (server='+ serverData[0].id;

            serverQuery += firstQuery;

            for(let i = 1; i < serverData.length; i++) {
              serverQuery += ' OR server=' + serverData[i].id;

              if (i === serverData.length - 1) {
                serverQuery += ')';
              }
            }

            console.log('Searching for all servers');
          }
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
          locationQuery = 'AND location='+ selectedLocation;

          console.log('only searching for one location');
        } else if(locationData.length > 1) {
          let firstQuery = 'AND (location='+ locationData[0].id;

          locationQuery += firstQuery;

          for(let i = 1; i < locationData.length; i++) {
            locationQuery += ' OR location=' + locationData[i].id;

            if (i === locationData.length - 1) {
              locationQuery += ')';
            }
          }

          console.log('Searching for all locations');
        }

        //
        // Event
        //
        // let eventData;

        // if(selectedEvent == 69) { // If they selected all events
        //   eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events');
        // } else {
        //   eventData = await ipcRenderer.invoke('getEvents', 'SELECT * FROM events WHERE name="'+selectedEvent+'"');
        // }

        // if(eventData.length && eventData.length < 2) { // we only have one event added / tagged
        //   eventQuery = 'AND event="'+ selectedEvent+'"';

        //   console.log('only searching for one event');
        // } else if(eventData.length > 1) {
        //   let firstQuery = 'AND (event="'+ eventData[0].name+'"';

        //   eventQuery += firstQuery;

        //   for(let i = 1; i < eventData.length; i++) {
        //     eventQuery += ' OR event="' + eventData[i].name+'"';

        //     if (i === eventData.length - 1) {
        //       eventQuery += ')';
        //     }
        //   }

        //   console.log('Searching for all events');
        // };

        if(trackedPilotData.length > 0 && serverData.length > 0) {

          //
          //  Main pilot select query, based on dropdown selections
          //
          let mainPilotSelect = `SELECT * FROM flightlogimports WHERE ${trackedPilots()} ${serverQuery} ${locationQuery} ORDER BY flightlog_id ASC`;
          console.log('Main Query', mainPilotSelect);

          let mainPilotSelectResults = await ipcRenderer.invoke('flightlogs', mainPilotSelect);
          console.log('ALL events for ALL servers for tracked pilot(s): ', mainPilotSelectResults);

          //
          // Count all deaths from selected pilots(s) based on selections
          //
          let allDeaths = `SELECT event, count(event) FROM flightlogimports WHERE event="HasBeenDestroyed" AND ${trackedPilots()} ${serverQuery} ${locationQuery} GROUP BY event ORDER BY flightlog_id ASC`;
          let allDeathsResults = await ipcRenderer.invoke('flightlogs', allDeaths);

          if(allDeathsResults.length < 1) {
            allDeathsResults = [0];
          }

          //
          // Count all kills from selected pilots(s) based on selections
          //
          let allKills = `SELECT event, count(event) FROM flightlogimports WHERE event="HasBeenDestroyed" AND ${trackedPilots('secondary')} ${serverQuery} ${locationQuery} GROUP BY event ORDER BY flightlog_id ASC`;
          let allKillsResults = await ipcRenderer.invoke('flightlogs', allKills);

          if(allKillsResults.length < 1) {
            allKillsResults = [0];
          }

          //
          // Get all munitions fired based on selections
          //
          let allMunitions = `SELECT * FROM flightlogimports WHERE event="HasFired" AND ${trackedPilots()} ${serverQuery} ${locationQuery} ORDER BY flightlog_id ASC`;
          let allMunitionsResults = await ipcRenderer.invoke('flightlogs', allMunitions);

          if(allMunitionsResults.length < 1) {
            allMunitionsResults = [];
          }

          let munitionTypes = [];
          let munitions = [];

          //
          // Find all and add all munition "occurences" to get total fired by type
          //
          if(allMunitionsResults.length > 0){
            for(let i = 0; i < allMunitionsResults.length; i++) {

              let munitonName = allMunitionsResults[i].secondary_object_name;
              let munitionQuantity = allMunitionsResults[i].occurences;
              let munition = {name: munitonName, quantity: munitionQuantity}

              //
              // We have a dupe but we need to add those occurences to their matching secondary_object_name occurence for a complete total...
              //
              munitions.forEach(munition => {
                if(munition.name === allMunitionsResults[i].secondary_object_name) {
                  munition.quantity = munition.quantity + allMunitionsResults[i].occurences;
                }
              });

              //
              // Only add unique muntions to array
              //
              if(munitionTypes.indexOf(allMunitionsResults[i].secondary_object_name) === -1) {
                munitionTypes.push(munitonName);
                munitions.push(munition);
              }
            }
          }

          //
          // Get all modules used based on selections
          //
          let allModules = `SELECT DISTINCT primary_object_name, primary_object_pilot FROM flightlogimports WHERE ${trackedPilots()} ${serverQuery} ${locationQuery} ORDER BY primary_object_name ASC`;
          let allModulesResults = await ipcRenderer.invoke('flightlogs', allModules);

          if(allModulesResults.length < 1) {
            allModulesResults = [];
          }

          let modules = [];

          //
          // Find all and add all modules used
          //
          if(allModulesResults.length > 0){
            for(let i = 0; i < allModulesResults.length; i++) {
              let moduleCount = 1;
              let module = {
                name: allModulesResults[i].primary_object_name,
                pilot: allModulesResults[i].primary_object_pilot,
                count: moduleCount
              };

              modules.push(module);
            }
          }

          //
          // Get all data for calculating flight times
          //
          let flightTime = `SELECT * FROM flightlogimports WHERE ${trackedPilots()} ${serverQuery} ${locationQuery} AND (event="HasTakenOff" OR event="HasLanded") ORDER BY flightlog_id DESC`;
          let flightTimeResults = await ipcRenderer.invoke('flightlogs', flightTime);
          let hasTakenOffArray = [];
          let hasLandedArray = [];
          let completedFlights = [];

          if(flightTimeResults.length < 1) {
            flightTimeResults = [];
          } else {
            for(let i = 0; i < flightTimeResults.length; i++) {

              //
              // Get all taken off and landed events and associate them to their arrays for further analysis
              // - Landing: Occurs when an aircraft lands at an airbase, farp or ship
              //
              if(flightTimeResults[i].event === 'HasLanded') {
                hasLandedArray.push(flightTimeResults[i]);
              } else {
                hasTakenOffArray.push(flightTimeResults[i]);
              }
            }

            //
            // Compare the take off and landing arrays. If the landing arrays matches a takeoff (via primary object ID & matching flightlogID) push those into completedFlights with the mission time delta calculated to minutes and seconds.
            // Do not count flights that have only take offs and no landings, or landings without any take offs. These are considered incomplete flights.
            //
            hasTakenOffArray.forEach(function(takeOff) {
              // hasLandedArray.forEach(function(landing) {
              //   if(landing.flightlog_id === takeOff.flightlog_id) {
              //     console.log(landing);
              //     //console.log(takeOff);
              //   }
              // });
            });

            console.log(hasLandedArray, hasTakenOffArray);
          }

          console.log('completed', completedFlights);

          //
          // Calculate total flight times per module
          //

          let serverArray = [];
          for(let i = 0; i < mainPilotSelectResults.length; i++) {

            //
            // Get server names from matching server data to the results
            //
            for(let s = 0; s < serverData.length; s++) {
              if(mainPilotSelectResults[i].server === serverData[s].id) {
                let serverName = serverData[s].name;
                if(serverArray.indexOf(serverName) === -1) {
                  serverArray.push(serverName);
                }
              }
            }
          }

          let kills = [allKillsResults[0]['count(event)']]
          let deaths = [allDeathsResults[0]['count(event)']];
          if(kills < 1) kills = 0;
          if(deaths < 1) deaths = 0;

          //
          //
          // Update Charts
          //
          //

          //
          // Kill death chart
          //
          if(serverArray.length > 1) {
            serverArray = ['All Tracked Servers']
          }

          killDeathChart.data.labels = serverArray;
          killDeathChart.data.datasets[0].label = `Deaths`;
          killDeathChart.data.datasets[0].data = deaths;
          killDeathChart.data.datasets[1].label = `Kills`;
          killDeathChart.data.datasets[1].data = [`${kills}`];
          killDeathChart.update();

          //
          // Munitions chart
          //
          munitionChart.data.labels = [];
          munitionChart.data.datasets[0].data = [];
          if(kills < 1) kills = 0;
          if(deaths < 1) deaths = 0;

          if(munitions.length > 0) {
            for (let prop in munitions) {
              munitionChart.data.labels.push('('+munitions[prop].quantity+') '+munitions[prop].name);
              munitionChart.data.datasets[0].data.push(munitions[prop].quantity);
            }
          } else {
            munitionChart.data.labels = ['NO DATA'];
            munitionChart.data.datasets[0].data = [];
          }
          munitionChart.update();

          //
          // Modules chart
          //
          moduleChart.data.labels = [];
          moduleChart.data.datasets[0].data = [];

          if(modules.length > 0) {
            for (let prop in modules) {
              moduleChart.data.labels.push(modules[prop].pilot+' flew a '+modules[prop].name);
              moduleChart.data.datasets[0].data.push(modules[prop].count);
            }
          } else {
            moduleChart.data.labels = ['NO DATA'];
            moduleChart.data.datasets[0].data = [];
          }
          moduleChart.update();

          //
          // Flight time chart
          //
          flightTimeChart.data.labels = [];
          flightTimeChart.data.datasets[0].data = [];

          if(modules.length > 0) {
            for (let prop in modules) {
              flightTimeChart.data.labels.push(modules[prop].pilot+' flew a '+modules[prop].name);
              flightTimeChart.data.datasets[0].data.push(modules[prop].count);
            }
          } else {
            flightTimeChart.data.labels = ['NO DATA'];
            flightTimeChart.data.datasets[0].data = [];
          }
          //flightTimeChart.update();

          //
          // All fired munitions
          //
          // let AllMunitions = `SELECT * FROM flightlogimports WHERE event="HasFired" AND primary_object_id=${mainPilotSelectResults[0].primary_object_id} ORDER BY flightlog_id ASC`;
          // console.log(AllMunitions);

          // let AllMunitionsResults = await ipcRenderer.invoke('flightlogs', AllMunitions);
          // console.log('All fired munitions by selected pilot: ', AllMunitionsResults);

          //
          // Most fired munitions
          //
          // let MostUsedMunition = `SELECT secondary_object_name, count(secondary_object_name) FROM flightlogimports WHERE primary_object_id=${mainPilotSelectResults[0].primary_object_id} GROUP by secondary_object_name`;
          // console.log(MostUsedMunition);

          // let MostUsedMunitionResults = await ipcRenderer.invoke('flightlogs', MostUsedMunition);
          // console.log('Most used munition by selected pilot: ', MostUsedMunitionResults);

        } else {
          console.log('There are no pilots or servers added...');
        }
      })();

      event.preventDefault();
    },
    false
  );
})();
