#!/bin/bash

# Exit on error
set -e

# Build frontend
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
npm install

# Start backend and open browser
node server.js &
SERVER_PID=$!

# Wait a moment for the server to start
sleep 2

# Open browser (if not already handled by server.js)
# open http://localhost:3001

# Wait for server to exit
wait $SERVER_PID 