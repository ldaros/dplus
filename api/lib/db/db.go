package db

import (
	"database/sql"
	"fmt"
	"os"
	"sync"

	_ "github.com/lib/pq"
)

type Database struct {
	connection *sql.DB
}

var (
	instance         *Database
	once             sync.Once
	appSchemaVersion = 2
)

// GetDBInstance returns a singleton instance of the Database.
func GetDBInstance() *Database {
	once.Do(func() {
		dbUrl := os.Getenv("POSTGRES_URL")

		db, err := sql.Open("postgres", dbUrl)
		if err != nil {
			fmt.Println("Error opening database:", err)
			os.Exit(1)
		}

		// Set up the singleton instance
		instance = &Database{
			connection: db,
		}
	})

	return instance
}

// GetConnection exposes the connection for use
func (d *Database) GetConnection() *sql.DB {
	return d.connection
}

// Close closes the database connection
func (d *Database) Close() {
	if d.connection != nil {
		err := d.connection.Close()
		if err != nil {
			fmt.Println("Error closing database:", err)
		}
	}
}

func Init() {
	database := GetDBInstance()
	db := database.GetConnection()

	createMetadataTable := `
	CREATE TABLE IF NOT EXISTS metadata (
		key TEXT PRIMARY KEY NOT NULL,
		value TEXT NOT NULL
	);`

	_, err := db.Exec(createMetadataTable)
	if err != nil {
		fmt.Println("Error creating metadata table:", err)
		os.Exit(1)
	}

	// Check the current schema version
	var schemaVersion int
	err = db.QueryRow(`SELECT value FROM metadata WHERE key = 'schema_version'`).Scan(&schemaVersion)

	if err != nil && err != sql.ErrNoRows {
		fmt.Println("Error checking schema version:", err)
		os.Exit(1)
	}

	// If the schema_version does not exist, create the tables
	if err == sql.ErrNoRows {
		fmt.Println("Schema version metadata not found, initializing database schema...")
		initSchema(db)
		schemaVersion = 1
	}

	if schemaVersion < appSchemaVersion {
		fmt.Printf("Schema version outdated (found: %d, expected: %d). Running migrations...\n", schemaVersion, appSchemaVersion)
		runMigrations(db, schemaVersion)
	} else {
		fmt.Println("Schema is up-to-date.")
	}
}

// initSchema creates the initial tables in the database
func initSchema(db *sql.DB) {
	// Example SQL for creating initial tables
	createUsersTable := `
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		region TEXT NOT NULL,
		email TEXT UNIQUE NOT NULL,
		password TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	_, err := db.Exec(createUsersTable)
	if err != nil {
		fmt.Println("Error creating users table:", err)
		os.Exit(1)
	}

	_, err = db.Exec("INSERT INTO metadata (key, value) VALUES ('schema_version', 1) ON CONFLICT DO NOTHING")
	if err != nil {
		fmt.Println("Error setting schema version:", err)
		os.Exit(1)
	}

	fmt.Println("Initial schema created.")
}

func setSchemaVersion(db *sql.DB, version int) {
	_, err := db.Exec(`UPDATE metadata SET value = $1 WHERE key = 'schema_version'`, version)
	if err != nil {
		fmt.Println("Error setting schema version:", err)
		os.Exit(1)
	}
}

func runMigrations(db *sql.DB, currentVersion int) {
	if currentVersion == 1 {
		_, err := db.Exec(`
			CREATE TABLE IF NOT EXISTS catalog_items (
				id SERIAL PRIMARY KEY,
				title TEXT NOT NULL,
				description TEXT,
				tags TEXT,
				release_date TEXT,
				duration INTEGER,
				availability_regions TEXT NOT NULL,
				availability_start TEXT NOT NULL,
				availability_end TEXT NOT NULL,
				poster_url TEXT,
				backdrop_url TEXT,
				stream_key TEXT NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`)
		if err != nil {
			fmt.Println("Error running migration:", err)
			os.Exit(1)
		}

		setSchemaVersion(db, 2)
	}
}
