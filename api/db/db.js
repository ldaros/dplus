const libsql = require("@libsql/client");
const fs = require("fs");
const path = require("path");

const client = libsql.createClient({
  url: "http://db:8080",
});

// Function to execute SQL script
const executeSqlFile = async (filePath) => {
  const sql = fs.readFileSync(filePath, "utf8");
  const statements = sql.split(/;\s*$/gm).filter(Boolean);

  for (const statement of statements) {
    await client.execute({ sql: statement });
  }
};

// Function to insert initial catalogs data from a JSON file
const insertInitialData = async () => {
  const jsonFilePath = path.join(__dirname, "contentData.json");
  const initialData = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  console.log("Checking if initial data exists...");
  const result = await client.execute({
    sql: "SELECT COUNT(*) AS count FROM catalogs",
  });

  const count = result[0].count;

  if (count === 0) {
    console.log("Inserting initial data...");

    for (const item of initialData) {
      const {
        title,
        description,
        tags,
        releaseDate,
        duration,
        availability_regions,
        availability_start,
        availability_end,
        posterUrl,
        backdropUrl,
        streamKey,
      } = item;

      await client.execute(
        `
        INSERT INTO catalogs (title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          title,
          description,
          tags.join(", "),
          releaseDate,
          duration,
          availability_regions.join(", "),
          availability_start,
          availability_end,
          posterUrl,
          backdropUrl,
          streamKey,
        ]
      );
    }
  }
};

const initDb = async () => {
  const sqlFilePath = path.join(__dirname, "init.sql");
  await executeSqlFile(sqlFilePath);
  await insertInitialData();
};

// Initialize database
initDb().catch(console.error);

module.exports = { client };
