#!/bin/bash

echo "=== Push to GitHub with Authentication ==="
echo ""
echo "Repository: https://github.com/MohammedAbdulaziz1/legal-case-management.git"
echo ""
echo "This script will help you push with proper authentication."
echo ""

# Check if token is provided as argument
if [ ! -z "$1" ]; then
    TOKEN="$1"
    echo "Using provided token..."
    git push -u origin main <<EOF
MohammedAbdulaziz1
$TOKEN
EOF
else
    echo "Option 1: Use Personal Access Token"
    echo "  1. Get token: https://github.com/settings/tokens"
    echo "  2. Select 'repo' scope"
    echo "  3. Copy the token"
    echo ""
    echo "Option 2: Enter token now"
    read -sp "Enter your Personal Access Token: " TOKEN
    echo ""
    
    if [ ! -z "$TOKEN" ]; then
        echo "Pushing to GitHub..."
        GIT_ASKPASS=echo git -c credential.helper='!f() { echo "username=MohammedAbdulaziz1"; echo "password=$TOKEN"; }; f' push -u origin main
    else
        echo "No token provided. Please create one at: https://github.com/settings/tokens"
        echo "Then run: git push -u origin main"
        echo "When prompted, use your token as the password."
    fi
fi

