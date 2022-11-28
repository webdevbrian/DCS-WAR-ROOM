import "./stylesheets/main.css";

import { ipcRenderer } from "electron";
import jetpack from "fs-jetpack";
const fs = require('fs');
const exec = require('child_process').exec;
const rootPath = process.cwd(); // TODO: Verify if this is the same as `exec` (in dev and published app...)

//
// IPC Renderer communications
//
ipcRenderer.send("need-app-path");

ipcRenderer.on('open-dialog-paths-selected', (event, arg)=> {
  console.log('fired get paths from dialog');
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
})

ipcRenderer.on('show-message-box-response', (event, args) => {
  dialog.handler.outputMessageboxResponse(args);
})

ipcRenderer.on("app-path", (event, appDirPath) => {
  const appDir = jetpack.cwd(appDirPath);
  const manifest = appDir.read("package.json", "json");
  document.querySelector("title").innerHTML = "DCS War Room v" + manifest.version;

  console.log(appDirPath);
  console.log(rootPath);
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
    document.querySelector(".nav-item").classList.add("disabled");
  } else {
    document.querySelector(".importing").style.display = "none";
    document.querySelector(".import-tacview").style.display = "block";
    document.querySelector("body").style.cursor = 'default';
    document.querySelector(".nav-item").classList.remove("disabled");
  }
};

//
// Execute cli commands
//
function execute(command, type) {
  console.log('fired execute');
  const dwrToast = document.getElementById('liveToast');
  const toast = new bootstrap.Toast(dwrToast);

  exec(command, type, (error, stdout, stderr) => {
    if (error || stderr || stdout) {
      // $('.tacview-toast .toast-body').text(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);

      // Enable UI
      disableUI(false);

      // toast.show();

      console.log(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);
    } else {



      //
      // Check the execution type
      // Current types are STRING: tacview
      //

      if(type ==='tacview') {
        //
        // Handle the SQLite database import here
        // After successful import delete the old CSV file for cleanup
        //

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

      const tacviewPath = fs.existsSync('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview') ? 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview' : 'C:\Program Files (x86)\Tacview';
      const command = '"' + tacviewPath + '\\Tacview.exe" -Open:"' + paths[0] + '" -ExportFlightLog:"' + rootPath + '\\' + getTacviewFileName(paths[0]) + '.csv" -Quiet –Quit';
      const type = 'Imported "' + getTacviewFileName(paths[0]) + '"';

      // Disable UI
      disableUI(true);

      console.log('fired output selected paths from dialog');

      execute(command, 'tacview');
    }
  },

  init: function() {
    // Click event for tacview import button
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

// Launch all links with this class externally
document.querySelector(".electron-website-link").addEventListener(
  "click",
  event => {
    ipcRenderer.send("open-external-link", event.target.href);
    event.preventDefault();
  },
  false
);
