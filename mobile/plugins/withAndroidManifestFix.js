const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo config plugin to fix Android manifest merger issues
 */
module.exports = function withAndroidManifestFix(config) {
  return withAndroidManifest(config, async config => {
    const manifest = config.modResults;
    
    // Add tools namespace
    if (manifest.manifest.$) {
      if (!manifest.manifest.$['xmlns:tools']) {
        manifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
      }
    }
    
    // Get or create uses-permission array
    if (!manifest.manifest['uses-permission']) {
      manifest.manifest['uses-permission'] = [];
    }
    
    const permissions = manifest.manifest['uses-permission'];
    const permissionNames = new Set();
    const uniquePermissions = [];
    
    // Remove duplicates and add tools:node="replace" for voice/camera permissions
    permissions.forEach(perm => {
      if (perm && perm.$) {
        const name = perm.$['android:name'];
        if (!permissionNames.has(name)) {
          permissionNames.add(name);
          
          // Add tools:node="replace" for permissions that might conflict
          if (name === 'android.permission.RECORD_AUDIO' ||
              name === 'android.permission.CAMERA' ||
              name === 'android.permission.INTERNET') {
            perm.$['tools:node'] = 'replace';
          }
          
          uniquePermissions.push(perm);
        }
      }
    });
    
    // Ensure RECORD_AUDIO permission exists for voice
    if (!permissionNames.has('android.permission.RECORD_AUDIO')) {
      uniquePermissions.push({
        $: {
          'android:name': 'android.permission.RECORD_AUDIO',
          'tools:node': 'replace'
        }
      });
    }
    
    // Update permissions
    manifest.manifest['uses-permission'] = uniquePermissions;
    
    // Fix application tag
    if (manifest.manifest.application && manifest.manifest.application[0]) {
      const app = manifest.manifest.application[0];
      if (app.$) {
        // Add tools:replace for allowBackup to avoid conflicts
        if (!app.$['tools:replace']) {
          app.$['tools:replace'] = 'android:allowBackup';
        }
      }
    }
    
    return config;
  });
};