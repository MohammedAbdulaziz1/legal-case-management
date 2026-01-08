#!/bin/bash

echo "=== GitHub Publishing Fix ==="
echo ""
echo "Current remote:"
git remote -v
echo ""
echo "Options:"
echo "1. Create repository on GitHub first, then run: git push -u origin main"
echo "2. Update remote URL to match your existing repository"
echo "3. Use SSH instead of HTTPS"
echo ""
echo "To update remote URL:"
echo "  git remote set-url origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo ""
echo "To use SSH:"
echo "  git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO.git"
echo ""
