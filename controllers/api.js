const axios = require("axios");
const key = require("../config.json").key;
const PlaylistInfo = require("../models/playlistInfo");
const responseObject = {
  genericData: {
    id: "",
    totalVideos: "",
    playlistDescription: "",
    playlistThumbnails: {},
  },
  videoRelatedData: [],
};
let playlistVideoArray = [];
let videoData = {
  title: "",
  url: "",
  id: "",
  length: "",
  description: "",
  thumbnails: {},
};
let totalItems = [];
let iterations = 0;

const getPlaylistInfo = async function (id) {
  const playlistId = id;
  let baseURL = "https://youtube.googleapis.com/youtube/v3/playlists";
  try {
    let result = await axios.get(baseURL, {
      params: {
        part: "snippet",
        id: playlistId,
        key: key,
      },
    });
    responseObject.genericData.playlistThumbnails =
      result.data.items[0].snippet.thumbnails;

    return result.data;
  } catch (error) {
    return error;
  }
};
const getVideoDetails = async function (id) {
  const playlistId = id;
  const baseURL = "https://youtube.googleapis.com/youtube/v3/playlistItems";
  const simultaneousHitRequest = async function (token) {
    try {
      console.log("Token");
      iterations++;
      let result = await axios.get(baseURL, {
        params: {
          part: "snippet,contentDetails",
          playlistId: playlistId,
          key: key,
          maxResults: 50,
          pageToken: token,
        },
      });
      result.data.items.forEach((element) => {
        totalItems.push(element);
      });
      if (result.data.nextPageToken) {
        return simultaneousHitRequest(result.data.nextPageToken);
      } else {
        console.log("returning");
        return totalItems;
      }
    } catch (error) {
      return error;
    }
  };
  try {
    let result = await axios.get(baseURL, {
      params: {
        part: "snippet,contentDetails",
        playlistId: playlistId,
        key: key,
        maxResults: 50,
      },
    });
    if (result.data.items) {
      result.data.items.forEach((element) => {
        totalItems.push(element);
      });
    }
    if (result.data.nextPageToken) {
      console.log("Next token");
      return simultaneousHitRequest(result.data.nextPageToken);
    } else {
      console.log("Returning -1");
      return totalItems;
    }
  } catch (error) {
    return error;
  }
};
let getAllVideoIdInArray = async function (data) {
  console.log("Converting into array");
  let videoIdArray = [];
  for (let video of data) {
    videoIdArray.push(video.contentDetails.videoId);
  }
  return videoIdArray;
};

let fetchVideoDetails = async function (videoIdArray) {
  console.log("Fetching video details");
  let maxSearchAllowed = 50;
  let arrLength = videoIdArray.length;
  let numberOfSearches = 0;
  let playListVideoInfo = [];
  while (!(numberOfSearches >= arrLength)) {
    try {
      let baseURL = "https://youtube.googleapis.com/youtube/v3/videos";
      let result = await axios.get(baseURL, {
        params: {
          part: "snippet,contentDetails",
          id: videoIdArray
            .slice(numberOfSearches, numberOfSearches + maxSearchAllowed)
            .toString(),
          key: key,
          maxResults: maxSearchAllowed,
        },
      });
      result.data.items.forEach((video) => {
        playListVideoInfo.push(video);
      });
    } catch (error) {
      return error;
    }
    numberOfSearches = numberOfSearches + maxSearchAllowed;
  }
  return playListVideoInfo;
};
const playlistInfo = async function (id) {
  let dataToSend = {
    status: "",
    data:{},
  };
  let playlistId = id;
  let playListDetails = await getPlaylistInfo(playlistId);
  let videoInfo = await getVideoDetails(playlistId);
  let videoIdArray = await getAllVideoIdInArray(videoInfo);
  let playlistVideoInfo = await fetchVideoDetails(videoIdArray);
  responseObject.genericData.id = playlistId;
  responseObject.genericData.totalVideos = playlistVideoInfo.length;
  responseObject.genericData.playlistDescription =
    playListDetails.items[0].snippet.description;
  responseObject.genericData.playlistThumbnails =
    playListDetails.items[0].snippet.thumbnails;
  playlistVideoInfo.forEach((video) => {
    let videoDetails = Object.create(videoData);
    videoDetails.title = video.snippet.title;
    videoDetails.url = `https://www.youtube.com/watch?v=${video.id}`;
    videoDetails.id = video.id;
    videoDetails.length = video.contentDetails.duration;
    videoDetails.description = video.snippet.description;
    videoDetails.thumbnails = video.snippet.thumbnails;
    responseObject.videoRelatedData.push(videoDetails);
  });
     let responseDataToSend=await PlaylistInfo.create(
        {
          playlistId: responseObject.genericData.id,
          genericData: {
            totalVideos: responseObject.genericData.totalVideos,
            playlistDescription: responseObject.genericData.playlistDescription,
            playlistThumbnails: responseObject.genericData.playlistThumbnails,
          },
          videoRelatedData: responseObject.videoRelatedData,
        },
        function (err, playlist) {
          if (err) {
            console.log(err);
            dataToSend.status = "Error";
            dataToSend.data = err;
            return dataToSend;
          } else {
            console.log("Done");
            dataToSend.status = "Fetched and inserted to DB";
            dataToSend.data = playlist;
            return dataToSend;
          }
       }
      );
  console.log(responseObject);
  console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::")
  return responseObject;
};

module.exports.findPlaylist = async function (req,res,id) {
  let dataToSend = {
    status: '',
    data:{}
  };
  let data=await PlaylistInfo.findOne({ playlistId: id }, async function (err, data) {
    if (err) {
      return { err };
    } else {
      if (data === null) {
        console.log("|||||||||||||||||||||||||")
        var addedToDb = await playlistInfo(id);
        console.log("|||||||||||Added to Db||||||||||");
        console.log(addedToDb);
                dataToSend.status = "Added from DB";
                dataToSend.data = addedToDb;
        return res.send(dataToSend);
      }
      else {
              console.log(data);
        dataToSend.status = "Fetched from DB";
      dataToSend.data = data;
        return res.send(dataToSend);
      }

    }
  });
  // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  // console.log(dataToSend);
  // console.log("************************************************************");
  // console.log(data);
  // return dataToSend;
};
