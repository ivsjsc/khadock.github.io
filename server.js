// server.js - Backend server for KhaDock AI Design Generator with Firebase
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import admin from 'firebase-admin';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES modules dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://generativelanguage.googleapis.com"]
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: process.env.RATE_LIMIT || 60, // limit each IP to 60 requests per windowMs
    message: {
        error: {
            message: 'Too many requests from this IP, please try again later.'
        }
    }
});
app.use('/api/', limiter);

// CORS middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://khadock.com', 'https://www.khadock.com']
        : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

// Initialize Firebase Admin
let db;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
        const serviceAccount = JSON.parse(fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        
        db = admin.firestore();
        console.log('✅ Firebase Admin initialized successfully');
    } else {
        console.warn('⚠️  Firebase service account file not found. User data won\'t be saved.');
    }
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
}

// Initialize Gemini AI
let genAI;
try {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
    } else {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log('✅ Google Generative AI initialized successfully');
    }
} catch (error) {
    console.error('❌ Failed to initialize Google Generative AI:', error.message);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        geminiReady: !!genAI,
        firebaseReady: !!db,
        services: {
            gemini: !!genAI ? 'Connected' : 'Not configured',
            firebase: !!db ? 'Connected' : 'Not configured'
        }
    });
});

// Firebase Authentication middleware
async function authenticateUser(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        req.user = null;
        return next();
    }

    try {
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        req.user = null;
        next();
    }
}

// User registration/login endpoint
app.post('/api/auth/register', async (req, res) => {
    try {
        const { uid, email, displayName } = req.body;
        
        if (!uid || !email) {
            return res.status(400).json({
                error: { message: 'UID and email are required' }
            });
        }

        if (!db) {
            return res.status(500).json({
                error: { message: 'Database not configured' }
            });
        }

        // Save user data to Firestore
        const userDoc = {
            email,
            displayName: displayName || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: admin.firestore.FieldValue.serverTimestamp(),
            role: 'user',
            profile: {
                phone: '',
                address: '',
                preferences: {}
            }
        };

        await db.collection('users').doc(uid).set(userDoc, { merge: true });

        res.json({
            success: true,
            message: 'User registered successfully',
            user: { uid, email, displayName }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: { message: 'Registration failed' }
        });
    }
});

// Main AI Design Generator endpoint with user data saving
app.post('/api/khadock-gemini-proxy', authenticateUser, async (req, res) => {
    try {
        console.log('🚀 Received AI design request:', {
            requestType: req.body.requestType,
            targetLanguage: req.body.targetLanguage,
            promptLength: req.body.prompt ? req.body.prompt.length : 0,
            userId: req.user ? req.user.uid : 'anonymous'
        });

        if (!genAI) {
            return res.status(500).json({
                error: {
                    message: 'AI service is not properly configured. Please check server configuration.'
                }
            });
        }

        const { prompt, targetLanguage = "English", requestType = "design" } = req.body;

        if (!prompt || prompt.trim().length === 0) {
            return res.status(400).json({
                error: {
                    message: 'Prompt is required and cannot be empty.'
                }
            });
        }

        // Get the generative model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Enhanced prompt based on request type
        let enhancedPrompt = prompt;
        
        if (requestType === "initialDesign") {
            enhancedPrompt = `As KhaDock's expert dock designer in Florida, create a detailed dock concept for: "${prompt}"

Provide a comprehensive response in ${targetLanguage} with these sections:
**Concept Name:** [Creative name for the design]
**Overall Vision:** [2-3 sentences describing the concept]
**Key Features & Functionality:**
- [Feature 1 with brief description]
- [Feature 2 with brief description]
- [Feature 3 with brief description]
**Suggested Materials:** [Materials suitable for Florida climate]
**Aesthetic Style:** [Design style and visual appeal]
**Best Suited For:** [Target users/property types]

Focus on practicality for Florida's coastal environment (sun, saltwater, hurricanes). Keep response 150-250 words.`;
        }

        // Generate content
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const text = response.text();

        if (!text) {
            throw new Error('No content generated by AI');
        }

        // Save design to Firestore if user is authenticated and database is available
        if (req.user && db) {
            try {
                const designDoc = {
                    userId: req.user.uid,
                    prompt: prompt,
                    generatedDesign: text,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    isPublic: false,
                    metadata: {
                        requestType: requestType,
                        targetLanguage: targetLanguage,
                        features: []
                    }
                };

                await db.collection('ai_designs').add(designDoc);
                console.log('💾 Design saved to Firestore for user:', req.user.uid);
            } catch (dbError) {
                console.error('Database save error:', dbError);
                // Don't fail the request if database save fails
            }
        }

        console.log('✅ AI response generated successfully:', {
            responseLength: text.length,
            requestType,
            saved: !!(req.user && db)
        });

        res.json({ 
            text: text,
            requestType: requestType,
            timestamp: new Date().toISOString(),
            saved: !!(req.user && db)
        });

    } catch (error) {
        console.error('❌ Error in AI design generation:', {
            message: error.message,
            status: error.status,
            type: error.constructor.name
        });

        // Handle different types of errors
        if (error.message.includes('API key')) {
            return res.status(401).json({
                error: {
                    message: 'Authentication failed. Please check API configuration.'
                }
            });
        }

        if (error.message.includes('quota')) {
            return res.status(429).json({
                error: {
                    message: 'API quota exceeded. Please try again later.'
                }
            });
        }

        if (error.message.includes('safety')) {
            return res.status(400).json({
                error: {
                    message: 'Content filtered for safety reasons. Please try a different description.'
                }
            });
        }

        res.status(500).json({
            error: {
                message: error.message || 'An unexpected error occurred while generating your design. Please try again.'
            }
        });
    }
});

