package rest

import (
	"encoding/json"
	"net/http"
)

type Error struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func ErrorResponse(w http.ResponseWriter, status int, payload Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

func ErrorBadRequest(w http.ResponseWriter, payload Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusBadRequest)
	json.NewEncoder(w).Encode(payload)
}

func ErrorUnauthorized(w http.ResponseWriter, payload Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusUnauthorized)
	json.NewEncoder(w).Encode(payload)
}

func ErrorNotFound(w http.ResponseWriter, payload Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotFound)
	json.NewEncoder(w).Encode(payload)
}

func ErrorInternalServerError(w http.ResponseWriter, payload Error) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusInternalServerError)
	json.NewEncoder(w).Encode(payload)
}

func SuccessResponse(w http.ResponseWriter, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(payload)
}
