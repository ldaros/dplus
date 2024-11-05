package middleware

import (
	"api/lib/jwt"
	"api/lib/rest"
	"context"
	"net/http"
)

type contextKey string

const ClaimsKey contextKey = "claims"

func Auth(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tokenString := r.Header.Get("Authorization")

		if tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		if tokenString == "" {
			rest.ErrorUnauthorized(w, rest.Error{Code: 401, Message: "Unauthorized"})
			return
		}

		claims, err := jwt.ParseToken(tokenString)
		if err != nil {
			rest.ErrorUnauthorized(w, rest.Error{Code: 401, Message: "Invalid token"})
			return
		}

		// Add claims to context
		ctx := context.WithValue(r.Context(), ClaimsKey, claims)
		r = r.WithContext(ctx)

		next.ServeHTTP(w, r)
	})
}
