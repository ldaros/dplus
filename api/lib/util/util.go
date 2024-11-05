package util

import (
	"api/lib/db"
	"api/models"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"
)

func Contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func Join(slice []string, sep string) string {
	return strings.Join(slice, sep)
}

func LoadInitialItems() error {
	db := db.GetDBInstance()

	// Check if initial items have been loaded
	var initialItemsLoaded string
	err := db.GetConnection().QueryRow(`
		SELECT value FROM metadata WHERE key = 'initial_items_loaded'`).Scan(&initialItemsLoaded)

	if err != nil && err != sql.ErrNoRows {
		return err
	}

	// If initial items have been loaded, return
	if initialItemsLoaded == "true" {
		fmt.Println("Initial items have already been loaded")
		return nil
	}

	fmt.Println("Loading initial items...")

	jsonData, err := os.ReadFile("./media/data.json")
	if err != nil {
		return err
	}

	var jsonItems []models.JSONCatalogItem
	err = json.Unmarshal(jsonData, &jsonItems)
	if err != nil {
		return err
	}

	for _, jsonItem := range jsonItems {
		catalogItem := &models.CatalogItem{
			Title:               jsonItem.Title,
			Description:         jsonItem.Description,
			Tags:                Join(jsonItem.Tags, ","),
			ReleaseDate:         jsonItem.ReleaseDate,
			Duration:            jsonItem.Duration,
			AvailabilityRegions: Join(jsonItem.AvailabilityRegions, ","),
			AvailabilityStart:   jsonItem.AvailabilityStart,
			AvailabilityEnd:     jsonItem.AvailabilityEnd,
			PosterUrl:           jsonItem.PosterUrl,
			BackdropUrl:         jsonItem.BackdropUrl,
			StreamKey:           jsonItem.StreamKey,
		}

		if _, err := db.GetConnection().Exec(`INSERT INTO catalog_items (title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
			catalogItem.Title, catalogItem.Description, catalogItem.Tags, catalogItem.ReleaseDate, catalogItem.Duration, catalogItem.AvailabilityRegions, catalogItem.AvailabilityStart, catalogItem.AvailabilityEnd, catalogItem.PosterUrl, catalogItem.BackdropUrl, catalogItem.StreamKey); err != nil {
			return err
		}

		if err != nil {
			return err
		}

		_, err = db.GetConnection().Exec(`
			INSERT INTO metadata (key, value)
			VALUES ('initial_items_loaded', 'true')
			ON CONFLICT DO NOTHING`)

		if err != nil {
			return err
		}

	}

	fmt.Println("Initial items loaded successfully")

	return nil
}
