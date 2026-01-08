# Useful Git Commands

## Daily Workflow

### Check Status
\`\`\`bash
git status
\`\`\`

### View Changes
\`\`\`bash
git diff                    # Unstaged changes
git diff --staged           # Staged changes
git log --oneline -10       # Recent commits
\`\`\`

### Making Changes
\`\`\`bash
git add .                   # Stage all changes
git add <file>              # Stage specific file
git commit -m "Message"      # Commit changes
git push                     # Push to remote
\`\`\`

### Branching
\`\`\`bash
git branch                   # List branches
git branch <name>            # Create new branch
git checkout <name>          # Switch branch
git checkout -b <name>       # Create and switch
git merge <branch>           # Merge branch
\`\`\`

### Undo Changes
\`\`\`bash
git restore <file>           # Discard file changes
git restore --staged <file> # Unstage file
git reset HEAD~1             # Undo last commit (keep changes)
git reset --hard HEAD~1      # Undo last commit (discard changes)
\`\`\`

### Remote Operations
\`\`\`bash
git remote -v                # List remotes
git fetch                    # Fetch updates
git pull                      # Pull and merge
git push                      # Push changes
\`\`\`

## Project-Specific

### Frontend Only
\`\`\`bash
cd frontend
git add .
git commit -m "Update frontend"
\`\`\`

### Backend Only
\`\`\`bash
cd backend
git add .
git commit -m "Update backend"
\`\`\`

### Both Projects
\`\`\`bash
cd ~/legal-case-management
git add .
git commit -m "Update both projects"
git push
\`\`\`
