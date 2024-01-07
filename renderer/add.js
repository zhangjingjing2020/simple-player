const API = window.electronAPI;
const btnSelectMusic = API.$("btn-select-music");
const btnImportMusic = API.$("btn-import-music");

let muiscFilePath = [];
btnSelectMusic.addEventListener("click", async () => {
  const filePath = await API.openFile();
  muiscFilePath = filePath;
  renderListHtml(filePath);
});

btnImportMusic.addEventListener("click", async () => {
  await API.importMusic(muiscFilePath);
});

const renderListHtml = (filePath) => {
  if (Array.isArray(filePath) && filePath.length > 0) {
    const musicList = API.$("music-list");
    const listItems = filePath.reduce((html, current) => {
      return (html += `<li class="list-group-item">${current
        .split("/")
        .pop()}</li>`);
    }, "");

    musicList.innerHTML = `<ul class="list-group">${listItems}</ul>`;
  }
};