// Get user's saved designs
app.get('/api/user/designs', authenticateUser, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: { message: 'Authentication required' }
            });
        }

        if (!db) {
            return res.status(500).json({
                error: { message: 'Database not configured' }
            });
        }

        const designsSnapshot = await db.collection('ai_designs')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const designs = designsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
        }));

        res.json({
            designs: designs,
            count: designs.length
        });

    } catch (error) {
        console.error('Error fetching user designs:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch designs' }
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                error: { message: 'Name, email, and message are required' }
            });
        }

        if (db) {
            const contactDoc = {
                name,
                email,
                phone: phone || '',
                message,
                submittedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            };

            await db.collection('contact_forms').add(contactDoc);
        }

        res.json({
            success: true,
            message: 'Contact form submitted successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: { message: 'Failed to submit contact form' }
        });
    }
});

// Get user's saved designs
app.get('/api/user/designs', authenticateUser, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                error: { message: 'Authentication required' }
            });
        }

        if (!db) {
            return res.status(500).json({
                error: { message: 'Database not configured' }
            });
        }

        const designsSnapshot = await db.collection('ai_designs')
            .where('userId', '==', req.user.uid)
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const designs = designsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString()
        }));

        res.json({
            designs: designs,
            count: designs.length
        });

    } catch (error) {
        console.error('Error fetching user designs:', error);
        res.status(500).json({
            error: { message: 'Failed to fetch designs' }
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({
                error: { message: 'Name, email, and message are required' }
            });
        }

        if (db) {
            const contactDoc = {
                name,
                email,
                phone: phone || '',
                message,
                submittedAt: admin.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            };

            await db.collection('contact_forms').add(contactDoc);
        }

        res.json({
            success: true,
            message: 'Contact form submitted successfully'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            error: { message: 'Failed to submit contact form' }
        });
    }
});

// Serve the main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all handler for SPA routing
app.get('*', (req, res) => {
    // Check if the request is for a static file
    const fileExtensions = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.mp4'];
    const hasExtension = fileExtensions.some(ext => req.path.includes(ext));
    
    if (hasExtension) {
        // Try to serve the static file
        res.sendFile(path.join(__dirname, req.path), (err) => {
            if (err) {
                res.status(404).json({ error: 'File not found' });
            }
        });
    } else {
        // For routes without extensions, serve index.html (SPA behavior)
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🔥 Unhandled error:', error);
    res.status(500).json({
        error: {
            message: 'Internal server error occurred.'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚢 KhaDock Server is running!
🌐 Port: ${PORT}
🔗 URL: http://localhost:${PORT}
🤖 Gemini AI: ${genAI ? '✅ Ready' : '❌ Not configured'}
⚙️  Environment: ${process.env.NODE_ENV || 'development'}
    `);
    
    if (!process.env.GEMINI_API_KEY) {
        console.log(`
⚠️  To enable AI features, create a .env file with:
GEMINI_API_KEY=your_api_key_here
        `);
    }
});

export default app;