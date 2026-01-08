# Setting Up Remote Repository

## Option 1: Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right → "New repository"
3. Repository name: `legal-case-management`
4. Description: "Legal Case Management System - React Frontend & Laravel Backend"
5. Choose **Private** or **Public**
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## Option 2: Use Existing Repository

If you already have a repository URL, skip to "Connecting to Remote" below.

## Connecting to Remote

After creating the repository, GitHub will show you commands. Use these:

```bash
cd ~/legal-case-management

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/legal-case-management.git

# Or if using SSH:
git remote add origin git@github.com:YOUR_USERNAME/legal-case-management.git

# Verify remote was added
git remote -v

# Push to remote
git push -u origin main
```

## Alternative: GitLab or Bitbucket

### GitLab:
```bash
git remote add origin https://gitlab.com/YOUR_USERNAME/legal-case-management.git
git push -u origin main
```

### Bitbucket:
```bash
git remote add origin https://bitbucket.org/YOUR_USERNAME/legal-case-management.git
git push -u origin main
```

## Troubleshooting

### If you get authentication errors:
- For HTTPS: Use a Personal Access Token instead of password
- For SSH: Make sure your SSH key is added to your GitHub account

### If branch name is different:
```bash
# Check current branch
git branch

# If on 'master', rename to 'main'
git branch -M main

# Then push
git push -u origin main
```

