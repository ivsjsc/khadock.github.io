# KhaDock AI Design Generator - Setup Instructions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env file and add your Gemini API key
# Get API key from: https://makersuite.google.com/app/apikey
```

### 3. Configure .env file
```env
GEMINI_API_KEY=your_actual_api_key_here
PORT=3001
NODE_ENV=development
```

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

### 5. Access the Website
- Frontend: http://localhost:3001
- API Health Check: http://localhost:3001/api/health
- AI Generator: http://localhost:3001/design.html

## 🔧 API Endpoints

### Health Check
```
GET /api/health
```

### AI Design Generator
```
POST /api/khadock-gemini-proxy
Content-Type: application/json

{
  "prompt": "I want a modern floating dock...",
  "targetLanguage": "English",
  "requestType": "initialDesign"
}
```

## 🧪 Testing the AI Feature

1. Go to http://localhost:3001/design.html
2. Scroll to "AI Design Generator" section
3. Enter a dock description like:
   ```
   I want a modern floating dock for my sailboat, 
   with LED lighting and composite decking
   ```
4. Click "Generate Design"

## 🔒 Security Notes

- Never commit your `.env` file
- Keep your Gemini API key secure
- Use environment variables for all sensitive data

## 📦 Dependencies

- **express**: Web server framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable loader
- **@google/generative-ai**: Google Gemini AI SDK

## 🌐 Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Configure proper CORS origins
3. Use a process manager like PM2 (if self-hosting)
4. Set up SSL/TLS certificates

### Deploy to Render (Free)

We've included a `render.yaml` for one-click setup on Render.

Steps:
1. Push this repository to GitHub (already done).
2. Go to https://render.com, create an account, click New -> Blueprint -> Connect this repo.
3. Render reads `render.yaml` and configures a Web Service.
4. Add Environment Variables:
   - `GEMINI_API_KEY` = your key (required)
   - `ALLOWED_ORIGINS` = `https://khadock.com,https://www.khadock.com,https://khadock.github.io`
5. Deploy. After deploy, you'll get a URL like `https://khadock-ai-server.onrender.com`.

Frontend integration (GitHub Pages):
Add a small inline script before loading `js/ai-design-simple.js` on pages that use AI:

```html
<script>
  window.KHADOCK_API_BASE = 'https://khadock-ai-server.onrender.com';
  window.KHADOCK_API_BASE_FALLBACK = 'https://khadock-ai-server.onrender.com';
</script>
<script src="js/ai-design-simple.js" defer></script>
```

This makes the AI generator call your deployed server instead of `localhost`.

## 🐛 Troubleshooting

### AI Not Working?
1. Check if GEMINI_API_KEY is set in .env
2. Verify API key is valid
3. Check console logs for errors
4. Test API health endpoint

### CORS Issues?
1. Check ALLOWED_ORIGINS in .env
2. Verify frontend URL matches CORS settings

### Dependencies Missing?
```bash
npm install --save express cors @google/generative-ai dotenv
```