# Stage 1: Build the application
FROM node:18-bullseye-slim AS builder

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps
RUN npm install @css-inline/css-inline-linux-x64-gnu
RUN npm install --os=linux --cpu=x64 sharp
# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the production image
FROM node:18-bullseye-slim

# Set the working directory
WORKDIR /app

# Copy the build output and node_modules from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Expose the application port
EXPOSE 8080

# Define the command to run the application
CMD ["node", "dist/main"]
