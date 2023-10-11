#!/bin/bash

# Start the Express backend
cd botapp/backend
npm install
npm start &

# Start the React frontend in a new terminal window
gnome-terminal -- bash -c "cd ../frontend && npm install && npm start"

