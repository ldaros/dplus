# Start with a base Go image
FROM golang:1.23.1-alpine

# Set the current working directory inside the container
WORKDIR /app

# Copy the go.mod and go.sum files first (for dependency caching)
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code into the container
COPY . .

# Build the Go app
RUN go build -o api

# Expose port 3000
EXPOSE 3000

# Command to run the app
CMD ["./api"]