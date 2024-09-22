# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Run the application
CMD ["pnpm", "dev", "--host"]