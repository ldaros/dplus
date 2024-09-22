const NodeMediaServer = require("node-media-server");
const jwt = require("jsonwebtoken");

const config = {
  logType: 3,
  http: {
    port: 8000,
    mediaroot: "./media",
    allow_origin: "*",
    api: true,
  },
  vod: {
    dir: "./media/vod",
    mount: "/vod",
  },
  trans: {
    ffmpeg: "/usr/bin/ffmpeg",
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3:hls_flags=delete_segments]",
        dash: false,
      },
    ],
  },
};

var nms = new NodeMediaServer(config);

// Middleware HTTP for authentication over streaming connection
nms.on("preConnect", (id, options, callback) => {
  const token =
    options.query.token || options.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return callback(false); // Deny the connection
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return callback(false); // Deny the connection
    }

    options.user = user;
    callback(true); // Allow the connection
  });
});

// Start the server
nms.run();
