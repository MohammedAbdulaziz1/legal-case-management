# GitHub Authentication Fix

## Issue
Getting "Repository not found" error when trying to push.

## Possible Causes
1. **Authentication Required** - GitHub requires authentication for private repos or HTTPS
2. **Wrong Repository URL** - Repository name or username might be incorrect
3. **No Access** - You might not have push access to the repository

## Solutions

### Solution 1: Use Personal Access Token (HTTPS)

1. Go to GitHub: https://github.com/settings/tokens
2. Click "Generate new token" > "Generate new token (classic)"
3. Give it a name: "Legal Case Management"
4. Select scope: `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

7. When pushing, use the token as password:
```bash
cd ~/legal-case-management
git push -u origin main
# Username: MohammedAbdulaziz1
# Password: [paste your token here]
```

### Solution 2: Use SSH (Recommended)

1. Check if you have SSH keys:
```bash
ls -la ~/.ssh/id_*.pub
```

2. If no keys, generate one:
```bash
ssh-keygen -t ed25519 -C "1.samataxi@gmail.com"
# Press Enter to accept default location
# Optionally set a passphrase
```

3. Copy your public key:
```bash
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

4. Add to GitHub:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your public key
   - Click "Add SSH key"

5. Update remote to use SSH:
```bash
cd ~/legal-case-management
git remote set-url origin git@github.com:MohammedAbdulaziz1/legal-case-management.git
git push -u origin main
```

### Solution 3: Verify Repository URL

Make sure the repository exists and you have access:
- Check: https://github.com/MohammedAbdulaziz1/legal-case-management
- Verify the exact repository name
- Make sure you're logged into the correct GitHub account

### Solution 4: Use GitHub CLI

Install and authenticate:
```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Then push
git push -u origin main
```

