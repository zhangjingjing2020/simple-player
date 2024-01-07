const API = window.electronAPI;
const btnAddTrack = API.$("btn-add-music");

let musicAudio = new Audio();
let allTracks;
let currentTrack;

btnAddTrack.addEventListener("click", () => {
  API.addMusicWin();
});

window.addEventListener("DOMContentLoaded", () => {
  API.getTracks((tracks) => {
    console.log("tracks==>>", tracks);
    renderListHtml(tracks);
    allTracks = tracks;
  });
});

musicAudio.addEventListener("loadeddata", () => {
  renderPlayerStatusHmtl(currentTrack.name, musicAudio.duration);
});

musicAudio.addEventListener("timeupdate", () => {
  updatePlayerCurrentTime(musicAudio.currentTime, musicAudio.duration);
});

API.$("tracksList").addEventListener("click", (event) => {
  event.preventDefault();
  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;
  if (!id) return;
  if (classList.contains("fa-play")) {
    // 不是同一首歌曲切换地址
    if (currentTrack && id === currentTrack.id) {
      musicAudio.play();
    } else {
      currentTrack = allTracks.find((track) => track.id === id);
      musicAudio.src = currentTrack.path;

      //还原原来图标
      const resetIconEle = document.querySelector(".fa-pause");
      if (resetIconEle) {
        resetIconEle.classList.replace("fa-pause", "fa-play");
        resetIconEle.classList.remove("text-success");
      }
      musicAudio.play();
    }

    classList.replace("fa-play", "fa-pause");
    classList.add("text-success");
  } else if (classList.contains("fa-pause")) {
    musicAudio.pause();
    classList.replace("fa-pause", "fa-play");
  } else if (classList.contains("fa-trash-can")) {
    API.delMusic(id);
  }
});

const renderListHtml = (tracks) => {
  const tracksList = API.$("tracksList");
  const traksListHtml = tracks.reduce((html, current) => {
    return (html += `<li class="row list-group-item d-flex justify-content-between alig-item-center">
          <div class="col-10">
              <i class="fa-solid fa-music text-secondary me-2"></i>
              <b id="music-name">${current.name}</b>
          </div>
          <div class="col-2">
              <i class="fa-solid fa-play me-3" data-id="${current.id}"></i>
              <i class="fa-regular fa-trash-can" data-id="${current.id}"></i>
          </div>
      </li>`);
  }, "");
  const emptyStr = `<div class="alert alert-primary">您还没有导入任何歌曲</div>`;
  tracksList.innerHTML = tracks.length
    ? `<ul class="list-group">${traksListHtml}</ul>`
    : emptyStr;
};

const renderPlayerStatusHmtl = (name, duration) => {
  const playerStatus = API.$("player-status");
  const html = `<div class="col font-weight-bold">
                    <i class="fa-solid fa-signal"></i>
                    正在播放：<span class="text-success">${name}</span>
                </div>
                <div class="col">
                    <span id="current-seeker" class="text-success">00:00</span> / ${API.converDuration(
                      duration
                    )}
                </div>`;
  playerStatus.innerHTML = html;
};

const updatePlayerCurrentTime = (currentTime, duration) => {
  const seeker = API.$("current-seeker");
  seeker.innerHTML = API.converDuration(currentTime);

  const bar = API.$("player-progress");
  //计算进度
  const progress = Math.floor((currentTime / duration) * 100);
  bar.innerHTML = progress + "%";
  bar.style.width = progress + "%";
};
