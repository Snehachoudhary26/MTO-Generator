<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1E3A5F,50:3B6EA5,100:1E3A5F&height=220&section=header&text=MTO%20Generator%20%F0%9F%94%A7&fontSize=60&fontColor=ffffff&fontAlignY=40&desc=AI-Powered%20Material%20Take-Off%20from%20Piping%20Isometrics&descAlignY=62&descSize=18&animation=fadeIn" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/AI-Gemini%201.5%20Pro-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white"/>
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
</p>

<h3 align="center">
  🧾 Submitted for the <b>AI Intern Assessment</b> — <a href="https://assessmentpathnovo.vercel.app/" target="_blank">Path Novo</a>
</h3>

<img src="https://capsule-render.vercel.app/api?type=rect&color=E8F0F8&height=4&section=header" width="100%"/>

---

## 🎯 What is MTO Generator?

> **MTO Generator** takes a piping isometric drawing — PDF, PNG, or JPG — and turns it into a structured **Material Take-Off (MTO)**: pipe runs, fittings, valves, welds, supports, and equipment, each with size, spec, quantity, and confidence score, ready to export as CSV.

Built against a real assessor-provided sample drawing (Loop-3, hand-marked isometric on grid paper) as the primary test case.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📤 **Drawing Upload** | PDF / PNG / JPG, up to 20MB, validated client + server side |
| 🤖 **AI Extraction** | Gemini 1.5 Pro reads the drawing and returns structured MTO data |
| 🧪 **Mock Mode** | Fully functional without any API key — for grading without credentials |
| 📊 **MTO Table** | Item no, category, size, schedule/rating, material, end type, qty, length, confidence, remarks |
| 📈 **Summary Dashboard** | Auto-calculated totals: pipe length, welds, fittings, valves |
| 🖼️ **Drawing Preview** | View the uploaded drawing beside its extracted data |
| 📥 **CSV Export** | One-click download of the full MTO table |

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Python |
| **AI** | Google Gemini 1.5 Pro (multimodal) via `google-generativeai` |
| **Data Export** | CSV streaming via FastAPI `StreamingResponse` |

</div>

---

## 📁 Project Structure

```
MTO-Generator/
│
├── 📂 frontend/                 # Next.js app
│   ├── 📂 app/
│   │   ├── 🏠 page.tsx           # Upload UI + MTO table + summary + CSV export
│   │   ├── 🧩 layout.tsx         # Root layout
│   │   └── 🎨 globals.css        # Tailwind + theme tokens
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── 📂 backend/                  # FastAPI server
│   ├── 🚀 main.py                # API routes: /extract-mto, /extract-mto/csv, /api/health
│   ├── 🧠 mto_extractor.py       # Gemini call + mock MTO generator + schema
│   ├── requirements.txt
│   └── .env.example
│
└── 📄 README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API status + current mode (gemini / mock) |
| GET | `/api/health` | Health check |
| POST | `/extract-mto` | Upload a drawing, get back structured MTO JSON |
| GET | `/extract-mto/csv?filename=...` | Download the last generated MTO as CSV |

---

## 🏗️ How It Works

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=E8F0F8&height=3&section=header" width="60%"/>
</p>

1. 📤 User uploads a piping isometric drawing on the Next.js frontend.
2. 🔀 The file is sent to FastAPI's `/extract-mto` endpoint.
3. 🔑 **If `GEMINI_API_KEY` is set** → the drawing is sent directly to Gemini 1.5 Pro with a structured prompt requesting a specific JSON schema (pipe runs, fittings, valves, welds, supports, equipment).
4. 🧪 **If no key is set** → a realistic mock MTO (based on the sample Loop-3 drawing) is returned instead, so the whole app is testable with zero credentials.
5. 📊 The frontend renders: a summary dashboard, the full MTO table, a drawing preview, and a CSV export button.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- (Optional) A free [Google AI Studio](https://aistudio.google.com/) API key

### 1. Clone the repo

```bash
git clone https://github.com/Snehachoudhary26/MTO-Generator.git
cd MTO-Generator
```

### 2. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # optionally add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit **http://localhost:3000**

---

## 🔑 Environment Variables

| Variable | Required? | Description |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | No | If unset, the app runs fully in **mock mode**. |

---

## 🧪 Assumptions & Limitations

- Gemini's extraction accuracy depends on drawing clarity; hand-marked/scanned drawings (like the Loop-3 sample) may need manual review of low-confidence rows.
- `length_m` values are visual estimates, not measured — flagged via the `confidence` field on each item.
- Single-drawing uploads only (no batch processing yet).
- PDF preview is currently a placeholder; only image files render inline.

---

## 🔮 Roadmap

- [ ] 📚 Batch upload + multi-drawing MTO aggregation
- [ ] 💾 Persistent storage (currently in-memory, resets on server restart)
- [ ] 🔍 OCR pre-pass to improve accuracy on hand-annotated drawings
- [ ] ✏️ Editable table for manual correction before export
- [ ] 🖥️ PDF.js-based inline PDF preview

---

## 👩‍💻 Developer

<div align="center">

**Built by Sneha Choudhary** for the AI Intern Assessment — Path Novo

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1E3A5F,50:3B6EA5,100:1E3A5F&height=120&section=footer&animation=fadeIn" width="100%"/>
</p>

</div>
