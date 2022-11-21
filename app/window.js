const { ipcRenderer } = require('electron')

ipcRenderer.on('open-dialog-paths-selected', (event, arg)=> {
  dialog.handler.outputSelectedPathsFromOpenDialog(arg);
})

ipcRenderer.on('show-message-box-response', (event, args) => {
  dialog.handler.outputMessageboxResponse(args);
})

window.dialog = window.dialog || {},

function(n) {

  dialog.handler = {
    showOpenDialog: function() {
      ipcRenderer.send('show-open-dialog');
    },

    outputSelectedPathsFromOpenDialog: function(paths) {
      if(paths !== null){
        const toastLiveExample = document.getElementById('liveToast');
        const toast = new bootstrap.Toast(toastLiveExample);

        $('.tacview-toast .toast-body').text(paths);
        toast.show();
        //alert('user selected: ' + paths);
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

    //
    // Maybe some use in the future: Right click menu 
    //
    // const {remote} = require('electron')
    // const {Menu, MenuItem} = remote
  
    // const menu = new Menu()
  
    // // Build menu one item at a time, unlike
    // menu.append(new MenuItem ({
    //   label: 'MenuItem1',
    //   click() { 
    //     console.log('item 1 clicked')
    //   }
    // }))
    
    // menu.append(new MenuItem({type: 'separator'}))
    // menu.append(new MenuItem({label: 'MenuItem2', type: 'checkbox', checked: true}))
    // menu.append(new MenuItem ({
    //   label: 'MenuItem3',
    //   click() {
    //     console.log('item 3 clicked')
    //   }
    // }))
  
    // // Prevent default action of right click in chromium. Replace with our menu.
    // window.addEventListener('contextmenu', (e) => {
    //   e.preventDefault()
    //   menu.popup(remote.getCurrentWindow())
    // }, false)
  })
}(jQuery);