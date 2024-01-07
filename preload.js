const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setTitle: (title) => ipcRenderer.send("set:title", title),
  addMusicWin: () => ipcRenderer.send("add:muisc:win"),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  importMusic: (filePath) => ipcRenderer.invoke("import:music", filePath),
  getTracks: (callback) => {
    ipcRenderer.on("get:tracks", (event, args) => {
      callback(args);
    });
  },
  delMusic: (id) => {
    ipcRenderer.send("del:music", id);
  },
  $: (id) => {
    return document.getElementById(id);
  },
  converDuration: (duration) => {
    const minute = "0" + Math.floor(duration / 60);
    const second = "0" + Math.floor(duration - minute * 60);
    return minute.slice(-2) + ":" + second.slice(-2);
  },
});
