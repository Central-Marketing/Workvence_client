FROM node:18-slim

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Build production bundle
RUN npm run build

# Expose port
EXPOSE 5173

# Serve production build on 0.0.0.0:5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
