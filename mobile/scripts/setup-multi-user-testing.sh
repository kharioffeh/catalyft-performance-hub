#!/bin/bash

# Multi-User Testing Setup Script
# Sets up the app for multi-user testing

set -e

echo "👥 Setting up Multi-User Testing..."

# Create test user accounts
echo "👤 Creating test user accounts..."
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function createTestUsers() {
  const testUsers = [
    { email: 'test1@catalyft.com', password: 'Test123!', name: 'Test User 1' },
    { email: 'test2@catalyft.com', password: 'Test123!', name: 'Test User 2' },
    { email: 'test3@catalyft.com', password: 'Test123!', name: 'Test User 3' },
    { email: 'test4@catalyft.com', password: 'Test123!', name: 'Test User 4' },
    { email: 'test5@catalyft.com', password: 'Test123!', name: 'Test User 5' }
  ];

  for (const user of testUsers) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name
          }
        }
      });
      
      if (error) {
        console.log(\`Error creating \${user.email}: \${error.message}\`);
      } else {
        console.log(\`Created test user: \${user.email}\`);
      }
    } catch (err) {
      console.log(\`Error creating \${user.email}: \${err.message}\`);
    }
  }
}

createTestUsers();
"

echo "✅ Multi-user testing setup completed!"
echo "📧 Test accounts created:"
echo "   - test1@catalyft.com"
echo "   - test2@catalyft.com"
echo "   - test3@catalyft.com"
echo "   - test4@catalyft.com"
echo "   - test5@catalyft.com"
echo "🔑 Password for all accounts: Test123!"