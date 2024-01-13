const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const DataStore = require("./DataStore");

const MusicStore = new DataStore({ name: "MusicData" });

class AppWindow extends BrowserWindow {
  constructor(config, fileLocation) {
    const baseConfig = {
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
      },
      show: false,
      resizable: false,
    };
    const finalConfig = { ...baseConfig, ...config };
    super(finalConfig);
    this.loadFile(fileLocation);
    this.once("ready-to-show", () => {
      this.show();
    });

    // 创建自定义菜单
    const menu = Menu.buildFromTemplate([]);
    // 设置应用程序菜单
    Menu.setApplicationMenu(menu);
  }
}

function handleSetTitle(event, title) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win.setTitle(title);
}

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [{ name: "Music", extensions: ["mp3"] }],
  });
  if (!canceled) {
    return filePaths;
  }
}

function handleImportMusic(event, filePath) {
  if (Array.isArray(filePath) && filePath.length > 0) {
    const updateTracks = MusicStore.addTracks(filePath).getTracks();
    mainWindow.webContents.send("get:tracks", updateTracks);
  }
}

function handleDelMusic(event, id) {
  const updateTracks = MusicStore.deleteTrack(id).getTracks();
  mainWindow.webContents.send("get:tracks", updateTracks);
}

// function createWindow() {
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, "preload.js"),
//     },
//     // x: 1200,
//     // y: 1200,
//     // frame: false,

//     // titleBarStyle: "hidden",

//     // titleBarStyle: "customButtonsOnHover",

//     // titleBarStyle: "hiddenInset",

//     // titleBarStyle: "hidden",
//     // trafficLightPosition: { x: 50, y: 50 },

//     // titleBarStyle: "hidden",
//     // titleBarOverlay: true,
//   });
//   //   mainWindow.setWindowButtonVisibility(false);
//   mainWindow.loadFile("./renderer/index.html");

//   //   mainWindow.webContents.openDevTools();
// }

let mainWindow;
app.whenReady().then(() => {
  mainWindow = new AppWindow(
    { titleBarStyle: "hiddenInset" },
    "./renderer/index.html"
  );

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.send("get:tracks", MusicStore.getTracks());
  });

  app.on("active", () => {
    if (BrowserWindow.getAllWindows().length === 0) new AppWindow();
  });

  ipcMain.on("add:muisc:win", () => {
    const addWindow = new AppWindow(
      {
        width: 500,
        height: 400,
        parent: mainWindow,
      },
      "./renderer/add.html"
    );
  });

  ipcMain.on("set:title", handleSetTitle);
  ipcMain.handle("dialog:openFile", handleFileOpen);
  ipcMain.handle("import:music", handleImportMusic);
  ipcMain.on("del:music", handleDelMusic);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
