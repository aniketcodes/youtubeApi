const express=require("express");
const port=8000;
const app=express();
const baseURL = "https://www.googleapis.com/youtube/v3/";
const { urlencoded } = require("body-parser");
const ejs = require("ejs");
app.set("view engine", "ejs");
const db = require("./config/mongoose");
app.use(urlencoded());
const multipart = require("connect-multiparty");
const multipartMiddleware = multipart();
const key=require("./config.json").key;
const apiFunctions = require("./controllers/api");
const csvToJSON = require("./controllers/csvToJSON");
//LISTEN route
// app.get("/", apiFunctions.getData);
app.get("/playlist/:id", async function (req, res) {
    let playlistId = req.params.id;
    // await apiFunctions.playlistInfo(playlistId);
    await apiFunctions.findPlaylist(req,res,playlistId);
    
});
app.get("/upload", csvToJSON.uploadScreen);
app.post("/upload",multipartMiddleware,csvToJSON.receiveFile)

app.listen(port,(err)=>{
    if(err){
        return console.log(`Error in running at ${port}`);
    }
    else{
        console.log(`Running at ${port}`);
        console.log(key);
    }
})