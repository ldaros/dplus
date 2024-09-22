# Use the official Node.js image as a base
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Disable the next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Copy the rest of your application code
COPY . .

# Build the application
RUN pnpm build

# Expose the port the application will run on
EXPOSE 3000

# Start the application
# CMD ["pnpm", "dev"]
CMD ["pnpm", "start"]