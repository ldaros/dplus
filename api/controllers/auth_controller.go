package controllers

import (
	"api/lib/jwt"
	"api/lib/rest"
	"api/lib/util"
	"api/models"
	"encoding/json"
	"net/http"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Region   string `json:"region"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string `json:"token"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var request LoginRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "Invalid request body"})
		return
	}

	user, err := models.GetUserByEmail(request.Email)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	if user == nil {
		rest.ErrorUnauthorized(w, rest.Error{Code: 401, Message: "Invalid credentials"})
		return
	}

	if user.Password != request.Password {
		rest.ErrorUnauthorized(w, rest.Error{Code: 401, Message: "Invalid credentials"})
		return
	}

	token, err := jwt.CreateToken(user.Email, user.Region)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	rest.SuccessResponse(w, AuthResponse{Token: token})
}

func Register(w http.ResponseWriter, r *http.Request) {
	var request RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&request)
	if err != nil {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "Invalid request body"})
		return
	}

	validRegions := []string{"BR", "US", "EU"}
	if !util.Contains(validRegions, request.Region) {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "Invalid region"})
		return
	}

	user, err := models.GetUserByEmail(request.Email)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	if user != nil {
		rest.ErrorBadRequest(w, rest.Error{Code: 400, Message: "User already exists"})
		return
	}

	user, err = models.CreateUser(request.Name, request.Email, request.Password, request.Region)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	token, err := jwt.CreateToken(user.Email, user.Region)
	if err != nil {
		rest.ErrorInternalServerError(w, rest.Error{Code: 500, Message: err.Error()})
		return
	}

	rest.SuccessResponse(w, AuthResponse{Token: token})
}
