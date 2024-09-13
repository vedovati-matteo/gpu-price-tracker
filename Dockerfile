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
    xvfb x11vnc x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable x11-apps \
    dbus \
    dbus-x11 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (optional, depending on your app)
EXPOSE 3000
EXPOSE 9222

# Start the app
CMD Xvfb :99 -ac -screen 0 1280x1024x16 & \
    export DISPLAY=:99 && \
    dbus-daemon --session --fork && \
    x11vnc -forever -nopw -display :99 & \
    node src/server.js