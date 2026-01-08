#!/bin/bash

echo "=== Push to GitHub with Personal Access Token ==="
echo ""
echo "If you haven't created a token yet:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Generate new token (classic)"
echo "3. Select 'repo' scope"
echo "4. Copy the token"
echo ""
echo "Ready to push? (y/n)"
read answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "Pushing to GitHub..."
    echo "When prompted for password, use your Personal Access Token"
    echo ""
    git push -u origin main
else
    echo "Create your token first, then run this script again."
fi
