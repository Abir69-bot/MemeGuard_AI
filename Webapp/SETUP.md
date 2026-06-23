# Complete Setup Guide

This guide walks you through setting up both the Flask backend and React frontend.

## Prerequisites

- Python 3.9+ (for backend)
- Node.js 16+ (for frontend)
- pip (Python package manager)
- npm (Node package manager)

## Backend Setup (Flask)

### 1. Install Python Dependencies

```powershell
cd F:\webapp
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Verify Model File

Ensure `best_model.pt` is in `F:\webapp`:
```powershell
Test-Path F:\webapp\best_model.pt
```

### 3. Run Flask Server

```powershell
.\.venv\Scripts\python.exe app.py
```

You should see:
```
Loading your real hateful meme model...
MODEL LOADED PERFECTLY ON cpu!
 * Running on http://127.0.0.1:5000
```

The backend is now running on **http://127.0.0.1:5000**.

---

## Frontend Setup (React)

### 1. Install Node Dependencies

```powershell
cd F:\webapp\frontend
npm install
```

This installs React, Vite, Tailwind CSS, Framer Motion, and other dependencies.

### 2. Start Development Server

```powershell
npm run dev
```

You should see:
```
VITE v5.0.0 ready in 123 ms

➜ Local: http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### 3. Build for Production

```powershell
npm run build
```

This creates an optimized build in `frontend/dist/`.

---

## Running Both Servers

### Terminal 1: Backend (Flask)
```powershell
cd F:\webapp
.\.venv\Scripts\Activate.ps1
.\.venv\Scripts\python.exe app.py
```

### Terminal 2: Frontend (React)
```powershell
cd F:\webapp\frontend
npm run dev
```

---

## Testing the API

### Using cURL (Windows PowerShell)

```powershell
$image = Get-Item "path\to\your\image.jpg"
$caption = "test caption"

curl.exe -X POST `
  -F "image=@$image" `
  -F "caption=$caption" `
  http://127.0.0.1:5000/api/analyze
```

### Using Python

```python
import requests

with open('image.jpg', 'rb') as f:
    files = {'image': f}
    data = {'caption': 'optional caption'}
    resp = requests.post('http://127.0.0.1:5000/api/analyze', files=files, data=data)
    print(resp.json())
```

### Using JavaScript/Fetch

```javascript
const formData = new FormData()
formData.append('image', imageFile)
formData.append('caption', 'optional caption')

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
})

const data = await response.json()
console.log(data)
```

---

## API Response Format

```json
{
  "is_hateful": false,
  "category_of_concern": "None",
  "reasoning": "No hateful or offensive content detected.",
  "caption_provided": false,
  "model_status": "success"
}
```

---

## Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'PIL'"**
- Ensure venv is activated
- Reinstall: `.\.venv\Scripts\pip.exe install pillow`

**"MODEL LOADED FAILED"**
- Check `best_model.pt` exists in `F:\webapp`
- Verify model file is not corrupted
- Model will default to "safe" predictions if loading fails

**Port 5000 already in use**
- Change port in `app.py`: `app.run(port=5001)`

---

### Frontend Issues

**"npm: command not found"**
- Ensure Node.js is installed: `node --version`
- Restart PowerShell after installing Node

**"Port 3000 already in use"**
- Change in `vite.config.js`: `port: 3001`

**"Cannot find module 'lucide-react'"**
- Run: `npm install lucide-react`

---

## File Structure

```
F:\webapp\
├── app.py                    # Flask app
├── ai_judge.py              # AI model logic
├── best_model.pt            # Model weights
├── requirements.txt         # Python dependencies
├── temp_images/             # Temporary uploaded images
├── templates/               # HTML templates (old simple UI)
│   ├── index.html
│   └── result.html
├── static/                  # Static assets (old simple UI)
│   ├── style.css
│   └── script.js
├── test_api.py              # API test script
└── frontend/                # React app (NEW)
    ├── src/
    │   ├── components/
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Next Steps

1. ✅ Backend running at http://127.0.0.1:5000
2. ✅ Frontend running at http://localhost:3000
3. Upload an image and test the analysis
4. Check browser console (F12) for API response details

---

## Production Deployment

### Backend (Flask)
Use a WSGI server like Gunicorn:
```powershell
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (React)
1. Build: `npm run build`
2. Serve `dist/` folder with a web server (nginx, Vercel, Netlify, etc.)
3. Update API endpoint in `vite.config.js` or `.env` to point to production backend

---

## Support

For issues:
1. Check error messages in both terminal windows
2. Ensure both servers are running
3. Check browser network tab (F12)
4. Verify API response in console
