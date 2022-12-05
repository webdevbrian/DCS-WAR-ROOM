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
  const pilotData = await ipcRenderer.invoke('getPilots', 'SELECT COUNT(*) AS count FROM pilotdata');
  const flightLog = flightLogData[0];
  const pilotLog = pilotData[0];
  document.querySelector("#stats").innerHTML = '<strong>Flight Logs</strong>: ' + flightLog.count + '<br/>'
                                             + '<strong>Tracked Pilots</strong>: ' + pilotLog.count;
})();

// (async () => {
//   const flightLogData = await ipcRenderer.invoke('flightlogs', "SELECT * FROM flightlogimports WHERE primary_object_pilot LIKE '%Phrozen' COLLATE NOCASE");
//   console.log(flightLogData);
// })();

document.querySelector(".electron-website-link").addEventListener(
  "click",
  event => {
    ipcRenderer.send("open-external-link", event.target.href);
    event.preventDefault();
  },
  false
);
