#!/bin/bash
API_KEY="claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU"
echo "Exchanging API key for BuildWithLocus Beta..."
TOKEN_RES=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/auth/exchange -H "Content-Type: application/json" -d "{\"apiKey\":\"$API_KEY\"}")
TOKEN=$(echo $TOKEN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token: $TOKEN_RES"
  exit 1
fi
echo "Got token!"

echo "Deploying from GitHub repo dhiraj-143r/Cleargate..."
DEPLOY_RES=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/projects/from-repo \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cleargate-beta",
    "repo": "dhiraj-143r/Cleargate",
    "branch": "main"
  }')

echo "Response:"
echo $DEPLOY_RES | jq .

PROJECT_ID=$(echo $DEPLOY_RES | jq -r '.project.id')
if [ "$PROJECT_ID" == "null" ] || [ -z "$PROJECT_ID" ]; then
  echo "Failed to deploy project."
  exit 1
fi

echo "Deployed successfully! Project ID: $PROJECT_ID"
