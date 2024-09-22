module.exports = {
    logType: 3,
    http: {
      port: 3002,
      mediaroot: "/usr/src/app/media",
      allow_origin: "*",
      api: true,
    },
    vod: {
      dir: "/usr/src/app/media/vod",
      mount: "/vod",
    },
    onPreConnect: (id, options, callback) => {
      const token = options.query.token || options.headers["authorization"]?.split(" ")[1];
  
      if (!token) return callback(false); // Deny connection
  
      const jwt = require("jsonwebtoken");
      jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return callback(false);
        options.user = user;
        callback(true);
      });
    },
  };
  