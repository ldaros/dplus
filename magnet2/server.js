import WebTorrent from "webtorrent-hybrid";
import express from "express";
import cors from "cors";
import path from "path";

const app = express();
const client = new WebTorrent();
const PORT = 3000;

const activeTorrents = {};

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(process.cwd(), "public")));

// Endpoint to receive the magnet link and stream the video
app.get("/stream", (req, res) => {
  const { magnetURI } = req.query;

  if (!magnetURI) {
    return res.status(400).json({ message: "Magnet link is required." });
  }

  // Check if the torrent already exists in the client
  let torrent = activeTorrents[magnetURI];

  if (!torrent) {
    // Add torrent if it doesn't exist yet
    client.add(magnetURI, (newTorrent) => {
      torrent = newTorrent;

      // Wait for the torrent to fully load the metadata
      torrent.on('metadata', () => {
        streamTorrentFile(torrent, req, res);
      });
    });

    activeTorrents[magnetURI] = torrent;
  } else {
    streamTorrentFile(torrent, req, res);
  }
});

function streamTorrentFile(torrent, req, res) {
  const file = torrent.files.find((file) => file.name.endsWith(".mp4"));

  if (!file) {
    return res.status(400).json({ message: "No video file found in this torrent." });
  }

  const fileSize = file.length;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    });

    const stream = file.createReadStream({ start, end });
    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.sendStatus(500);
    });
  } else {
    res.writeHead(200, {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    });

    const stream = file.createReadStream();
    stream.pipe(res);

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.sendStatus(500);
    });
  }

  torrent.on("download", (bytes) => {
    console.log(`Progress: ${(torrent.downloaded / torrent.length) * 100}%`);
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
