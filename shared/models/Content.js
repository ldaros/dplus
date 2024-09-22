const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  genre: [String],
  releaseDate: Date,
  duration: Number,
  availability: {
    regions: [String],
    from: Date,
    to: Date,
  },
  posterUrl: String,
  backdropUrl: String,
  streamKey: String,
});

module.exports = mongoose.model('Content', ContentSchema);
