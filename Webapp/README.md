# MemeGuard — Hateful Meme Detector 🚨

A simple demo project that combines a Flask backend running a ResNet-18 + DistilBERT-based hateful meme detection model with a React (Vite + Tailwind) frontend and an optional Telegram moderation bot.

This README documents setup, running services locally on Windows (PowerShell), testing the API, and common troubleshooting tips.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start (Windows / PowerShell)](#quick-start-windows--powershell)
  - [Backend (Flask + model)](#backend-flask--model)
  - [Frontend (React / Vite)](#frontend-react--vite)
  - [Telegram Bot (optional)](#telegram-bot-optional)
- [API](#api)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)
- [License & Credits](#license--credits)

---

## Features

- Image + optional caption analysis for hateful/offensive content
- Flask API: `/api/analyze` accepts multipart form-data (image + caption)
- React frontend with drag & drop uploader and results UI
- Optional Telegram bot that automatically moderates group messages
- Grad-CAM helper (server-side) for visual explanations (saved to `temp_images/`)

---

## Prerequisites

- Windows (instructions target PowerShell)
- Python 3.11 / 3.12 (recommended) or Python 3.14 (see Troubleshooting)
- Node.js (>=18 recommended) and npm or yarn
- A GPU is optional — model runs on CPU by default

Files included in repo:
- `app.py` — Flask backend
- `ai_judge.py` — model loading / inference utilities
- `best_model.pt` — model weights (keep at repo root)
- `frontend/` — React frontend (Vite + Tailwind)
- `main.py` (Telegram bot) — optional bot code

---

## Quick Start (Windows / PowerShell)

### 1) Backend (Flask + model)

1. Open PowerShell and change to the repo root (e.g., `F:\webapp`).

2. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install Python dependencies:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

4. Ensure the model weights are present: `best_model.pt` should be in the repo root.

5. Start the Flask server:

```powershell
python app.py
```

By default the Flask server runs at: `http://127.0.0.1:5000`.

> Tip: The Flask reloader may restart the server during development — that's normal.


### 2) Frontend (React / Vite)

1. Open a new PowerShell window and change to the frontend directory:

```powershell
cd frontend
npm install
npm run dev
```

2. Vite tries port `3000` but will pick another free port (e.g., `3001`) if it's in use. Use the local address printed by Vite.

3. The frontend proxies `/api` to `http://127.0.0.1:5000` (see `vite.config.js`), so calls to `/api/analyze` go to the Flask backend.

### 3) Telegram Bot (optional)

1. Create a `.env` file (in the bot folder or repo root) and add your token:

```
BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

2. Install bot dependencies (can use the same venv):

```powershell
python -m pip install python-telegram-bot --upgrade
```

3. Run the bot:

```powershell
python main.py
```

Notes:
- The bot must be admin in the group with the "Delete Messages" permission to remove hateful content.
- Bot filters photos in groups/supergroups only.

---

## API

**POST** `/api/analyze`
- Form fields:
  - `image` (file) — required
  - `caption` (string) — optional

Example (curl):

```bash
curl -X POST "http://127.0.0.1:5000/api/analyze" -F "image=@/path/to/meme.jpg" -F "caption=some text"
```

Sample JSON response:

```json
{
  "is_hateful": false,
  "category_of_concern": "None",
  "reasoning": "No hateful or offensive content detected.",
  "caption_provided": true,
  "model_status": "success"
}
```

The backend may also save Grad-CAM overlays or temporary files under `temp_images/` and serve them at `/temp_images/<filename>`.

---

## Troubleshooting

- **`torch` import or model loading errors**
  - Make sure your venv is activated and that you installed `pip install -r requirements.txt` inside it.
  - If using Python 3.14, be aware some PyTorch/torchvision wheels historically targeted 3.8–3.12; try a PyTorch build compatible with your Python, or use Python 3.11/3.12 if possible.

- **Frontend can't reach backend**
  - Ensure Flask runs at `http://127.0.0.1:5000`.
  - In the browser DevTools -> Network, inspect the `/api/analyze` request and check the response.

- **Port 3000 in use**
  - Vite will fallback to another port (e.g., `3001`). Use the dev URL printed by Vite.

- **Virtualenv removal issues (Windows locks / DLLs)**
  - Stop any running Python processes (Task Manager or `Stop-Process`), then delete `.venv`.

- **React compilation / syntax errors**
  - Check the terminal where `npm run dev` is running — Vite reports compilation errors and stack traces.

If you want, I can create a short `QUICK_START.md` or a small test script that programmatically posts a local image to `/api/analyze`.

---

## Project Structure

```
F:\webapp
├─ app.py                # Flask app + endpoints
├─ ai_judge.py           # Model logic (ResNet-18 + DistilBERT)
├─ best_model.pt         # Weights (required)
├─ requirements.txt
├─ temp_images/          # Generated images (gradcam overlays, uploads)
└─ frontend/
   ├─ package.json
   └─ src/               # React components (Uploader, Results, Hero, etc.)

Optional:
└─ Telibot/ (or main.py) # Telegram bot code
```

---

## License & Credits

This project is a demo/prototype. Add a proper LICENSE file if you plan to publish the repository.

---

If you'd like, I can also:
- Add a concise `QUICK_START.md` for quicker onboarding,
- Add a small Postman collection or test script for `/api/analyze`,
- Or create a short `CONTRIBUTING.md` for collaborators.


