package jwt

import (
	"errors"
	"fmt"
	"time"

	"github.com/dgrijalva/jwt-go"
)

type Claims struct {
	Email  string `json:"email"`
	Region string `json:"region"`
}

var jwtSecret = []byte("secret")

func CreateToken(email, region string) (string, error) {
	claims := jwt.MapClaims{
		"email":  email,
		"region": region,
		"exp":    time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseToken(tokenString string) (*Claims, error) {
	claims := jwt.MapClaims{}

	_, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return nil, err
	}

	email, ok1 := claims["email"].(string)
	region, ok2 := claims["region"].(string)

	if !ok1 || !ok2 {
		return nil, errors.New("token is invalid")
	}

	return &Claims{Email: email, Region: region}, nil
}

func CreateStreamToken() (string, error) {
	claims := jwt.MapClaims{
		"exp": time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func ParseStreamToken(tokenString string) (*jwt.Token, error) {
	claims := jwt.MapClaims{}

	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		fmt.Println("Error parsing token:", err)
		return nil, err
	}

	return token, nil
}
