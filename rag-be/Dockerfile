# Use official Node.js 22 base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source files
COPY . .

# Expose the port your Express app uses
EXPOSE 3001

# Run the server
CMD ["npm", "run", "dev"]
