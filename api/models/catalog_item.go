package models

import (
	"database/sql"
	"errors"
	"time"

	"api/lib/db"
)

type CatalogItem struct {
	ID                  int64     `json:"id"`
	Title               string    `json:"title"`
	Description         string    `json:"description"`
	Tags                string    `json:"tags"`
	ReleaseDate         string    `json:"releaseDate"`
	Duration            int       `json:"duration"`
	AvailabilityRegions string    `json:"availability_regions"`
	AvailabilityStart   string    `json:"availability_start"`
	AvailabilityEnd     string    `json:"availability_end"`
	PosterUrl           string    `json:"posterUrl"`
	BackdropUrl         string    `json:"backdropUrl"`
	StreamKey           string    `json:"streamKey"`
	CreatedAt           time.Time `json:"created_at"`
	UpdatedAt           time.Time `json:"updated_at"`
}

type JSONCatalogItem struct {
	Title               string   `json:"title"`
	Description         string   `json:"description"`
	Tags                []string `json:"tags"`
	ReleaseDate         string   `json:"releaseDate"`
	Duration            int      `json:"duration"`
	AvailabilityRegions []string `json:"availability_regions"`
	AvailabilityStart   string   `json:"availability_start"`
	AvailabilityEnd     string   `json:"availability_end"`
	PosterUrl           string   `json:"posterUrl"`
	BackdropUrl         string   `json:"backdropUrl"`
	StreamKey           string   `json:"streamKey"`
}

func CreateCatalogItem(title, description, tags, releaseDate, availabilityRegions, availabilityStart, availabilityEnd, posterUrl, backdropUrl, streamKey string, duration int) (*CatalogItem, error) {
	catalogItem := &CatalogItem{
		Title:               title,
		Description:         description,
		Tags:                tags,
		ReleaseDate:         releaseDate,
		Duration:            duration,
		AvailabilityRegions: availabilityRegions,
		AvailabilityStart:   availabilityStart,
		AvailabilityEnd:     availabilityEnd,
		PosterUrl:           posterUrl,
		BackdropUrl:         backdropUrl,
		StreamKey:           streamKey,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := dbInsertion(catalogItem); err != nil {
		return nil, err
	}

	return catalogItem, nil
}

func dbInsertion(catalogItem *CatalogItem) error {
	db := db.GetDBInstance()
	_, err := db.GetConnection().Exec(`
		INSERT INTO catalog_items (title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key, created_at, updated_at) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
		catalogItem.Title, catalogItem.Description, catalogItem.Tags, catalogItem.ReleaseDate, catalogItem.Duration, catalogItem.AvailabilityRegions, catalogItem.AvailabilityStart, catalogItem.AvailabilityEnd, catalogItem.PosterUrl, catalogItem.BackdropUrl, catalogItem.StreamKey, catalogItem.CreatedAt, catalogItem.UpdatedAt)

	return err
}

func GetCatalogItemById(id int64) (*CatalogItem, error) {
	catalogItem := &CatalogItem{}

	if err := queryCatalogItem(id, catalogItem); err != nil {
		return nil, err
	}

	return catalogItem, nil
}

func queryCatalogItem(id int64, catalogItem *CatalogItem) error {
	db := db.GetDBInstance()

	err := db.GetConnection().QueryRow(`
		SELECT id, title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key, created_at, updated_at 
		FROM catalog_items 
		WHERE id = $1`, id).Scan(&catalogItem.ID, &catalogItem.Title, &catalogItem.Description, &catalogItem.Tags, &catalogItem.ReleaseDate, &catalogItem.Duration, &catalogItem.AvailabilityRegions, &catalogItem.AvailabilityStart, &catalogItem.AvailabilityEnd, &catalogItem.PosterUrl, &catalogItem.BackdropUrl, &catalogItem.StreamKey, &catalogItem.CreatedAt, &catalogItem.UpdatedAt)

	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return err
	}

	return nil
}

func GetCatalogItems() ([]*CatalogItem, error) {
	db := db.GetDBInstance()
	catalogItems := []*CatalogItem{}

	rows, err := db.GetConnection().Query(`
		SELECT id, title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key, created_at, updated_at 
		FROM catalog_items`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		catalogItem := &CatalogItem{}
		if err := scanCatalogItem(rows, catalogItem); err != nil {
			return nil, err
		}
		catalogItems = append(catalogItems, catalogItem)
	}

	return catalogItems, nil
}

func scanCatalogItem(rows *sql.Rows, catalogItem *CatalogItem) error {
	return rows.Scan(&catalogItem.ID, &catalogItem.Title, &catalogItem.Description, &catalogItem.Tags, &catalogItem.ReleaseDate, &catalogItem.Duration, &catalogItem.AvailabilityRegions, &catalogItem.AvailabilityStart, &catalogItem.AvailabilityEnd, &catalogItem.PosterUrl, &catalogItem.BackdropUrl, &catalogItem.StreamKey, &catalogItem.CreatedAt, &catalogItem.UpdatedAt)
}

func SearchCatalogItems(query string) ([]CatalogItem, error) {
	var catalogItems []CatalogItem

	db := db.GetDBInstance()

	rows, err := db.GetConnection().Query(`
		SELECT id, title, description, tags, release_date, duration, availability_regions, availability_start, availability_end, poster_url, backdrop_url, stream_key, created_at, updated_at 
		FROM catalog_items 
		WHERE title ILIKE $1 OR description ILIKE $1 OR tags ILIKE $1`, "%"+query+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		catalogItem := &CatalogItem{}
		if err := scanCatalogItem(rows, catalogItem); err != nil {
			return nil, err
		}
		catalogItems = append(catalogItems, *catalogItem)
	}

	return catalogItems, nil
}
