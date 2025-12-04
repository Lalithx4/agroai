# CropMagix 🌱

AI-powered agricultural assistant for farmers. Detect plant diseases, chat with your plants, and get weather-based farming advice.

## Features

- 📷 **Plant Scanner** - Detect diseases using AI image analysis (Gemini 2.0 Flash)
- 💬 **Plant Chat** - Talk to your plants with ultra-fast responses (Cerebras)
- 🔮 **Future Prediction** - See how your plant will look if treated vs untreated
- 🌤️ **Weather & Soil** - Get hyper-local farming advice
- 🌍 **Multi-language** - English, Hindi (हिंदी), Telugu (తెలుగు)

## Tech Stack

### Backend
- **FastAPI** - High-performance Python web framework
- **Gemini 2.0 Flash** - Multimodal AI for image analysis
- **Cerebras** - Ultra-fast LLM inference for chat

### Frontend
- **Vanilla JS** - No framework, fast loading
- **Modern CSS** - Neumorphic design, green theme
- **PWA Ready** - Works offline, installable

## Quick Start

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your API keys

# Run server
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend

# Option 1: Use Python's built-in server
python -m http.server 3000

# Option 2: Use Node's serve
npx serve -p 3000

# Option 3: Use VS Code Live Server extension
```

Open http://localhost:3000 in your browser.

## Deployment

### Deploy Backend to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `CEREBRAS_API_KEY`
   - `GOOGLE_AI_API_KEY`
   - `OPENWEATHER_API_KEY` (optional)

### Deploy Frontend to Vercel

1. Create a new project on [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set the root directory to `frontend`
4. Deploy!

**Important**: Update `API_CONFIG.BASE_URL` in `frontend/js/api.js` with your Render backend URL.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-health` | POST | Analyze plant health from image |
| `/api/chat-with-plant` | POST | Chat with plant persona |
| `/api/generate-future` | POST | Generate future prediction |
| `/api/soil-weather` | POST | Soil analysis + weather data |
| `/api/weather` | GET | Weather data only |

## Environment Variables

```env
# Required
CEREBRAS_API_KEY=your_cerebras_key
GOOGLE_AI_API_KEY=your_gemini_key

# Optional
OPENWEATHER_API_KEY=your_weather_key
HUGGINGFACE_API_KEY=your_hf_key
```

## Data Persistence

All data is stored locally in the browser:
- **Scan History** - Last 50 scans with thumbnails
- **Chat History** - Last 100 messages
- **Weather Cache** - 15-minute TTL
- **User Location** - For weather accuracy

Use the "Reset All Data" button to clear everything.

## Language Support

Click the language buttons in the header:
- **EN** - English
- **हि** - Hindi
- **తె** - Telugu

The app remembers your language preference.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for your farming projects!

---

Made with 💚 for farmers everywhere.
