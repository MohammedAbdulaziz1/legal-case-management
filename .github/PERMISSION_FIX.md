# Fix Permission Problem When Publishing

## Issue
Getting "Permission denied" or "Repository not found" when trying to push.

## Solution: Use Personal Access Token

GitHub no longer accepts passwords for HTTPS. You need a Personal Access Token.

### Step 1: Create Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Legal Case Management`
4. Select expiration: Choose your preference (90 days, 1 year, or no expiration)
5. **Select scopes:**
   - ✅ **repo** (Full control of private repositories)
     - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events
6. Click **"Generate token"**
7. **⚠️ IMPORTANT: Copy the token immediately!** You won't see it again.

### Step 2: Use Token to Push

When you run `git push`, it will ask for credentials:

```bash
cd ~/legal-case-management
git push -u origin main
```

**When prompted:**
- **Username:** `MohammedAbdulaziz1`
- **Password:** `[paste your Personal Access Token here]` ← NOT your GitHub password!

### Step 3: Save Credentials (Optional)

To avoid entering the token every time:

**macOS:**
```bash
git config --global credential.helper osxkeychain
```

Then on first push, enter your token. It will be saved in Keychain.

**Linux:**
```bash
git config --global credential.helper store
```

### Alternative: Use GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Then push normally
git push -u origin main
```

## Verify Repository Access

Make sure:
1. Repository exists: https://github.com/MohammedAbdulaziz1/legal-case-management
2. You're logged into the correct GitHub account
3. You have write access to the repository

## Troubleshooting

### "Repository not found"
- Check the repository URL is correct
- Verify you have access to the repository
- Make sure you're using the correct GitHub username

### "Permission denied"
- Make sure you're using a Personal Access Token, not password
- Verify the token has `repo` scope
- Check the token hasn't expired

### "Authentication failed"
- Regenerate the token
- Make sure you copied the entire token
- Try using GitHub CLI instead

