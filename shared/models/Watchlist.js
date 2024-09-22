const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  username: { type: String, required: true },
  contents: [
    {
      contentId: { type: String, required: true },
      addedAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model('Watchlist', WatchlistSchema);
