# === Build Stage ===
# Use a Node.js base image for building the application
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock, pnpm-lock.yaml)
COPY package*.json ./
# Use pnpm if pnpm-lock.yaml exists, otherwise yarn if yarn.lock exists, else npm
# Add logic here if using yarn or pnpm
# Example for npm:
RUN npm install

# Copy the rest of the application source code
COPY . .

# Copy .env for build-time variables (if any VITE_ variables are needed during build)
# Note: This makes the .env part of the build layer. Consider ARG for sensitive keys.
COPY .env ./.env

# Build the application
# Use the build script defined in package.json (e.g., "build": "vite build")
RUN npm run build

# === Production Stage ===
# Use a lightweight Nginx image for serving the static files
FROM nginx:1.25-alpine

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

# Copy the built application from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"] 