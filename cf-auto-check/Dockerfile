FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application files
COPY . .

# Expose port (optional, for health check)
EXPOSE 3000

# Run the application
CMD ["node", "src/index.js"]
