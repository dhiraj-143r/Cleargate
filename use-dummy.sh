#!/bin/bash
API_KEY="claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU"
TOKEN_RES=$(curl -s -X POST https://beta-api.buildwithlocus.com/v1/auth/exchange -H "Content-Type: application/json" -d "{\"apiKey\":\"$API_KEY\"}")
TOKEN=$(echo $TOKEN_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit 1
fi

SERVICE_ID="svc_mo5j6g12jylu0dxh"

echo "Setting USE_DUMMY to true for main API service..."
curl -s -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "variables": {
      "LOCUS_API_KEY": "claw_dev_6wAoFBYCsFPU4seJxjgp8Eh9Nx9JYcXU",
      "LOCUS_API_BASE": "https://beta-api.paywithlocus.com",
      "USE_DUMMY": "true"
    }
  }' \
  "https://beta-api.buildwithlocus.com/v1/variables/service/$SERVICE_ID" | jq .

