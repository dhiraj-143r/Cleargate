#!/bin/bash
API_KEY="claw_dev_4_PTlGks_OpalcqgKR966x4M5I8Z_Iib"
echo "Exchanging API key..."
TOKEN_RES=$(curl -s -X POST https://api.buildwithlocus.com/v1/auth/exchange -H "Content-Type: application/json" -d "{\"apiKey\":\"$API_KEY\"}")
TOKEN=$(echo $TOKEN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token: $TOKEN_RES"
  exit 1
fi
echo "Got token!"

echo "Creating project..."
PROJECT=$(curl -s -X POST https://api.buildwithlocus.com/v1/projects -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name": "cleargate-demo", "description": "ClearGate Hackathon App"}')
echo "Response: $PROJECT"
PROJECT_ID=$(echo $PROJECT | jq -r '.id')

if [ "$PROJECT_ID" == "null" ]; then
  echo "Failed to create project."
  exit 1
fi
echo "Project ID: $PROJECT_ID"
