#!/bin/bash

echo "Fixing Android build for CI/CD..."

# Fix Gradle repositories first
echo "Applying Gradle repository fixes..."
if [ -f "scripts/fix-gradle-repos.sh" ]; then
    chmod +x scripts/fix-gradle-repos.sh
    ./scripts/fix-gradle-repos.sh
fi

# Use CI-optimized gradle properties if in CI
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "CI environment detected, using optimized gradle properties..."
  
  # Create gradle-ci.properties if it doesn't exist
  cat > android/gradle-ci.properties << 'EOF'
# CI-optimized Gradle properties
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
org.gradle.daemon=false
org.gradle.parallel=false
org.gradle.configureondemand=false
org.gradle.caching=false

# Build optimizations
android.useAndroidX=true
android.enableJetifier=true
android.enableR8=false
android.enableProguardInReleaseBuilds=false

# Network timeouts for CI
systemProp.http.connectionTimeout=120000
systemProp.http.socketTimeout=120000
systemProp.https.connectionTimeout=120000
systemProp.https.socketTimeout=120000

# Kotlin optimizations
kotlin.incremental=false
kotlin.compiler.execution.strategy=in-process
EOF
  
  if [ -f "android/gradle-ci.properties" ]; then
    cp android/gradle-ci.properties android/gradle.properties
  fi
fi

# Clear gradle caches
echo "Clearing gradle caches..."
if [ -d "android" ]; then
  cd android
  rm -rf .gradle build app/build
  cd ..
fi

# Ensure proper permissions
if [ -f "android/gradlew" ]; then
  chmod +x android/gradlew
fi

# Apply patches
echo "Applying patches..."
npx patch-package || true

echo "Android CI build fixes applied!"