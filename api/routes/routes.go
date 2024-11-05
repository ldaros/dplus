package routes

import (
	"api/controllers"
	"api/middleware"

	"github.com/gorilla/mux"
)

// RegisterRoutes sets up the routes for the application
func RegisterRoutes() *mux.Router {
	r := mux.NewRouter()

	// Define the routes and map them to controller functions
	r.HandleFunc("/auth/login", controllers.Login).Methods("POST")
	r.HandleFunc("/auth/register", controllers.Register).Methods("POST")

	r.HandleFunc("/catalog", middleware.Auth(controllers.GetCatalogItems)).Methods("GET")
	r.HandleFunc("/catalog/{catalogItemId}", middleware.Auth(controllers.GetStreamingUrl)).Methods("GET")
	r.HandleFunc("/search", middleware.Auth(controllers.SearchCatalogItems)).Methods("GET")

	r.HandleFunc("/stream/{something:.+}", controllers.StreamMedia).Methods("GET")

	return r
}
