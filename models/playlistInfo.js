const mongoose = require("mongoose");

//Database Schema

const playlistInfoSchema = new mongoose.Schema({
  playlistId: {
    type: String,
    required: true,
  },
  genericData: {
    totalVideos: {
      type: Number,
    },
    playlistDescription: {
      type: String,
    },
    playlistThumbnails: {},
  },
  videoRelatedData: [],
});

const PlaylistInfo = mongoose.model("PlaylistInfo", playlistInfoSchema);
module.exports = PlaylistInfo;
