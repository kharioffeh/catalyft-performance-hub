const fs = require('fs');
require('dotenv').config();

console.log('\n🔍 Configuration Check:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Group checks by category
const categories = {
  '🔥 Firebase': [
    { name: 'API Key', key: 'FIREBASE_API_KEY' },
    { name: 'Project ID', key: 'FIREBASE_PROJECT_ID' },
    { name: 'Auth Domain', key: 'FIREBASE_AUTH_DOMAIN' },
    { name: 'Storage Bucket', key: 'FIREBASE_STORAGE_BUCKET' },
    { name: 'Messaging Sender ID', key: 'FIREBASE_MESSAGING_SENDER_ID' },
    { name: 'App ID', key: 'FIREBASE_APP_ID' },
    { name: 'Measurement ID', key: 'FIREBASE_MEASUREMENT_ID' },
  ],
  '🗄️ Supabase': [
    { name: 'URL', key: 'EXPO_PUBLIC_SUPABASE_URL' },
    { name: 'Anon Key', key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY' },
    { name: 'Service Role Key', key: 'SUPABASE_SERVICE_ROLE_KEY', sensitive: true },
  ],
  '💳 Stripe': [
    { name: 'Publishable Key', key: 'STRIPE_PUBLISHABLE_KEY' },
    { name: 'Secret Key', key: 'STRIPE_SECRET_KEY', sensitive: true },
  ],
  '📊 Analytics': [
    { name: 'Segment Write Key', key: 'SEGMENT_WRITE_KEY' },
    { name: 'Mixpanel Token', key: 'MIXPANEL_TOKEN' },
    { name: 'Amplitude API Key', key: 'AMPLITUDE_API_KEY' },
    { name: 'Sentry DSN', key: 'SENTRY_DSN' },
  ],
  '⚙️ Environment': [
    { name: 'Node Environment', key: 'NODE_ENV' },
    { name: 'App Environment', key: 'APP_ENV' },
    { name: 'API Base URL', key: 'API_BASE_URL' },
  ],
  '📱 App Store': [
    { name: 'iOS App Store ID', key: 'IOS_APP_STORE_ID' },
    { name: 'Android Play Store ID', key: 'ANDROID_PLAY_STORE_ID' },
  ],
};

let totalConfigured = 0;
let totalMissing = 0;

Object.entries(categories).forEach(([category, checks]) => {
  console.log(`${category}:`);
  checks.forEach(check => {
    const value = process.env[check.key];
    const status = value ? '✅' : '❌';
    
    let display;
    if (!value) {
      display = 'NOT SET';
      totalMissing++;
    } else if (check.sensitive) {
      // Hide sensitive keys
      display = `${value.substring(0, 10)}...***hidden***`;
      totalConfigured++;
    } else if (value.startsWith('sk_') || value.includes('SECRET')) {
      // Extra safety for any secret-like values
      display = `${value.substring(0, 7)}...***hidden***`;
      totalConfigured++;
    } else {
      // Show partial value for non-sensitive keys
      display = value.length > 40 
        ? `${value.substring(0, 40)}...` 
        : value;
      totalConfigured++;
    }
    
    console.log(`  ${status} ${check.name}: ${display}`);
  });
  console.log('');
});

// Check for Firebase platform files
console.log('📱 Platform Configuration Files:');
const iosFile = fs.existsSync('./ios/GoogleService-Info.plist');
const androidFile = fs.existsSync('./android/app/google-services.json');
console.log(`  ${iosFile ? '✅' : '❌'} iOS: GoogleService-Info.plist`);
console.log(`  ${androidFile ? '✅' : '❌'} Android: google-services.json`);

// Check .env security
console.log('\n🔒 Security Check:');
const gitIgnoreExists = fs.existsSync('./.gitignore');
const envInGitIgnore = gitIgnoreExists && 
  fs.readFileSync('./.gitignore', 'utf8').includes('.env');
console.log(`  ${envInGitIgnore ? '✅' : '⚠️'} .env is in .gitignore`);

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 Summary:');
console.log(`  ✅ Configured: ${totalConfigured} values`);
console.log(`  ❌ Missing: ${totalMissing} values`);

const percentComplete = Math.round((totalConfigured / (totalConfigured + totalMissing)) * 100);
const progressBar = '█'.repeat(Math.floor(percentComplete / 5)) + '░'.repeat(20 - Math.floor(percentComplete / 5));
console.log(`  📈 Progress: [${progressBar}] ${percentComplete}%`);

if (totalMissing === 0) {
  console.log('\n🎉 Perfect! All configuration values are set!');
  console.log('🚀 Ready to run: npm start\n');
} else if (totalMissing <= 5) {
  console.log('\n✨ Almost there! Just a few optional values missing.');
  console.log('🚀 You can run: npm start\n');
} else {
  console.log('\n⚠️ Some required configuration values are missing.');
  console.log('📝 Please check the missing values above.\n');
}

// Check for critical services
const criticalServices = {
  Firebase: process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID,
  Supabase: process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  Stripe: process.env.STRIPE_PUBLISHABLE_KEY,
};

console.log('🔑 Critical Services Status:');
Object.entries(criticalServices).forEach(([service, isConfigured]) => {
  console.log(`  ${isConfigured ? '✅' : '⚠️'} ${service}: ${isConfigured ? 'Ready' : 'Not configured'}`);
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
