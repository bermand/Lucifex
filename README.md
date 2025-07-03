# Made-to-Measure Latex & Leather Fashion App

This repository contains the MVP implementation plan, detailed documentation, and code scaffolding for a fashion app that enables users to:
- Input body measurements or perform a body scan
- Generate a 3D avatar
- Preview custom latex/leather garments
- Modify avatar and garment features using natural language
- Export pattern files for manufacturing

---

## 📚 Documentation

- [MVP Requirements](docs/MVP_Requirements.md)
- [Project Plan](docs/MVP_Project_Plan.md)
- [Technical Architecture](docs/Technical_Architecture_and_Design.md)
- [Detailed Component Design](docs/Detailed_Component_Design.md)
- [Body Scan Workflow](docs/Body_Scan_Workflow.md)
- [Natural Language Editing](docs/Natural_Language_Editing.md)
- [Garment Modeling](docs/Garment_Modeling.md)

---

## 🗂 Project Structure

```
app/            # Frontend (React Native or Web)
backend/        # Backend logic, APIs, services
docs/           # All documentation in Markdown
scripts/        # Dev/admin tools
public/         # Static assets and 3D models
```

---

## 🛠 Tech Stack (MVP)

- React Native / Three.js or Unity
- Supabase / Firebase
- Blender + Marvelous Designer / CLO3D
- Optional: GPT-4 or rule-based NLP engine
