FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port 5173
EXPOSE 5173

# Start the Vite development server, exposed to external network
CMD ["npm", "run", "dev", "--", "--host"]
