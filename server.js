const fs = require("fs");
const ytdl = require("ytdl-core");
const express = require("express");
var cors = require("cors");
var path = require("path");
const app = express();

var http = require("http").createServer(app);
const io = require("socket.io")(http);

const port = process.env.PORT || 5000;

var clientGlob = null;
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

getAudio = (videoURL, res) => {
  console.log(videoURL);
  var stream = ytdl(videoURL, {
    quality: "highestaudio",
    filter: "audioonly",
  })
    .on("progress", (chunkSize, downloadedChunk, totalChunk) => {
      // console.log(downloadedChunk);
      clientGlob.emit("progressEventSocket", [
        (downloadedChunk * 100) / totalChunk,
      ]);
      clientGlob.emit("downloadCompletedServer", [downloadedChunk]);
      if (downloadedChunk == totalChunk) {
        console.log("Downloaded");
      }
    })
    .pipe(res);

  ytdl.getInfo(videoURL).then((info) => {
    console.log("title:", info.videoDetails.title);
    console.log("rating:", info.player_response.videoDetails.averageRating);
    console.log("uploaded by:", info.videoDetails.author.name);
    clientGlob.emit("videoDetails", [
      info.videoDetails.title,
      info.videoDetails.author.name,
    ]);
  });
};

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(cors());

app.use(express.static(path.join(__dirname,"client", "build")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "build","client", "index.html"));
});

app.post("/", (req, res) => {
  getAudio(req.body.url, res);
});

io.on("connection", (client) => {
  clientGlob = client;
  console.log("User connected");
});

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
