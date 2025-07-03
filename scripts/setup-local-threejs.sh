#!/bin/bash
# Script to download Three.js locally for offline development

echo "Setting up local Three.js libraries..."

cd prototype/avatar-generator/

# Create libs directory
mkdir -p libs

# Download Three.js r148
echo "Downloading Three.js..."
curl -o libs/three.min.js https://cdnjs.cloudflare.com/ajax/libs/three.js/r148/three.min.js

# Download OrbitControls
echo "Downloading OrbitControls..."
curl -o libs/OrbitControls.js https://cdn.jsdelivr.net/npm/three@0.148.0/examples/js/controls/OrbitControls.js

echo "✅ Three.js libraries downloaded successfully!"
echo "📁 Files saved to prototype/avatar-generator/libs/"
echo ""
echo "Now using the updated index.html file that references local libraries."
