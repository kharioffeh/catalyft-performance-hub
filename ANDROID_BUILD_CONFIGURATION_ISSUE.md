# Fix Android Build Configuration and Gradle Compatibility

## Issue Summary
The Android build configuration needs to be updated to resolve compatibility issues with react-native-mmkv 3.3.0, Gradle 8.13, and React Native 0.74.5. This is infrastructure work focused on build system stability and compatibility.

## Current Configuration Analysis

### Current Versions
- **React Native**: 0.74.5
- **react-native-mmkv**: 3.3.0
- **Gradle**: 8.13
- **Android Gradle Plugin**: Not explicitly specified (inherited from React Native)
- **Java**: Not specified in current configuration

### Identified Issues

1. **Gradle Compatibility**
   - Gradle 8.13 may have compatibility issues with current React Native 0.74.5 setup
   - Missing explicit Android Gradle Plugin version specification
   - Potential Java version conflicts

2. **react-native-mmkv Integration**
   - Version 3.3.0 may require specific Gradle configuration
   - Potential native library linking issues
   - Missing or incorrect packaging options for MMKV

3. **Build Configuration Problems**
   - Inconsistent gradle.properties between root and mobile directories
   - Missing explicit dependency versions
   - Potential new architecture compatibility issues

## Required Tasks

### 1. Update Gradle Configuration
- [ ] **Update Gradle Wrapper**: Ensure compatibility with React Native 0.74.5
  - Current: Gradle 8.13
  - Recommended: Gradle 8.10 or 8.11 for better RN 0.74.5 compatibility
- [ ] **Specify Android Gradle Plugin Version**: Add explicit version in root build.gradle
  - Recommended: 8.7.0 or compatible version
- [ ] **Update Java Version**: Ensure Java 17 compatibility
  - Add explicit Java version configuration

### 2. Fix react-native-mmkv Integration
- [ ] **Update MMKV Configuration**: Ensure proper native linking
  - Check for missing native dependencies
  - Verify packaging options for MMKV libraries
- [ ] **Update Gradle Properties**: Add MMKV-specific configurations
  - Add necessary packaging options
  - Configure proper library linking

### 3. Resolve Java Compilation Issues
- [ ] **Java Version Alignment**: Ensure consistent Java version across build
  - Set explicit Java 17 in gradle.properties
  - Update build.gradle to specify Java compatibility
- [ ] **Dependency Resolution**: Fix any Java compilation errors
  - Update conflicting dependencies
  - Resolve version conflicts

### 4. Standardize Build Configuration
- [ ] **Unify gradle.properties**: Ensure consistency between root and mobile directories
- [ ] **Update Build Scripts**: Fix any existing build scripts for new configuration
- [ ] **Test Build Process**: Verify Android build works end-to-end

## Implementation Plan

### Phase 1: Gradle and Java Configuration
```gradle
// android/build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "25.1.8937393"
        kotlinVersion = "1.9.10"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.7.0")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

### Phase 2: Gradle Properties Updates
```properties
# android/gradle.properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
android.useAndroidX=true
android.enableJetifier=true

# Java version
org.gradle.java.home=/path/to/java17

# React Native
reactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
newArchEnabled=true
hermesEnabled=true

# MMKV specific
android.packagingOptions.pickFirsts=**/libc++_shared.so,**/libjsc.so,**/libfb.so
```

### Phase 3: MMKV Configuration
```gradle
// android/app/build.gradle
android {
    packagingOptions {
        pickFirst '**/libc++_shared.so'
        pickFirst '**/libjsc.so'
        pickFirst '**/libfb.so'
        pickFirst 'META-INF/LICENSE'
        pickFirst 'META-INF/LICENSE.md'
        pickFirst 'META-INF/LICENSE.txt'
        pickFirst 'META-INF/NOTICE'
        pickFirst 'META-INF/NOTICE.md'
        pickFirst 'META-INF/NOTICE.txt'
        pickFirst 'META-INF/DEPENDENCIES'
        pickFirst 'META-INF/DEPENDENCIES.txt'
        exclude 'META-INF/LGPL2.1'
        exclude 'META-INF/AL2.0'
    }
}
```

## Testing Requirements

### Build Verification
- [ ] Clean build succeeds: `./gradlew clean build`
- [ ] Debug build works: `expo run:android`
- [ ] Release build works: `expo build:android`
- [ ] MMKV functionality works in app

### Compatibility Testing
- [ ] Test on different Android versions (API 21+)
- [ ] Verify new architecture compatibility
- [ ] Test Hermes engine integration
- [ ] Validate all native dependencies

## Files to Modify

### Root Level
- `android/build.gradle` - Update buildscript and dependencies
- `android/gradle.properties` - Standardize properties
- `android/gradle/wrapper/gradle-wrapper.properties` - Update Gradle version

### App Level
- `android/app/build.gradle` - Add packaging options and Java configuration
- `mobile/android/app/build.gradle` - Ensure consistency (if exists)

### Scripts
- `mobile/scripts/fix-android-build.js` - Update for new configuration
- Any existing build scripts in `mobile/scripts/`

## Success Criteria

1. **Build Success**: Android build completes without errors
2. **MMKV Integration**: react-native-mmkv works correctly in the app
3. **Java Compatibility**: No Java compilation errors
4. **Gradle Stability**: Consistent build times and no daemon issues
5. **CI/CD Compatibility**: Build works in CI environment

## Priority
**High** - This is infrastructure work that blocks development and deployment.

## Estimated Effort
2-4 hours for configuration updates and testing.

## Dependencies
- Access to Android development environment
- Ability to test on Android devices/emulators
- CI/CD environment for validation

## Agent Implementation Prompts

### Phase 1: Gradle and Java Configuration
**Agent Prompt:**
```
Implement Phase 1 of Android build configuration fixes. Update Gradle and Java configuration for React Native 0.74.5 compatibility.

