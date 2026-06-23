# MemeGuard React Frontend

A modern, professional React website for the Hateful Meme Detector. Built with **Vite**, **Tailwind CSS**, and **Framer Motion**.

## Features

- ✨ Modern, responsive UI design
- 🎨 Tailwind CSS styling with custom theme
- 🎬 Smooth animations with Framer Motion
- 📱 Mobile-first responsive design
- 🔌 Integrated with Flask API backend
- 🚀 Fast dev server with Vite
- ♿ Accessibility-first approach

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx       # Navigation bar with mobile menu
│   │   ├── Hero.jsx         # Hero section with CTA
│   │   ├── Uploader.jsx     # Image upload with drag/drop
│   │   ├── Results.jsx      # Analysis results display
│   │   └── Footer.jsx       # Footer with links
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Tech Stack

- **React 18** — UI library
- **Vite** — Build tool & dev server
- **Tailwind CSS** — Utility-first CSS framework
- **Framer Motion** — Animation library
- **Axios** — HTTP client for API calls
- **Lucide React** — Icon library

## Setup & Install

1. Install Node.js (v16+ recommended)

2. Install dependencies:
```bash
cd frontend
npm install
```

3. Create `.env` file (optional):
```
VITE_API_URL=http://127.0.0.1:5000
```

## Development

Start the dev server (runs on http://localhost:3000):

```bash
npm run dev
```

The Vite proxy automatically routes `/api/*` calls to the Flask backend at `http://127.0.0.1:5000`.

## Build for Production

```bash
npm run build
npm run preview
```

This generates an optimized build in `dist/`.

## Color Palette

- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#ec4899` (Pink)
- **Accent**: `#06b6d4` (Cyan)
- **Success**: `#10b981` (Emerald)
- **Danger**: `#ef4444` (Red)
- **Dark**: `#1f2937` (Gray-900)
- **Light**: `#f9fafb` (Gray-50)

## Component Breakdown

### Navbar
- Sticky header with logo/brand name
- Desktop navigation links
- Mobile hamburger menu
- CTA button

### Hero
- Large headline with gradient text
- Subheading
- Animated icon
- Dual CTA buttons

### Uploader
- Caption input field
- Drag & drop zone
- File preview
- Analyze button with loading state
- Error handling

### Results
- Verdict badge (Safe/Hateful)
- Original image display
- Detailed reasoning
- Model status & meta info
- JSON response viewer

### Footer
- Brand section
- Navigation links (Product, Company)
- Social media links
- Copyright info

## Animations

- **Fade In**: Smooth entrance animations
- **Slide Up**: Elements slide up on mount
- **Pulse Soft**: Subtle pulsing effect on icons
- **Scale**: Button hover/tap animations

Powered by **Framer Motion** for smooth, production-ready animations.

## Proxy Configuration

The Vite dev server includes proxy configuration to route API calls:

```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:5000',
    changeOrigin: true
  }
}
```

This means requests to `/api/analyze` are proxied to `http://127.0.0.1:5000/api/analyze`.

## Deployment

To deploy to production:

1. Build the app: `npm run build`
2. Serve the `dist/` folder as static files
3. Update API endpoint in `vite.config.js` if needed
4. Deploy Flask backend separately

## License

MIT
