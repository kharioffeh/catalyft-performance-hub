#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Configuration
USER_UUID="0a575abb-e3ba-4898-94a2-b16c54a13a29"
NEW_ROLE="coach"

# Check if required environment variables are set
if [ -z "$VITE_SUPABASE_URL" ]; then
    echo "❌ Error: VITE_SUPABASE_URL environment variable is required"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required"
    exit 1
fi

echo "🔍 Checking current user data..."
echo "UUID: $USER_UUID"
echo "New Role: $NEW_ROLE"
echo ""

# First, check if the user exists and get current data
echo "📋 Current user data:"
CURRENT_DATA=$(curl -s \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    "$VITE_SUPABASE_URL/rest/v1/profiles?id=eq.$USER_UUID&select=id,email,full_name,role")

echo "$CURRENT_DATA" | jq '.'

# Check if user exists
if [ "$(echo "$CURRENT_DATA" | jq '. | length')" -eq 0 ]; then
    echo "❌ Error: User with UUID $USER_UUID not found"
    exit 1
fi

echo ""
echo "🔄 Updating user role to '$NEW_ROLE'..."

# Update the user's role
UPDATE_RESPONSE=$(curl -s \
    -X PATCH \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    -d "{\"role\": \"$NEW_ROLE\"}" \
    "$VITE_SUPABASE_URL/rest/v1/profiles?id=eq.$USER_UUID")

echo "Response:"
echo "$UPDATE_RESPONSE" | jq '.'

# Check if the update was successful
if [ "$(echo "$UPDATE_RESPONSE" | jq '. | length')" -gt 0 ]; then
    echo ""
    echo "✅ User role updated successfully!"
    
    # Verify the update
    echo ""
    echo "🔍 Verifying update..."
    VERIFY_DATA=$(curl -s \
        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
        -H "Content-Type: application/json" \
        "$VITE_SUPABASE_URL/rest/v1/profiles?id=eq.$USER_UUID&select=id,email,full_name,role")
    
    echo "Updated user data:"
    echo "$VERIFY_DATA" | jq '.'
    echo ""
    echo "✅ Verification complete!"
else
    echo ""
    echo "❌ Error: Failed to update user role"
    exit 1
fi