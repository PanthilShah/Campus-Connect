# Dockerfile for CampusConnect Student REST API
# Lab 5: Docker & Containerization
# Dhirubhai Ambani University (formerly DA-IICT)

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (leverages Docker layer cache)
COPY package*.json ./
RUN npm install

# Copy all application code
COPY . .

# Expose Student REST API port
EXPOSE 3000

# Set environment defaults
ENV PORT=3000
ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
