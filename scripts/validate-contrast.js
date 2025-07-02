
#!/usr/bin/env node

/**
 * Contrast Validation Script
 * Validates WCAG AA contrast ratios in the codebase
 */

const fs = require('fs');
const path = require('path');

// WCAG AA contrast ratio requirements
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3.0;

// Color combinations to validate
const colorPairs = [
  // Primary theme combinations
  { bg: '#1E40AF', fg: '#FFFFFF', context: 'Primary button text' },
  { bg: '#3B82F6', fg: '#FFFFFF', context: 'Primary button text (dark)' },
  { bg: '#EFF6FF', fg: '#1E40AF', context: 'Primary light surface' },
  
  // Glass morphism combinations
  { bg: 'rgba(255, 255, 255, 0.8)', fg: '#1F2937', context: 'Glass card text (light)' },
  { bg: 'rgba(30, 41, 59, 0.8)', fg: '#FFFFFF', context: 'Glass card text (dark)' },
  
  // Semantic color combinations
  { bg: '#059669', fg: '#FFFFFF', context: 'Success state' },
  { bg: '#DC2626', fg: '#FFFFFF', context: 'Danger state' },
  { bg: '#D97706', fg: '#FFFFFF', context: 'Warning state' },
  { bg: '#0284C7', fg: '#FFFFFF', context: 'Info state' },
];

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio
function contrastRatio(color1, color2) {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const l1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Validate contrast pairs
function validateContrast() {
  console.log('🎨 Validating WCAG AA Contrast Ratios...\n');
  
  let passed = 0;
  let failed = 0;
  
  colorPairs.forEach(pair => {
    // Skip rgba colors for now (would need more complex parsing)
    if (pair.bg.includes('rgba') || pair.fg.includes('rgba')) {
      console.log(`⚠️  Skipping ${pair.context} (rgba colors need manual validation)`);
      return;
    }
    
    const ratio = contrastRatio(pair.bg, pair.fg);
    const meetsAA = ratio >= WCAG_AA_NORMAL;
    const meetsLarge = ratio >= WCAG_AA_LARGE;
    
    if (meetsAA) {
      console.log(`✅ ${pair.context}: ${ratio.toFixed(2)}:1 (WCAG AA)`);
      passed++;
    } else if (meetsLarge) {
      console.log(`⚠️  ${pair.context}: ${ratio.toFixed(2)}:1 (Large text only)`);
      failed++;
    } else {
      console.log(`❌ ${pair.context}: ${ratio.toFixed(2)}:1 (FAILS WCAG AA)`);
      failed++;
    }
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} need attention`);
  
  if (failed > 0) {
    console.log('\n💡 Consider adjusting colors that don\'t meet WCAG AA standards');
    process.exit(1);
  } else {
    console.log('\n🎉 All validated color combinations meet WCAG AA standards!');
  }
}

// Run validation
validateContrast();
