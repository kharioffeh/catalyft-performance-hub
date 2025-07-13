


const fs = require('fs');
const path = require('path');

const BUNDLE_LIMIT_KB = 200;

function checkBundleSize() {
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Dist folder not found. Run build first.');
    process.exit(1);
  }

  const jsFiles = fs.readdirSync(distPath)
    .filter(file => file.endsWith('.js') && !file.includes('.map'))
    .map(file => {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        size: stats.size,
        sizeKB: Math.round(stats.size / 1024)
      };
    })
    .sort((a, b) => b.size - a.size);

  console.log('📦 Bundle Size Analysis\n');
  
  let totalSize = 0;
  let hasViolations = false;

  jsFiles.forEach(file => {
    totalSize += file.size;
    const status = file.sizeKB > BUNDLE_LIMIT_KB ? '❌' : '✅';
    
    if (file.sizeKB > BUNDLE_LIMIT_KB) {
      hasViolations = true;
    }
    
    console.log(`${status} ${file.name}: ${file.sizeKB}KB`);
  });

  const totalKB = Math.round(totalSize / 1024);
  console.log(`\n📊 Total bundle size: ${totalKB}KB`);
  
  if (hasViolations) {
    console.log(`\n💡 Files exceeding ${BUNDLE_LIMIT_KB}KB limit detected!`);
    console.log('Consider code splitting or lazy loading for large chunks.');
    process.exit(1);
  } else {
    console.log(`\n🎉 All bundles are within ${BUNDLE_LIMIT_KB}KB limit!`);
  }
}

checkBundleSize();
