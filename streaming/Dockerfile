# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Create a directory for media files
RUN mkdir -p /usr/src/app/media

# Expose the application port
EXPOSE 1935 8003

# Command to run the application
CMD ["node", "server.js"]