# Use an official Node.js image as base
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./ 

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Build the Next.js app
RUN npm run build

# Use a minimal Node.js image for production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Copy the built Next.js app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
