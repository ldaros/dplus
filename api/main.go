package main

import (
    "api/lib/util"
	"api/lib/db"
	"api/routes"
	"fmt"
	"net/http"
)

func main() {
	// Initialize the database
	db.Init()

    // Load initial items
    util.LoadInitialItems()

	// Register routes
	r := routes.RegisterRoutes()

	// Start the HTTP server
	fmt.Println("Server running on port 3000")
	http.ListenAndServe(":3000", r)
}
