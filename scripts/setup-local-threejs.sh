#!/bin/bash
# Script to download Three.js locally for offline development

echo "Setting up local Three.js libraries..."

cd prototype/avatar-generator/

# Create libs directory
mkdir -p libs

# Download Three.js r148 from a reliable source
echo "Downloading Three.js..."
curl -L -o libs/three.min.js "https://threejs.org/build/three.min.js"

# If that fails, try alternative source
if [ ! -s libs/three.min.js ]; then
    echo "Trying alternative source for Three.js..."
    curl -L -o libs/three.min.js "https://unpkg.com/three@0.148.0/build/three.min.js"
fi

# Download OrbitControls - using the raw file from GitHub
echo "Downloading OrbitControls..."
curl -L -o libs/OrbitControls.js "https://raw.githubusercontent.com/mrdoob/three.js/r148/examples/js/controls/OrbitControls.js"

# Check if files were downloaded successfully
if [ -s libs/three.min.js ] && [ -s libs/OrbitControls.js ]; then
    echo "✅ Three.js libraries downloaded successfully!"
    echo "📁 Files saved to prototype/avatar-generator/libs/"
    echo "📊 File sizes:"
    ls -lh libs/
else
    echo "❌ Download failed. Trying manual download method..."
    echo ""
    echo "Please manually download these files:"
    echo "1. https://threejs.org/build/three.min.js -> save as libs/three.min.js"
    echo "2. https://raw.githubusercontent.com/mrdoob/three.js/r148/examples/js/controls/OrbitControls.js -> save as libs/OrbitControls.js"
fi

echo ""
echo "Now you can run the avatar generator without CORB issues!"
