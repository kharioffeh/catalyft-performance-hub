
#!/usr/bin/env node

/**
 * Contrast Validation Script
 * Validates WCAG AA contrast ratios in the codebase
 */

const contrast = require('wcag-contrast');

// WCAG AA contrast ratio requirements
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

// Color combinations to validate (from our new dual-tone system)
const colorPairs = [
  // Primary theme combinations
  { bg: '#1E40AF', fg: '#FFFFFF', context: 'Primary button text (light)' },
  { bg: '#3B82F6', fg: '#FFFFFF', context: 'Primary button text (dark)' },
  { bg: '#EFF6FF', fg: '#1E40AF', context: 'Primary light surface' },
  
  // Secondary theme combinations
  { bg: '#1E3A8A', fg: '#FFFFFF', context: 'Secondary button text (light)' },
  { bg: '#60A5FA', fg: '#000000', context: 'Secondary button text (dark)' },
  { bg: '#DBEAFE', fg: '#1E40AF', context: 'Secondary light surface' },
  
  // Semantic color combinations
  { bg: '#059669', fg: '#FFFFFF', context: 'Success state' },
  { bg: '#10B981', fg: '#FFFFFF', context: 'Success state (dark)' },
  { bg: '#DC2626', fg: '#FFFFFF', context: 'Danger state' },
  { bg: '#EF4444', fg: '#FFFFFF', context: 'Danger state (dark)' },
  { bg: '#D97706', fg: '#FFFFFF', context: 'Warning state' },
  { bg: '#F59E0B', fg: '#000000', context: 'Warning state (dark)' },
  { bg: '#0284C7', fg: '#FFFFFF', context: 'Info state' },
  { bg: '#0EA5E9', fg: '#FFFFFF', context: 'Info state (dark)' },
  
  // Surface combinations
  { bg: '#FFFFFF', fg: '#1F2937', context: 'Light surface text' },
  { bg: '#1F2937', fg: '#FFFFFF', context: 'Dark surface text' },
];

// Validate contrast pairs
function validateContrast() {
  console.log('🎨 Validating WCAG AA Contrast Ratios...\n');
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  colorPairs.forEach(pair => {
    try {
      const ratio = contrast.hex(pair.bg, pair.fg);
      const meetsAA = ratio >= WCAG_AA_NORMAL;
      const meetsLarge = ratio >= WCAG_AA_LARGE;
      
      if (meetsAA) {
        console.log(`✅ ${pair.context}: ${ratio.toFixed(2)}:1 (WCAG AA)`);
        passed++;
      } else if (meetsLarge) {
        console.log(`⚠️  ${pair.context}: ${ratio.toFixed(2)}:1 (Large text only)`);
        warnings++;
      } else {
        console.log(`❌ ${pair.context}: ${ratio.toFixed(2)}:1 (FAILS WCAG AA)`);
        failed++;
      }
    } catch (error) {
      console.log(`⚠️  Error validating ${pair.context}: ${error.message}`);
      warnings++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${warnings} warnings, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n💡 Consider adjusting colors that don\'t meet WCAG AA standards');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  Some combinations only work for large text');
  } else {
    console.log('\n🎉 All color combinations meet WCAG AA standards!');
  }
}

// Run validation
validateContrast();
