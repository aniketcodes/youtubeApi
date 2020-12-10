const fs = require("fs");
const toJson = require("convert-excel-to-json");
module.exports.uploadScreen = function (req, res) {
 res.render("uploadFile");
};

module.exports.receiveFile = async function (req, res) {
 console.log("Receiving file")
	var tmp_path = req.files.file.path;
 var fileName = "data.xlsx"
 let data=fs.readFileSync(tmp_path);
 console.log("reading");
 console.log("convertingToJson");
 let readFileFromURL = function () {
   const result = toJson({
     source: data,
   });
   // console.log(result);
   return result;
 };
 let result = readFileFromURL();
 console.log(result.Sheet1);
 let playListIds = [];
 result.Sheet1.slice(1).forEach((coloumn) => {
  console.log(coloumn.J);
  playListIds.push(coloumn.J);
 })

 return res.render("playlists",{playlistsArray:playListIds});
}