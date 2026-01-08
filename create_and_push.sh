#!/bin/bash

echo "=== GitHub Repository Setup ==="
echo ""
echo "Current remote:"
git remote -v
echo ""

# Check if repository exists
REPO_URL="https://github.com/MohammedAbdulaziz1/legal-case-management.git"
echo "Attempting to check repository..."
if git ls-remote "$REPO_URL" &>/dev/null; then
    echo "✓ Repository exists!"
    echo ""
    echo "Pushing to GitHub..."
    git push -u origin main
else
    echo "✗ Repository does not exist on GitHub"
    echo ""
    echo "Please create it first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: legal-case-management"
    echo "3. Description: Legal Case Management System - React Frontend & Laravel Backend"
    echo "4. Choose Private or Public"
    echo "5. DO NOT initialize with README, .gitignore, or license"
    echo "6. Click 'Create repository'"
    echo ""
    echo "After creating, run this script again or run:"
    echo "  git push -u origin main"
    echo ""
    read -p "Have you created the repository? (y/n): " answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        echo ""
        echo "Pushing to GitHub..."
        git push -u origin main
    else
        echo "Please create the repository first, then run this script again."
    fi
fi

