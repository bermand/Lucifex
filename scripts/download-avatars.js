// Avatar Download and Setup Script
// Run with: node scripts/download-avatars.js

import fs from "fs"
import path from "path"
import https from "https"

const AVATAR_DIR = "./prototype/assets/avatars/"
const GARMENT_DIR = "./prototype/assets/garments/"

// Ensure directories exist
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true })
}

if (!fs.existsSync(GARMENT_DIR)) {
  fs.mkdirSync(GARMENT_DIR, { recursive: true })
}

// Free avatar sources (these are example URLs - you'll need to find actual GLB files)
const avatarSources = {
  "female-s": {
    name: "Female Small",
    url: "https://example.com/female-small.glb", // Replace with actual URL
    description: "Petite female avatar for XS-S sizing",
  },
  "female-m": {
    name: "Female Medium",
    url: "https://example.com/female-medium.glb", // Replace with actual URL
    description: "Average female avatar for M sizing",
  },
  "female-l": {
    name: "Female Large",
    url: "https://example.com/female-large.glb", // Replace with actual URL
    description: "Plus-size female avatar for L-XL sizing",
  },
  "male-s": {
    name: "Male Small",
    url: "https://example.com/male-small.glb", // Replace with actual URL
    description: "Slim male avatar for XS-S sizing",
  },
  "male-m": {
    name: "Male Medium",
    url: "https://example.com/male-medium.glb", // Replace with actual URL
    description: "Average male avatar for M sizing",
  },
  "male-l": {
    name: "Male Large",
    url: "https://example.com/male-large.glb", // Replace with actual URL
    description: "Large male avatar for L-XL sizing",
  },
}

// Function to download a file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath)

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
          return
        }

        response.pipe(file)

        file.on("finish", () => {
          file.close()
          resolve()
        })

        file.on("error", (err) => {
          fs.unlink(filepath, () => {}) // Delete partial file
          reject(err)
        })
      })
      .on("error", (err) => {
        reject(err)
      })
  })
}

// Download all avatars
async function downloadAvatars() {
  console.log("🎨 Downloading avatar GLB files...\n")

  for (const [id, avatar] of Object.entries(avatarSources)) {
    const filepath = path.join(AVATAR_DIR, `${id}.glb`)

    try {
      console.log(`📥 Downloading ${avatar.name}...`)
      await downloadFile(avatar.url, filepath)

      const stats = fs.statSync(filepath)
      console.log(`✅ ${avatar.name} downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
    } catch (error) {
      console.log(`❌ Failed to download ${avatar.name}: ${error.message}`)
      console.log(`💡 You'll need to manually add ${id}.glb to ${AVATAR_DIR}`)
    }
  }

  console.log("\n🎯 Avatar download complete!")
  console.log(`📁 Check ${AVATAR_DIR} for your avatar files`)
}

// Create avatar manifest
function createAvatarManifest() {
  const manifest = {
    version: "1.0.0",
    avatars: avatarSources,
    directory: AVATAR_DIR,
    format: "GLB",
    created: new Date().toISOString(),
  }

  fs.writeFileSync(path.join(AVATAR_DIR, "manifest.json"), JSON.stringify(manifest, null, 2))

  console.log("📋 Avatar manifest created")
}

// Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadAvatars()
    .then(() => createAvatarManifest())
    .catch(console.error)
}

export { downloadAvatars, avatarSources }
