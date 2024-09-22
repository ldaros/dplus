const db = require("../db/db");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

exports.getAllContents = async (req, res) => {
  try {
    const query = req.query.region
      ? { availability_regions: req.query.region }
      : {};

    const contents = await db.client.execute(
      `SELECT * FROM catalogs ${query ? "WHERE availability_regions = ?" : ""}`,
      [query?.availability_regions]
    );

    // format data
    const formattedContents = contents.map((item) => {
      return {
        _id: item.id,
        title: item.title,
        description: item.description,
        genre: item.tags.split(","),
        releaseDate: item.release_date,
        duration: item.duration,
        availability: {
          regions: item.availability_regions.split(","),
          from: item.availability_start,
          to: item.availability_end,
        },
        posterUrl: item.poster_url,
        backdropUrl: item.backdrop_url,
        streamKey: item.stream_key,
      };
    });

    res.json(formattedContents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getContentById = async (req, res) => {
  try {
    const query = await db.client.execute(
      `SELECT * FROM catalogs WHERE id = ?`,
      [req.params.id]
    );
    if (!query.length)
      return res.status(404).json({ message: "Content not found" });

    const content = query[0];

    const userRegion = req.user.region || "BR";
    const now = new Date();
    const isAvailable =
      content.availability_regions.includes(userRegion) &&
      now >= content.availability_start &&
      now <= content.availability_end;

    if (!isAvailable) {
      return res.status(403).json({ message: "Content not available" });
    }

    const streamingToken = jwt.sign(
      {
        userId: req.user.id,
        contentId: content._id,
        stream_key: content.stream_key,
      },
      SECRET_KEY,
      { expiresIn: "2h" }
    );
    const streamingUrl = `/api/streaming/vod/${content.stream_key}/${content.stream_key}.m3u8?token=${streamingToken}`;

    const formattedContent = {
      _id: content.id,
      title: content.title,
      description: content.description,
      genre: content.tags.split(","),
      releaseDate: content.release_date,
      duration: content.duration,
      availability: {
        regions: content.availability_regions.split(","),
        from: content.availability_start,
        to: content.availability_end,
      },
      posterUrl: content.poster_url,
      backdropUrl: content.backdrop_url,
      streamKey: content.stream_key,
    };

    res.json({ content: formattedContent, streamingUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.searchContent = async (req, res) => {
  try {
    const queryParam = req.query.q;

    const query = await db.client.execute(
      `SELECT * FROM catalogs WHERE title LIKE ? OR description LIKE ? or tags LIKE ?`,
      [`%${queryParam}%`, `%${queryParam}%`, `%${queryParam}%`]
    );

    // format data
    const formattedContents = query.map((item) => {
      return {
        _id: item.id,
        title: item.title,
        description: item.description,
        genre: item.tags.split(","),
        releaseDate: item.release_date,
        duration: item.duration,
        availability: {
          regions: item.availability_regions.split(","),
          from: item.availability_start,
          to: item.availability_end,
        },
        posterUrl: item.poster_url,
        backdropUrl: item.backdrop_url,
        streamKey: item.stream_key,
      };
    });

    res.json(formattedContents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
