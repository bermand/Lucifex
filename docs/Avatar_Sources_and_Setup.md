# Avatar GLB Files - Sources and Setup Guide

## 🎯 **Free Avatar Sources**

### 1. **Ready Player Me** (Recommended)
- **URL**: https://readyplayer.me/
- **Format**: GLB/GLTF
- **Quality**: High-quality, fashion-ready
- **Customization**: Extensive body types, clothing
- **API**: Available for bulk generation
- **License**: Free for non-commercial, paid for commercial

### 2. **Mixamo Characters**
- **URL**: https://www.mixamo.com/
- **Format**: FBX (convert to GLB)
- **Quality**: Professional game-ready
- **Variety**: Multiple body types and poses
- **License**: Free with Adobe account

### 3. **Sketchfab Free Models**
- **URL**: https://sketchfab.com/3d-models?features=downloadable&sort_by=-likeCount&q=avatar
- **Format**: Various (look for GLB)
- **Quality**: Varies
- **License**: Check individual licenses (many CC0)

### 4. **VRoid Hub**
- **URL**: https://hub.vroid.com/
- **Format**: VRM (convertible to GLB)
- **Quality**: Anime-style, high quality
- **License**: Varies by creator

## 🔧 **Quick Setup Instructions**

### Option A: Ready Player Me (Recommended)
1. Go to https://readyplayer.me/
2. Create avatars with different body types
3. Export as GLB/GLTF
4. Rename files to match our preset system

### Option B: Download Sample Avatars
I'll provide direct links to some CC0 avatars you can use immediately.
\`\`\`

## 🛠 **Tools for Creating/Converting Avatars**

### 1. **Blender** (Free)
- Convert FBX to GLB
- Modify existing avatars
- Create custom avatars
- Export with proper materials

### 2. **glTF-Pipeline** (Command Line)
\`\`\`bash
npm install -g gltf-pipeline
gltf-pipeline -i model.gltf -o model.glb
\`\`\`

### 3. **Online Converters**
- **Facebook FBX2glTF**: https://github.com/facebookincubator/FBX2glTF
- **Khronos glTF Validator**: https://github.khronos.org/glTF-Validator/

## 📦 **Sample Avatar Collection**

I'll create a starter set of avatars for your project:

### Body Types Needed:
- Female Small (XS-S)
- Female Medium (M)  
- Female Large (L-XL)
- Male Small (XS-S)
- Male Medium (M)
- Male Large (L-XL)

### Specifications:
- **Format**: GLB (single file)
- **Size**: Under 5MB each
- **Materials**: PBR compatible
- **Pose**: T-pose or A-pose
- **Textures**: Skin, basic clothing optional
- **Optimization**: Web-ready, low poly
