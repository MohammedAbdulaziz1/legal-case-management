#!/bin/bash

echo "=== Testing Legal Case Management API ==="
echo ""

BASE_URL="http://127.0.0.1:8000/api"
TOKEN=""

echo "1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@firm.com","password":"password"}')

echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - cannot proceed with other tests"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:20}..."
echo ""

echo "2. Testing /api/auth/me..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool 2>/dev/null | head -10
echo ""

echo "3. Testing /api/dashboard/stats..."
curl -s -X GET "$BASE_URL/dashboard/stats" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool 2>/dev/null | head -15
echo ""

echo "4. Testing /api/cases/primary..."
curl -s -X GET "$BASE_URL/cases/primary" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool 2>/dev/null | head -10
echo ""

echo "5. Testing /api/users..."
curl -s -X GET "$BASE_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json" | python3 -m json.tool 2>/dev/null | head -10
echo ""

echo "=== Test Complete ==="

