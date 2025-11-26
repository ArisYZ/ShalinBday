#!/bin/bash
echo "Starting Shalin's Birthday To-Do List..."
echo ""
if command -v xdg-open &> /dev/null; then
    xdg-open index.html
elif command -v open &> /dev/null; then
    open index.html
else
    echo "Please open index.html in your web browser"
fi
echo "Application opened in your default browser!"

