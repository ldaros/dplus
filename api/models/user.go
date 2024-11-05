package models

import (
	"database/sql"
	"errors"
	"time"

	"api/lib/db"
)

type User struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Password  string    `json:"password"`
	Region    string    `json:"region"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func CreateUser(name, email, password, region string) (*User, error) {
	db := db.GetDBInstance()
	user := &User{
		Name:      name,
		Email:     email,
		Password:  password,
		Region:    region,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err := db.GetConnection().Exec(`
		INSERT INTO users (name, email, password, region)
		VALUES ($1, $2, $3, $4)`,
		user.Name, user.Email, user.Password, user.Region)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func GetUserByEmail(email string) (*User, error) {
	db := db.GetDBInstance()
	user := &User{}

	err := db.GetConnection().QueryRow(`
		SELECT id, name, email, password, region, created_at, updated_at
		FROM users
		WHERE email = $1`, email).Scan(&user.ID, &user.Name, &user.Email, &user.Password, &user.Region, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil // No user found
		}
		return nil, err // Unexpected error
	}

	return user, nil
}
