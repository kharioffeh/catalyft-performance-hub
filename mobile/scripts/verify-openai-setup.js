#!/usr/bin/env node

/**
 * Script to verify OpenAI API keys configuration
 * Run with: node scripts/verify-openai-setup.js
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.cyan}${colors.bright}🤖 ARIA OpenAI Configuration Verifier${colors.reset}`);
console.log('=====================================\n');

// Step 1: Check for .env file
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

console.log(`${colors.blue}1. Checking for .env file...${colors.reset}`);
if (!fs.existsSync(envPath)) {
  console.log(`${colors.red}   ✗ .env file not found!${colors.reset}`);
  console.log(`${colors.yellow}   Creating .env from .env.example...${colors.reset}`);
  
  if (fs.existsSync(envExamplePath)) {
    const envContent = fs.readFileSync(envExamplePath, 'utf8');
    fs.writeFileSync(envPath, envContent);
    console.log(`${colors.green}   ✓ .env file created. Please add your API keys.${colors.reset}`);
  }
  process.exit(1);
} else {
  console.log(`${colors.green}   ✓ .env file found${colors.reset}`);
}

// Step 2: Parse .env file
console.log(`\n${colors.blue}2. Checking API keys in .env...${colors.reset}`);
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check OpenAI keys
const openAIKey = envVars['OPENAI_API_KEY'];
const ariaKey = envVars['OPENAI_ARIA_KEY'];

if (!openAIKey || openAIKey === 'your_openai_api_key_here') {
  console.log(`${colors.red}   ✗ OPENAI_API_KEY not configured${colors.reset}`);
  console.log(`${colors.yellow}     Add your OpenAI API key to .env file${colors.reset}`);
} else {
  const maskedKey = openAIKey.substring(0, 7) + '...' + openAIKey.substring(openAIKey.length - 4);
  console.log(`${colors.green}   ✓ OPENAI_API_KEY found: ${maskedKey}${colors.reset}`);
  
  // Validate key format
  if (openAIKey.startsWith('sk-')) {
    console.log(`${colors.green}     ✓ Key format looks valid${colors.reset}`);
  } else {
    console.log(`${colors.yellow}     ⚠ Key doesn't start with 'sk-', might be invalid${colors.reset}`);
  }
}

if (!ariaKey || ariaKey === 'your_openai_aria_key_here') {
  console.log(`${colors.yellow}   ⚠ OPENAI_ARIA_KEY not configured (optional)${colors.reset}`);
} else {
  const maskedAriaKey = ariaKey.substring(0, 7) + '...' + ariaKey.substring(ariaKey.length - 4);
  console.log(`${colors.green}   ✓ OPENAI_ARIA_KEY found: ${maskedAriaKey}${colors.reset}`);
}

// Step 3: Check Supabase configuration
console.log(`\n${colors.blue}3. Checking Supabase configuration...${colors.reset}`);
const supabaseUrl = envVars['SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_ANON_KEY'];

if (!supabaseUrl || supabaseUrl === 'your_supabase_url_here') {
  console.log(`${colors.red}   ✗ SUPABASE_URL not configured${colors.reset}`);
} else {
  console.log(`${colors.green}   ✓ SUPABASE_URL: ${supabaseUrl.substring(0, 30)}...${colors.reset}`);
}

if (!supabaseKey || supabaseKey === 'your_supabase_anon_key_here') {
  console.log(`${colors.red}   ✗ SUPABASE_ANON_KEY not configured${colors.reset}`);
} else {
  const maskedSupaKey = supabaseKey.substring(0, 10) + '...' + supabaseKey.substring(supabaseKey.length - 4);
  console.log(`${colors.green}   ✓ SUPABASE_ANON_KEY: ${maskedSupaKey}${colors.reset}`);
}

// Step 4: Test OpenAI connection (optional)
if (openAIKey && openAIKey !== 'your_openai_api_key_here') {
  console.log(`\n${colors.blue}4. Testing OpenAI API connection...${colors.reset}`);
  
  // Dynamic import for OpenAI
  import('openai').then(({ default: OpenAI }) => {
    const openai = new OpenAI({
      apiKey: openAIKey,
    });
    
    console.log(`${colors.yellow}   Sending test request to OpenAI...${colors.reset}`);
    
    openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Say "ARIA is ready!" in 5 words or less.' }],
      max_tokens: 20,
    })
    .then(response => {
      console.log(`${colors.green}   ✓ OpenAI API connection successful!${colors.reset}`);
      console.log(`${colors.cyan}   Response: ${response.choices[0].message.content}${colors.reset}`);
      
      // Check available models
      return openai.models.list();
    })
    .then(models => {
      const gpt4Available = models.data.some(model => model.id.includes('gpt-4'));
      if (gpt4Available) {
        console.log(`${colors.green}   ✓ GPT-4 access confirmed${colors.reset}`);
      } else {
        console.log(`${colors.yellow}   ⚠ GPT-4 not available on this API key${colors.reset}`);
      }
      
      printSummary();
    })
    .catch(error => {
      console.log(`${colors.red}   ✗ OpenAI API error: ${error.message}${colors.reset}`);
      if (error.message.includes('401')) {
        console.log(`${colors.red}     Invalid API key${colors.reset}`);
      } else if (error.message.includes('429')) {
        console.log(`${colors.yellow}     Rate limit exceeded or quota issue${colors.reset}`);
      }
      printSummary();
    });
  }).catch(error => {
    console.log(`${colors.yellow}   ⚠ OpenAI package not installed. Run: npm install openai${colors.reset}`);
    printSummary();
  });
} else {
  printSummary();
}

function printSummary() {
  console.log(`\n${colors.magenta}${colors.bright}Summary:${colors.reset}`);
  console.log('========');
  
  const checks = [
    { name: '.env file', status: fs.existsSync(envPath) },
    { name: 'OPENAI_API_KEY', status: openAIKey && openAIKey !== 'your_openai_api_key_here' },
    { name: 'SUPABASE_URL', status: supabaseUrl && supabaseUrl !== 'your_supabase_url_here' },
    { name: 'SUPABASE_ANON_KEY', status: supabaseKey && supabaseKey !== 'your_supabase_anon_key_here' },
  ];
  
  const passed = checks.filter(c => c.status).length;
  const total = checks.length;
  
  checks.forEach(check => {
    const icon = check.status ? '✓' : '✗';
    const color = check.status ? colors.green : colors.red;
    console.log(`${color} ${icon} ${check.name}${colors.reset}`);
  });
  
  console.log(`\n${colors.bright}Result: ${passed}/${total} checks passed${colors.reset}`);
  
  if (passed === total) {
    console.log(`${colors.green}${colors.bright}✅ ARIA is ready to use!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}${colors.bright}⚠️  Please configure missing items in .env file${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
  console.log('1. Run: npm run ios or npm run android');
  console.log('2. Navigate to ARIA chat screen');
  console.log('3. Test with: "Hello ARIA, are you working?"');
}