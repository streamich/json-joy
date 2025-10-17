#!/bin/bash

# NFSv4 TCP Demo Test Script
# This script starts the server in background, runs the client, then stops the server

PORT=8585

echo "Starting NFSv4 TCP Server on port $PORT..."
PORT=$PORT npx ts-node src/nfs/v4/server/__demos__/tcp-server.ts &
SERVER_PID=$!

# Wait for server to start
sleep 2

echo ""
echo "Running NFSv4 TCP Client..."
PORT=$PORT npx ts-node src/nfs/v4/server/__demos__/tcp-client.ts

# Give time to see output
sleep 1

echo ""
echo "Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "Done!"
