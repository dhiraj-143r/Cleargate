#!/bin/bash
API_KEY="claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU"
TOKEN_RES=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/auth/exchange -H "Content-Type: application/json" -d "{\"apiKey\":\"$API_KEY\"}")
TOKEN=$(echo $TOKEN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

echo "API Deployment (deploy_mo5j6gcppi116vjd):"
curl -s -H "Authorization: Bearer $TOKEN" "https://beta-api.buildwithlocus.com/v1/deployments/deploy_mo5j6gcppi116vjd" | jq '{status, durationMs}'

echo "Web Deployment (deploy_mo5j6gjwnjn8aqc3):"
curl -s -H "Authorization: Bearer $TOKEN" "https://beta-api.buildwithlocus.com/v1/deployments/deploy_mo5j6gjwnjn8aqc3" | jq '{status, durationMs}'
