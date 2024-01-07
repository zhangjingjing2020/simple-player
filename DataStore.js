const Store = require("electron-store");
const path = require("node:path");
const { v4: uuidv4 } = require("uuid");

class DataStore extends Store {
  constructor(settings) {
    super(settings);
    this.tracks = this.getTracks();
  }

  saveTracks() {
    this.set("tracks", this.tracks);
    return this;
  }

  getTracks() {
    return this.get("tracks") || [];
  }

  addTracks(tracks) {
    if (!Array.isArray(tracks)) {
      return [];
    }
    const tracksWithProps = tracks
      .map((track) => {
        return {
          id: uuidv4(),
          path: track,
          name: path.basename(track),
        };
      })
      .filter((track) => {
        const currentTracksPath = this.getTracks().map((track) => track.path);
        return currentTracksPath.indexOf(track.path) < 0;
      });
    this.tracks = [...this.tracks, ...tracksWithProps];
    return this.saveTracks();
  }

  deleteTrack(id) {
    this.tracks = this.tracks.filter((item) => item.id !== id);
    return this.saveTracks();
  }
}

module.exports = DataStore;
