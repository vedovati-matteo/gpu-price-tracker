# Base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

RUN npm install recharts

# Copy the rest of the application code
COPY . .

# Expose port 3001 for the frontend
EXPOSE 3001

# Start the frontend (Next.js dev mode)
CMD ["npm", "run", "dev"]
