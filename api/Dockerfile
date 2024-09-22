# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of your application code
COPY . .

# Expose the application port
EXPOSE 3001 3002

# Command to run the application
CMD ["node", "server.js"]