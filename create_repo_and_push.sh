#!/bin/bash

echo "=== Fix 'Repository not found' Error ==="
echo ""
echo "The repository doesn't exist on GitHub yet."
echo ""
echo "You have two options:"
echo ""
echo "Option 1: Create the repository on GitHub (Recommended)"
echo "  1. Go to: https://github.com/new"
echo "  2. Repository name: legal-case-management"
echo "  3. Description: Legal Case Management System - React Frontend & Laravel Backend"
echo "  4. Choose Private or Public"
echo "  5. DO NOT check 'Add a README file'"
echo "  6. DO NOT check 'Add .gitignore'"
echo "  7. DO NOT check 'Choose a license'"
echo "  8. Click 'Create repository'"
echo ""
echo "Option 2: Use a different repository name"
echo "  If you want to use a different name, tell me and I'll update the remote URL"
echo ""
read -p "Have you created the repository? (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "Testing connection..."
    if git ls-remote origin &>/dev/null; then
        echo "✓ Repository found! Pushing..."
        git push -u origin main
    else
        echo "✗ Still can't find repository."
        echo ""
        echo "Please verify:"
        echo "1. Repository exists at: https://github.com/MohammedAbdulaziz1/legal-case-management"
        echo "2. You're logged into the correct GitHub account"
        echo "3. You have access to the repository"
        echo ""
        read -p "Enter the correct repository URL (or press Enter to keep current): " repo_url
        if [ ! -z "$repo_url" ]; then
            git remote set-url origin "$repo_url"
            echo "Remote updated to: $repo_url"
            git push -u origin main
        fi
    fi
else
    echo ""
    echo "Please create the repository first, then run this script again."
    echo "Or if you want to use a different repository, let me know the URL."
fi