TASKS:
1. Update android/gradle/wrapper/gradle-wrapper.properties:
   - Change distributionUrl to use Gradle 8.10 or 8.11
   - Example: distributionUrl=https\://services.gradle.org/distributions/gradle-8.10-bin.zip

2. Update android/build.gradle:
   - Add explicit Android Gradle Plugin version: classpath("com.android.tools.build:gradle:8.7.0")
   - Add kotlinVersion = "1.9.10" to ext block
   - Ensure buildToolsVersion = "34.0.0", compileSdkVersion = 34, targetSdkVersion = 34

3. Update android/gradle.properties:
   - Add org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m
   - Add org.gradle.parallel=true and org.gradle.daemon=true
   - Ensure android.useAndroidX=true and android.enableJetifier=true

4. Test after each change:
   - Run: cd android && ./gradlew clean
   - Run: cd android && ./gradlew build
   - Verify no compilation errors

SUCCESS CRITERIA:
- Clean build succeeds without errors
- No Java compilation issues
- Gradle daemon starts successfully
- All existing functionality preserved

If any step fails, document the error and stop. Do not proceed to next phase.
```

### Phase 2: MMKV Integration and Packaging
**Agent Prompt:**
```
Implement Phase 2 of Android build configuration fixes. Add MMKV-specific configuration and packaging options.

TASKS:
1. Update android/app/build.gradle:
   - Add packagingOptions block with MMKV-specific configurations:
   ```gradle
   packagingOptions {
       pickFirst '**/libc++_shared.so'
       pickFirst '**/libjsc.so'
       pickFirst '**/libfb.so'
       pickFirst 'META-INF/LICENSE'
       pickFirst 'META-INF/LICENSE.md'
       pickFirst 'META-INF/LICENSE.txt'
       pickFirst 'META-INF/NOTICE'
       pickFirst 'META-INF/NOTICE.md'
       pickFirst 'META-INF/NOTICE.txt'
       pickFirst 'META-INF/DEPENDENCIES'
       pickFirst 'META-INF/DEPENDENCIES.txt'
       exclude 'META-INF/LGPL2.1'
       exclude 'META-INF/AL2.0'
   }
   ```

2. Update mobile/scripts/fix-android-build.js:
   - Ensure script includes all MMKV packaging options
   - Verify script handles META-INF conflicts properly

3. Test MMKV integration:
   - Run: cd mobile && npm run android:clean-prebuild
   - Run: cd mobile && npm run android:run
   - Verify MMKV storage works in app (check for any native linking errors)

4. Test build process:
   - Run: cd android && ./gradlew clean build
   - Verify no packaging conflicts or duplicate file errors

SUCCESS CRITERIA:
- Android build completes without packaging errors
- MMKV functionality works in the app
- No duplicate META-INF file conflicts
- All native libraries link correctly

If MMKV functionality fails, document the specific error and investigate native linking.
```

### Phase 3: Standardization and Validation
**Agent Prompt:**
```
Implement Phase 3 of Android build configuration fixes. Standardize configurations and perform comprehensive validation.

TASKS:
1. Standardize gradle.properties:
   - Ensure android/gradle.properties and mobile/gradle.properties are consistent
   - Add any missing properties from Phase 1
   - Verify no conflicting configurations

2. Update build scripts:
   - Review and update mobile/scripts/fix-android-build.js if needed
   - Ensure all build scripts work with new configuration
   - Test: cd mobile && npm run fix:android-build

3. Comprehensive testing:
   - Clean build: cd android && ./gradlew clean build
   - Debug build: cd mobile && npm run android:run
   - Release build: cd mobile && npm run build:android:production (if available)
   - Test on different architectures (if possible)

4. CI/CD validation:
   - Verify build works in CI environment
   - Check build times are reasonable
   - Ensure no new timeout issues

5. Documentation:
   - Document all changes made
   - Create rollback instructions
   - Update any relevant README files

SUCCESS CRITERIA:
- All build types succeed (debug, release)
- Build times are acceptable (< 10 minutes for clean build)
- No regressions in existing functionality
- CI/CD builds pass
- Documentation is complete

FINAL VALIDATION:
Run this complete test sequence:
1. cd android && ./gradlew clean
2. cd android && ./gradlew build
3. cd mobile && npm run android:clean-prebuild
4. cd mobile && npm run android:run
5. Test MMKV functionality in the running app

All steps must succeed for Phase 3 completion.
```

### Emergency Rollback Prompt
**Agent Prompt:**
```
EMERGENCY ROLLBACK: Android build configuration changes have caused critical issues.

TASKS:
1. Revert android/gradle/wrapper/gradle-wrapper.properties to original Gradle version
2. Revert android/build.gradle to original configuration
3. Revert android/gradle.properties to original settings
4. Revert android/app/build.gradle packagingOptions changes
5. Clean all build artifacts:
   - cd android && ./gradlew clean
   - rm -rf android/.gradle
   - rm -rf android/app/build
6. Test original build works:
   - cd android && ./gradlew build
   - cd mobile && npm run android:run

SUCCESS CRITERIA:
- Original build configuration restored
- Build succeeds with original settings
- No broken functionality
- Team can continue development

Document what was reverted and why the changes failed.
```

## Notes
- This is infrastructure work, not code quality improvements
- Focus on build system stability and compatibility
- Ensure changes work in both local and CI environments
- Document any breaking changes for team members
- Use agent prompts in sequence - do not skip phases
- Each phase must complete successfully before proceeding to next