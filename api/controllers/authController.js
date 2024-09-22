const jwt = require("jsonwebtoken");
const db = require("../db/db");
const SECRET_KEY = process.env.SECRET_KEY;
const VALID_REGIONS = ["BR", "US", "CA"];

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.client.execute(
      `SELECT * FROM users WHERE email = ? AND password = ?`,
      [email, password]
    );
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.email, region: user.region },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.register = async (req, res) => {
  const { email, nome, password, region } = req.body;
  try {
    if (!VALID_REGIONS.includes(region)) {
      return res.status(400).json({ message: "Invalid region" });
    }

    const user = await db.client.execute(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );
    if (user.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await db.client.execute(
      `INSERT INTO users (email, name, password, region) VALUES (?, ?, ?, ?)`,
      [email, nome, password, region]
    );

    const token = jwt.sign(
      { id: newUser._id, username: newUser.email, region: newUser.region },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
