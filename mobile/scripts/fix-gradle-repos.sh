#!/bin/bash

echo "Fixing Gradle repositories for build stability..."

# Function to add repositories to a build.gradle file
add_repositories() {
    local file=$1
    echo "Updating repositories in $file"
    
    # Create a temporary file with updated repositories
    cat > /tmp/gradle_repos_fix.txt << 'EOF'
    repositories {
        // Primary repositories
        google()
        mavenCentral()
        
        // Fallback repositories for better availability
        maven { url "https://repo1.maven.org/maven2" }
        maven { url "https://jcenter.bintray.com" }
        maven { url "https://maven.google.com" }
        
        // Gradle plugin portal with fallback
        gradlePluginPortal()
        maven { 
            url "https://plugins-artifacts.gradle.org/m2/"
            allowInsecureProtocol = true
        }
        
        // JitPack for GitHub libraries
        maven { url "https://jitpack.io" }
        
        // Kotlin specific repositories
        maven { url "https://kotlin.bintray.com/kotlinx" }
        
        // Additional fallback
        maven { url "https://repo.maven.apache.org/maven2" }
        
        // Local repository as last resort
        mavenLocal()
    }
EOF
    
    # Check if the file exists
    if [ -f "$file" ]; then
        # Backup original file
        cp "$file" "${file}.backup"
        
        # Replace repositories block
        awk '
        /repositories\s*{/ {
            print "    // Fixed repositories with fallbacks"
            system("cat /tmp/gradle_repos_fix.txt")
            in_repo = 1
            brace_count = 1
            next
        }
        in_repo {
            if (/\{/) brace_count++
            if (/\}/) {
                brace_count--
                if (brace_count == 0) {
                    in_repo = 0
                    next
                }
            }
            next
        }
        { print }
        ' "$file" > "${file}.tmp"
        
        mv "${file}.tmp" "$file"
        echo "✓ Updated $file"
    fi
}

# Create gradle init script for global repository configuration
create_init_script() {
    local init_dir="$HOME/.gradle/init.d"
    mkdir -p "$init_dir"
    
    cat > "$init_dir/repositories.gradle" << 'EOF'
allprojects {
    buildscript {
        repositories {
            google()
            mavenCentral()
            maven { url "https://repo1.maven.org/maven2" }
            maven { url "https://plugins-artifacts.gradle.org/m2/" }
            gradlePluginPortal()
            mavenLocal()
        }
    }
    
    repositories {
        google()
        mavenCentral()
        maven { url "https://repo1.maven.org/maven2" }
        maven { url "https://plugins-artifacts.gradle.org/m2/" }
        gradlePluginPortal()
        mavenLocal()
    }
}

settingsEvaluated { settings ->
    settings.pluginManagement {
        repositories {
            google()
            mavenCentral()
            gradlePluginPortal()
            maven { url "https://plugins-artifacts.gradle.org/m2/" }
            mavenLocal()
        }
    }
}
EOF
    
    echo "✓ Created global Gradle init script"
}

# Main execution
echo "Setting up Gradle repository fixes..."

# Create global init script
create_init_script

# If in mobile directory, prebuild and fix Android files
if [ -f "package.json" ] && grep -q "expo" package.json; then
    echo "Detected Expo project, applying fixes..."
    
    # Prebuild if android folder doesn't exist
    if [ ! -d "android" ]; then
        echo "Android folder not found, running prebuild..."
        CI=1 npx expo prebuild --platform android --clean
    fi
    
    # Fix android/build.gradle
    if [ -f "android/build.gradle" ]; then
        add_repositories "android/build.gradle"
    fi
    
    # Fix android/app/build.gradle
    if [ -f "android/app/build.gradle" ]; then
        add_repositories "android/app/build.gradle"
    fi
    
    # Create or update gradle.properties with optimizations
    cat >> android/gradle.properties << 'EOF'

# Repository and network settings
systemProp.http.connectionTimeout=120000
systemProp.http.socketTimeout=120000
systemProp.https.connectionTimeout=120000
systemProp.https.socketTimeout=120000

# Gradle daemon settings
org.gradle.daemon=false
org.gradle.parallel=false
org.gradle.configureondemand=false
org.gradle.caching=false

# Memory settings for CI
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
EOF
    
    echo "✓ Updated gradle.properties"
fi

# Clean Gradle cache to force fresh downloads
echo "Cleaning Gradle cache..."
rm -rf ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/kotlin-scripting-compiler-impl-embeddable

echo "✅ Gradle repository fixes applied successfully!"
echo ""
echo "The following fixes were applied:"
echo "1. Added fallback repositories to build.gradle files"
echo "2. Created global Gradle init script with repository configuration"
echo "3. Updated gradle.properties with network timeout settings"
echo "4. Cleaned problematic cache entries"
echo ""
echo "You can now retry the build."