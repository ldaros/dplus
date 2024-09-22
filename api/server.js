const db = require("./db/db");
const express = require("express");
const NodeMediaServer = require("node-media-server");
const nmsConfig = require("./config/mediaServerConfig");
const nms = new NodeMediaServer(nmsConfig);

// Import routes
const authRoutes = require("./routes/authRoutes");
const contentRoutes = require("./routes/contentRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");

const app = express();
app.use(express.json());

// Mount routes
app.use("/auth", authRoutes);
app.use("/contents", contentRoutes);
app.use("/watchlist", watchlistRoutes);

// Start media server
nms.run();

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});
