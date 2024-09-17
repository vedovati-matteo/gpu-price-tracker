#!/bin/bash
   
# Start Xvfb
Xvfb :99 -ac -screen 0 1280x1024x16 &
export DISPLAY=:99

# Start the VNC server
x11vnc -display :99 -forever -nopw -rfbport 5900 -shared &

# Start websockify to proxy the VNC connection for noVNC
/usr/share/novnc/utils/websockify/websockify.py --web /usr/share/novnc 6080 localhost:5900 &

# Start your Node.js application
node src/server.js
   