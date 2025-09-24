// KhaDock Simple AI Design Generator Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Initialize Google Gemini AI
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Middleware
// CORS: allow localhost during dev, GitHub Pages, and custom domains; support env override via ALLOWED_ORIGINS
const defaultAllowed = [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'http://localhost:3001',
    'https://khadock.github.io',
    'https://khadock.com',
    'https://www.khadock.com'
];
const envAllowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envAllowed]));

app.use(cors({
    origin: function (origin, callback) {
        // Allow non-browser requests or same-origin
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.static('.'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        aiService: !!genAI ? 'connected' : 'not configured',
        version: '1.0.0'
    });
});

// Simple AI Design Generator endpoint - no authentication needed
app.post('/api/ai-design', async (req, res) => {
    try {
        console.log('🎨 AI Design request received:', {
            promptLength: req.body.prompt ? req.body.prompt.length : 0,
            language: req.body.targetLanguage || 'English'
        });

        if (!genAI) {
            return res.status(500).json({
                error: 'AI service not configured. Please check GEMINI_API_KEY.'
            });
        }

        const { prompt, targetLanguage = "English" } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: 'Please describe your dock design idea.'
            });
        }

        // Get the AI model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create enhanced prompt for dock design
        const enhancedPrompt = `As KhaDock's expert dock designer in Florida, create a detailed and creative boat dock concept for: "${prompt}"

Provide a comprehensive response in ${targetLanguage} with these sections:
**🏗️ Concept Name:** [Creative, catchy name for the design]
**✨ Overall Vision:** [2-3 sentences describing the main idea and aesthetic feel]
**🔧 Key Features & Functionality:**
- [Feature 1 with brief description]
- [Feature 2 with brief description] 
- [Feature 3 with brief description]
- [Additional features as needed]
**🏗️ Suggested Materials:** [2-3 primary materials suitable for Florida's coastal climate]
**🎨 Aesthetic Style:** [Design style, colors, and visual appeal]
**🎯 Best Suited For:** [Target users, property types, or specific use cases]

Focus on practicality for Florida's coastal environment (sun protection, saltwater resistance, hurricane resilience). Keep response engaging and around 200-300 words.`;

        // Generate the design
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error('No design generated');
        }

        console.log('✅ Design generated successfully:', {
            responseLength: text.length,
            timestamp: new Date().toISOString()
        });

        res.json({
            design: text,
            timestamp: new Date().toISOString(),
            prompt: prompt
        });

    } catch (error) {
        console.error('❌ AI Design Error:', error);

        // Handle specific error types
        if (error.message.includes('API key')) {
            return res.status(401).json({
                error: 'API key invalid. Please check configuration.'
            });
        }

        if (error.message.includes('quota')) {
            return res.status(429).json({
                error: 'API quota exceeded. Please try again later.'
            });
        }

        if (error.message.includes('safety')) {
            return res.status(400).json({
                error: 'Content filtered. Please try a different description.'
            });
        }

        res.status(500).json({
            error: error.message || 'Error generating design. Please try again.'
        });
    }
});

// Contact form endpoint (simple, no database)
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                error: 'Name, email, and message are required.'
            });
        }

        // Log contact form submission (you can add email sending here later)
        console.log('📧 Contact form received:', {
            name,
            email,
            phone: phone || 'not provided',
            messageLength: message.length,
            timestamp: new Date().toISOString()
        });

        res.json({
            success: true,
            message: 'Contact form received successfully!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: 'Failed to submit contact form.'
        });
    }
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/design', (req, res) => {
    res.sendFile(path.join(__dirname, 'design.html'));
});

// Start server
app.listen(port, () => {
    console.log(`🚀 KhaDock Server running on http://localhost:${port}`);
    console.log(`🎨 AI Design Generator: ${genAI ? '✅ Ready' : '❌ Not configured'}`);
    console.log(`📧 Contact Form: ✅ Ready`);
    console.log(`🌐 Static Files: ✅ Serving from current directory`);
});