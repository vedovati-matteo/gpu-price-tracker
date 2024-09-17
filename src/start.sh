#!/bin/bash
   
# Start Xvfb
Xvfb :99 -ac -screen 0 1280x1024x16 &
export DISPLAY=:99

# Start VNC server
x11vnc -display :99 -forever -nopw &

# Start noVNC
/usr/share/novnc/utils/launch.sh --vnc localhost:5900 --listen 6080 &

# Start your Node.js application
node src/server.js
   