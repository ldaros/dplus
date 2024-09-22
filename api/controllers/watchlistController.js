const db = require("../db/db");

exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await db.client.execute(
      `SELECT * FROM watchlist_items WHERE user_id = ?`,
      [req.user.id]
    );

    if (!watchlist.length) return res.json({ contents: [] });

    const formattedWatchlist = watchlist.map((item) => {
      return {
        contentId: item.catalog_id,
        addedAt: item.created_at,
      };
    });

    res.json({ contents: formattedWatchlist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addToWatchlist = async (req, res) => {
  const { contentId } = req.body;

  if (!contentId) {
    return res.status(400).json({ message: "ContentId is required" });
  }

  try {
    const query = await db.client.execute(
      `SELECT * FROM catalogs WHERE id = ?`,
      [contentId]
    );
    if (!query.length)
      return res.status(404).json({ message: "Content not found" });

    const watchlist = await db.client.execute(
      `SELECT * FROM watchlist_items WHERE user_id = ? AND catalog_id = ?`,
      [req.user.id, contentId]
    );
    if (watchlist.length > 0)
      return res
        .status(400)
        .json({ message: "Content is already in watchlist" });

    await db.client.execute(
      `INSERT INTO watchlist_items (user_id, catalog_id) VALUES (?, ?)`,
      [req.user.id, contentId]
    );

    res.status(201).json({ message: "Content added to watchlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeFromWatchlist = async (req, res) => {
  const { contentId } = req.body;

  if (!contentId) {
    return res.status(400).json({ message: "ContentId is required" });
  }

  try {
    const query = await db.client.execute(
      `SELECT * FROM catalogs WHERE id = ?`,
      [contentId]
    );
    if (!query.length)
      return res.status(404).json({ message: "Content not found" });

    const watchlist = await db.client.execute(
      `SELECT * FROM watchlist_items WHERE user_id = ? AND catalog_id = ?`,
      [req.user.id, contentId]
    );
    if (!watchlist.length)
      return res.status(404).json({ message: "Watchlist not found" });

    await db.client.execute(
      `DELETE FROM watchlist_items WHERE user_id = ? AND catalog_id = ?`,
      [req.user.id, contentId]
    );

    res.json({ message: "Content removed from watchlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
