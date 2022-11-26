const { Menu, MenuItem, BrowserWindow } = require("electron");
const i18nBackend = require("i18next-electron-fs-backend");
const whitelist = require("../localization/whitelist");
const isMac = process.platform === "darwin";

const MenuBuilder = function(mainWindow, appName) {

  // https://electronjs.org/docs/api/menu#main-process
  const defaultTemplate = function(i18nextMainBackend) {
    return [
      // { role: "appMenu" }
      ...(isMac
        ? [
            {
              label: appName,
              submenu: [
                {
                  role: "quit",
                  label: i18nextMainBackend.t("Quit")
                }
              ]
            }
          ]
        : []),
      // { role: "fileMenu" }
      {
        label: i18nextMainBackend.t("File"),
        submenu: [
          isMac
            ? {
                role: "close",
                label: i18nextMainBackend.t("Quit")
              }
            : {
                role: "quit",
                label: i18nextMainBackend.t("Exit")
              }
        ]
      },
      // { role: "viewMenu" }
      {
        label: i18nextMainBackend.t("View"),
        submenu: [
          {
            role: "toggledevtools",
            label: i18nextMainBackend.t("Toggle Developer Tools")
          }
        ]
      },
      // { role: "windowMenu" }
      {
        label: i18nextMainBackend.t("Window"),
        submenu: [
          {
            role: "minimize",
            label: i18nextMainBackend.t("Minimize")
          },
          {
            role: "zoom",
            label: i18nextMainBackend.t("Zoom")
          },
          ...(isMac
            ? [
                {
                  type: "separator"
                },
                {
                  role: "front",
                  label: i18nextMainBackend.t("Front")
                },
                {
                  type: "separator"
                },
                {
                  role: "window",
                  label: i18nextMainBackend.t("Window")
                }
              ]
            : [
                {
                  role: "close",
                  label: i18nextMainBackend.t("Close")
                }
              ])
        ]
      }
    ];
  };

  return {
    buildMenu: function(i18nextMainBackend) {
      const menu = Menu.buildFromTemplate(defaultTemplate(i18nextMainBackend));
      Menu.setApplicationMenu(menu);

      return menu;
    }
  };
};

module.exports = MenuBuilder;
