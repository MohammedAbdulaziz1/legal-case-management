#!/bin/bash

echo "=== GitHub SSH Key Setup ==="
echo ""
echo "Your SSH public key:"
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
echo ""
echo "=== Instructions ==="
echo "1. Copy the SSH key above (entire line starting with ssh-ed25519)"
echo "2. Open: https://github.com/settings/keys"
echo "3. Click 'New SSH key'"
echo "4. Title: Legal Case Management (or any name)"
echo "5. Key type: Authentication Key"
echo "6. Paste the key in the 'Key' field"
echo "7. Click 'Add SSH key'"
echo ""
echo "After adding the key, press Enter to test connection..."
read

echo ""
echo "Testing SSH connection to GitHub..."
ssh -T git@github.com 2>&1 | head -3

echo ""
echo "If you see 'Hi MohammedAbdulaziz1!', the connection works!"
echo "Then you can push with: git push -u origin main"

