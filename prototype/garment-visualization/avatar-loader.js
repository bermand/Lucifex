// Avatar Loader Module
// Handles loading and managing avatar GLB files

class AvatarLoader {
  constructor() {
    this.avatarCache = new Map()
    this.baseUrl = "./prototype/assets/avatars/"
    this.manifest = null
  }

  async loadManifest() {
    try {
      const response = await fetch(`${this.baseUrl}manifest.json`)
      this.manifest = await response.json()
      return this.manifest
    } catch (error) {
      console.warn("Avatar manifest not found, using defaults")
      return this.getDefaultManifest()
    }
  }

  getDefaultManifest() {
    return {
      version: "1.0.0",
      avatars: {
        "female-s": { name: "Female Small", description: "Petite female avatar" },
        "female-m": { name: "Female Medium", description: "Average female avatar" },
        "female-l": { name: "Female Large", description: "Plus-size female avatar" },
        "male-s": { name: "Male Small", description: "Slim male avatar" },
        "male-m": { name: "Male Medium", description: "Average male avatar" },
        "male-l": { name: "Male Large", description: "Large male avatar" },
      },
    }
  }

  async loadAvatar(avatarId) {
    // Check cache first
    if (this.avatarCache.has(avatarId)) {
      return this.avatarCache.get(avatarId)
    }

    const avatarUrl = `${this.baseUrl}${avatarId}.glb`

    try {
      // Check if file exists
      const response = await fetch(avatarUrl, { method: "HEAD" })

      if (response.ok) {
        // File exists, cache the URL
        this.avatarCache.set(avatarId, avatarUrl)
        return avatarUrl
      } else {
        throw new Error(`Avatar file not found: ${avatarId}.glb`)
      }
    } catch (error) {
      console.warn(`Avatar ${avatarId} not available:`, error.message)

      // Return placeholder or fallback
      return this.getFallbackAvatar(avatarId)
    }
  }

  getFallbackAvatar(avatarId) {
    // Return a data URL for a simple placeholder
    // In a real app, you might have a default avatar GLB
    console.log(`Using fallback for avatar: ${avatarId}`)
    return null // Will show placeholder in UI
  }

  async preloadAvatars() {
    if (!this.manifest) {
      await this.loadManifest()
    }

    const loadPromises = Object.keys(this.manifest.avatars).map((avatarId) => this.loadAvatar(avatarId))

    const results = await Promise.allSettled(loadPromises)

    const loaded = results.filter((r) => r.status === "fulfilled").length
    const total = results.length

    console.log(`Avatar preload complete: ${loaded}/${total} avatars available`)

    return {
      loaded,
      total,
      available: Array.from(this.avatarCache.keys()),
    }
  }

  getAvailableAvatars() {
    return Array.from(this.avatarCache.keys())
  }

  isAvatarAvailable(avatarId) {
    return this.avatarCache.has(avatarId)
  }
}

// Export for use in main app
window.AvatarLoader = AvatarLoader
