# Full Project Requirements Document

## 📘 Project Overview

This project is a digital platform for high-end, made-to-measure latex and leather fashion. It enables users to:
- Input body measurements manually or via phone-based scan
- Generate a realistic 3D avatar of themselves
- Preview custom garments rendered on the avatar
- Edit both the avatar and garments using natural language
- Export pattern files for production

---

## 🎯 Goals

- Personalize fit and appearance of garments
- Empower users with visual and tactile accuracy
- Support gender diversity and body autonomy
- Bridge digital design and physical fabrication

---

## 🔧 Functional Requirements

### 1. User Onboarding & Profiles
- Sign up, login, and manage profile
- Store body measurement sets
- Manage avatar settings and garment preferences

### 2. Measurement Input
- Manual form input for standard dimensions
- Integration with phone-based body scanning SDK
- Measurement verification and editing tools

### 3. Avatar Generator
- Base mesh with morph targets
- Real-time rendering of 3D avatar
- Morphs driven by manual or scanned measurements
- Natural language-driven avatar editing (e.g., “flatten chest”)

### 4. Garment Library & Viewer
- Browse pre-modeled latex/leather garments
- Render garments on avatars in 3D
- View fabric, shine, and fit accurately with PBR materials
- Filter by category, designer, fit style, etc.

### 5. Natural Language Interface
- Users type commands to adjust garments (e.g., “longer sleeves”, “deeper V”)
- NLP engine parses and maps to garment variants or parameters
- System previews results and confirms changes

### 6. Pattern Flattening & Output
- Use avatar or garment 3D mesh as basis
- Flatten into 2D panels for manufacturing
- Export as DXF/SVG for cutting and layout

### 7. Wishlist / Look Saving
- Save full avatar + garment configurations
- Version looks and keep a design history
- Tag looks for wishlist, fitting, or production

### 8. Admin & Creator Tools
- Upload and manage new garment models
- Flatten panels from CLO3D/Marvelous exports
- Add metadata and variant parameters
- Tag garments with fit styles, categories, etc.

---

## 🧱 Technical Requirements

### Platform & Frameworks
- React Native or Three.js/React for frontend
- Supabase (or Firebase) for backend DB and storage
- Three.js or Unity for avatar rendering
- Blender + CLO3D/Marvelous Designer for 3D assets

### Avatar & Mesh Handling
- Use of morph targets for scalability
- Import/export standard file types (GLTF, FBX, OBJ)
- Optional use of scan-based avatars

### NLP Interface
- Phase 1: Rule-based mappings
- Phase 2: GPT-4 or similar function-calling API
- Confidence threshold fallback system

---

## 🔐 Privacy & Compliance

- Opt-in for body scan and avatar use
- "Delete my data" and "export my data" features
- End-to-end encryption of scan files
- GDPR-compliant retention and transparency

---

## 🧪 Testing Requirements

- Cross-platform compatibility testing
- Accuracy testing of avatar morphing
- Visual fidelity tests for garment rendering
- NLP parsing QA for avatar/garment editing

---

## 📅 Phased Development Plan

### Phase 1: Core Platform
- User auth, manual measurements, base avatar rendering

### Phase 2: Garment Engine
- Garment preview, basic editing, garment DB

### Phase 3: Scanning Integration
- Phone-based scan → morphable avatar workflow

### Phase 4: Natural Language
- Add NLP editing of avatar and garments

### Phase 5: Panel Output & Admin Tools
- Garment flattening, DXF export, and creator interface

---

## 🔍 Open Questions

- Final provider choice for scan SDK?
- Will production partner accept digital DXF outputs?
- Include lookbook/gallery features in MVP?

---

## ✅ Success Criteria

- User can create an accurate avatar from scan or form
- At least 5 garments load correctly with parameter editing
- Avatar and garment can be adjusted via natural language
- User can export at least one panel-ready file per garment
