# Use an official Golang image as the base image
FROM golang:1.23.1-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the Go source code to the container
COPY . .

# Build the Go application
RUN go build -o /stream-api

# Create a final lightweight image to run the app
FROM alpine:latest

# Install FFmpeg and Node.js in the final image
RUN apk add --no-cache \
    ffmpeg \
    nodejs \
    npm

# Install Peerflix globally in the final image
RUN npm install -g peerflix

# Copy the built application from the build stage
COPY --from=build /stream-api /stream-api

# Copy the public directory to the container
COPY public /app/public

# Create a directory for HLS output
RUN mkdir -p /app/hls

# Expose the port the app will run on
EXPOSE 8080

# Set the entry point for the container
ENTRYPOINT ["/stream-api"]