package controllers

import (
	"api/lib/jwt"
	"api/lib/rest"
	"api/middleware"
	"api/models"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/gorilla/mux"
)

const streamRoot = "/app/media"

type StreamingResponse struct {
	StreamUrl string `json:"streamUrl"`
}

func GetStreamingUrl(w http.ResponseWriter, r *http.Request) {
	catalogItemId := mux.Vars(r)["catalogItemId"]
	if catalogItemId == "" {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "Invalid catalog item id"})
		return
	}

	catalogItemIdInt, err := strconv.ParseInt(catalogItemId, 10, 64)
	if err != nil {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "Invalid catalog item id"})
		return
	}

	catalogItem, err := models.GetCatalogItemById(catalogItemIdInt)

	claims := r.Context().Value(middleware.ClaimsKey).(*jwt.Claims)

	if !strings.Contains(catalogItem.AvailabilityRegions, claims.Region) {
		rest.ErrorUnauthorized(w, rest.Error{Code: 401, Message: "Unauthorized"})
		return
	}

	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	streamToken, err := jwt.CreateStreamToken()
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	streamingResponse := StreamingResponse{
		StreamUrl: "/stream/" + catalogItem.StreamKey + "/" + catalogItem.StreamKey + ".m3u8?token=" + streamToken,
	}

	rest.SuccessResponse(w, streamingResponse)
}

func StreamMedia(w http.ResponseWriter, r *http.Request) {
	// Extract the parameters from the URL
	pathParts := r.URL.Path
	filePath := filepath.Join(streamRoot, pathParts) // Base directory is ./media

	// Check if the file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		rest.ErrorNotFound(w, rest.Error{Code: 404, Message: "File not found"})
		return
	}

	// Serve the file
	http.ServeFile(w, r, filePath) // Serve the file
}
