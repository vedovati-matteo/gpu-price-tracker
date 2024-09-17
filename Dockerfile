FROM node:18

# Install necessary packages for Puppeteer
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libgl1-mesa-glx \
    libgles2-mesa \
    libegl1-mesa \
    libxrandr2 \
    libxss1 \
    libpci3 \
    libasound2 \
    libxtst6 \
    libnss3 \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    x11vnc \
    xvfb \
    novnc \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the start script
COPY src/start.sh /start.sh
RUN chmod +x /start.sh

# Expose the port the app runs on
EXPOSE 3000 5900 6080

# Start the app using the start script
CMD ["/start.sh"]