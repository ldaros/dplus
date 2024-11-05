package controllers

import (
	"api/lib/rest"
	"api/models"
	"net/http"
	"strings"
)

type CatalogItemResponse struct {
	Id          int64    `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	ReleaseDate string   `json:"releaseDate"`
	Duration    int      `json:"duration"`
	PosterUrl   string   `json:"posterUrl"`
	BackdropUrl string   `json:"backdropUrl"`
}

func GetCatalogItems(w http.ResponseWriter, r *http.Request) {
	catalogItems, err := models.GetCatalogItems()
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	catalogItemsResponse := []CatalogItemResponse{}
	for _, catalogItem := range catalogItems {
		catalogItemsResponse = append(catalogItemsResponse, CatalogItemResponse{
			Id:          catalogItem.ID,
			Title:       catalogItem.Title,
			Description: catalogItem.Description,
			Tags:        strings.Split(catalogItem.Tags, ","),
			ReleaseDate: catalogItem.ReleaseDate,
			Duration:    catalogItem.Duration,
			PosterUrl:   catalogItem.PosterUrl,
			BackdropUrl: catalogItem.BackdropUrl,
		})
	}

	rest.SuccessResponse(w, catalogItemsResponse)
}

func SearchCatalogItems(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")

	if query == "" {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "query is required"})
		return
	}

	catalogItems, err := models.SearchCatalogItems(query)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	catalogItemsResponse := []CatalogItemResponse{}
	for _, catalogItem := range catalogItems {
		catalogItemsResponse = append(catalogItemsResponse, CatalogItemResponse{
			Id:          catalogItem.ID,
			Title:       catalogItem.Title,
			Description: catalogItem.Description,
			Tags:        strings.Split(catalogItem.Tags, ","),
			ReleaseDate: catalogItem.ReleaseDate,
			Duration:    catalogItem.Duration,
			PosterUrl:   catalogItem.PosterUrl,
			BackdropUrl: catalogItem.BackdropUrl,
		})
	}

	rest.SuccessResponse(w, catalogItemsResponse)
}
