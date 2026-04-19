#!/bin/bash
API_KEY="claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU"
TOKEN_RES=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/auth/exchange -H "Content-Type: application/json" -d "{\"apiKey\":\"$API_KEY\"}")
TOKEN=$(echo $TOKEN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

PROJECT_ID="proj_mo5m30edvfrx5hex"
echo "Project Info:"
curl -s -H "Authorization: Bearer $TOKEN" "https://beta-api.buildwithlocus.com/v1/projects/$PROJECT_ID/deployments" | jq .

