const { Console } = require('console');
const { ipcRenderer } = require('electron');
const fs = require('fs');
const exec = require('child_process').exec;
const rootPath = require('electron-root-path').rootPath;

ipcRenderer.on('open-dialog-paths-selected', (event, arg)=> {
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
})

ipcRenderer.on('show-message-box-response', (event, args) => {
  dialog.handler.outputMessageboxResponse(args);
})

window.dialog = window.dialog || {},

function(n) {

  //
  // Execute cli commands
  //
  function execute(command, toastTitle) {
    const dwrToast = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(dwrToast);

    exec(command, toastTitle, (error, stdout, stderr) => {
      if (error || stderr || stdout) {
        $('.tacview-toast .toast-body').text(`error: ${error.message} ` + `stderr: ${stderr}` + `stdout: ${stdout}`);
        $('.importing').hide();
        toast.show();
        return;
      } else {
        //
        // Handle the SQLite database import here
        // After successful import delete the old CSV file for cleanup
        //
        $('.toast-title').text(toastTitle);
        $('.tacview-toast .toast-body').text('Success!');
        $('.importing').hide();
        $('#import').show();
        $('.nav-item a').removeClass('disabled');
        $(document.body).css({'cursor' : 'default'});
        toast.show();
      }
    });
  };

  //
  // Get just the tacview file name, no directories and no extensions.
  //
  function getTacviewFileName(fullPath) {
    return fullPath.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, "").replace(/\.[^/.]+$/, ""); // TODO: Clean this up
  }

  dialog.handler = {
    showOpenDialog: function() {
      ipcRenderer.send('show-open-dialog');
    },

    outputSelectedPathsFromOpenDialog: function(paths) {
      if(paths !== null){
        //
        // Read file contents
        // let data = fs.readFileSync(paths[0])
        // console.log(data);

        // if(fs.existsSync(paths)) {
        //   let data = fs.readFileSync(paths, 'utf8').split('\n')
        //   console.log(data);
        // }
        //

        //
        // Automate Tacview csv export
        // Find out if user installed it with or without steam
        // Default steam installation location: C:\Program Files (x86)\Steam\steamapps\common\Tacview
        // Default windows installation location: C:\Program Files (x86)\Tacview
        //
        // TODO: Detect if they have either one installed and error out and tell them they don't have tacview installed ...
        //

        const tacviewPath = fs.existsSync('C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview') ? 'C:\\Program Files (x86)\\Steam\\steamapps\\common\\Tacview' : 'C:\Program Files (x86)\Tacview';
        const command = '"' + tacviewPath + '\\Tacview.exe" -Open:"' + paths[0] + '" -ExportFlightLog:"' + rootPath + '\\' + getTacviewFileName(paths[0]) + '.csv" -Quiet –Quit';
        const toastTitle = 'Imported "' + getTacviewFileName(paths[0]) + '"';

        $('.importing').show();
        $(document.body).css({'cursor' : 'wait'});
        $('#import').hide();
        $('.nav-item a').addClass('disabled');
        execute(command, toastTitle);
      }
    },

    init: function() {
      $('#import').click( function () {
        dialog.handler.showOpenDialog();
      })
    }
  };

  n(function() {
    dialog.handler.init();
    $('.importing, .no-tacviews').hide();    
  })
}(jQuery);