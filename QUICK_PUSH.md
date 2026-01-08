# Quick Push Guide

## The repository exists but needs authentication

### Method 1: Push with Personal Access Token (Easiest)

1. **Get your token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select `repo` scope
   - Copy the token

2. **Push:**
   ```bash
   cd ~/legal-case-management
   git push -u origin main
   ```
   
   When prompted:
   - **Username:** `MohammedAbdulaziz1`
   - **Password:** `[paste your token]`

### Method 2: Use URL with Token (One-time)

```bash
cd ~/legal-case-management
git remote set-url origin https://YOUR_TOKEN@github.com/MohammedAbdulaziz1/legal-case-management.git
git push -u origin main
```

Then remove token from URL:
```bash
git remote set-url origin https://github.com/MohammedAbdulaziz1/legal-case-management.git
```

### Method 3: Use GitHub CLI

```bash
# Install if needed
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

## Verify Repository

Make sure the repository exists:
- Visit: https://github.com/MohammedAbdulaziz1/legal-case-management
- If you see it, you just need authentication
- If 404, the repository doesn't exist yet
