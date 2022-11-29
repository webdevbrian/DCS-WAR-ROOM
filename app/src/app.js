import "./stylesheets/main.css";
import { ipcRenderer } from "electron";

document.querySelector("#app").style.display = "block";

//
// Quick flightlog statistics - TODO: Join multiple queries here and add multiple stats.
// Stats like: how many flights importing this month, how many tracked pilots, how many tracked munitions
//             how many overall deaths, how many overall kills, the most deadly munition by kill percentage
//             the most used airframe/module by count, the most popular landed airport, the overall most wasted munition (shot but no hits via data)
//
ipcRenderer.send("flightlogs", 'SELECT COUNT(*) AS count FROM flightlogs');
ipcRenderer.on("flightlogsDBResponse", (event, flightLogData) => {
  document.querySelector("#stats").innerHTML = '<strong>FlightLogs</strong>: ' + flightLogData.count;
});

document.querySelector(".electron-website-link").addEventListener(
  "click",
  event => {
    ipcRenderer.send("open-external-link", event.target.href);
    event.preventDefault();
  },
  false
);
