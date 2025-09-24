# Firebase Integration Setup & Testing Guide

## 🚀 Quick Start Checklist

### 1. Firebase Project Setup
Follow the detailed steps in `FIREBASE-SETUP.md` to:
- [ ] Create Firebase project
- [ ] Enable Authentication (Email/Password + Google)
- [ ] Enable Firestore Database
- [ ] Generate service account key
- [ ] Update `.env` with Firebase config

### 2. Install Dependencies
```bash
npm install firebase firebase-admin express-rate-limit helmet
```

### 3. Update Firebase Configuration
Edit `js/auth.js` and replace the Firebase config object:
```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### 4. Start the Server
```bash
npm start
# or for development with auto-restart:
npm run dev
```

## 🧪 Testing the Integration

### Option 1: Use Firebase Test Page
Open `firebase-test.html` in your browser to test:
1. **Authentication** - Sign in/up with email or Google
2. **AI Generator** - Test authenticated AI design generation
3. **Server Status** - Check backend health
4. **Contact Form** - Test form submission to Firestore

### Option 2: Use Main Website
1. Go to `design.html`
2. Try to use the AI Design Generator
3. You'll be prompted to sign in
4. After authentication, your designs will be saved automatically
5. Click "View Saved Designs" to see your history

## 🔍 Features Implemented

### Backend API Endpoints
- `POST /api/khadock-gemini-proxy` - AI design generation (authenticated)
- `GET /api/user/designs` - Get user's saved designs (authenticated)
- `POST /api/contact` - Contact form submission
- `POST /api/register` - User registration endpoint
- `GET /api/health` - Server health check

### Frontend Integration
- **Authentication System** - Email/password and Google OAuth
- **Auto-saving Designs** - Designs saved to user account automatically
- **User Dashboard** - View saved designs and account management
- **Responsive Auth Modal** - Sign in/up modal integrated into design page

### Security Features
- **JWT Token Verification** - All authenticated endpoints verify Firebase tokens
- **Rate Limiting** - API endpoints protected from abuse
- **CORS Configuration** - Proper cross-origin request handling
- **Helmet Security** - Security headers and protection
- **Input Validation** - Server-side validation for all inputs

## 🛠️ Troubleshooting

### Common Issues

1. **"Authentication required" error**
   - Make sure user is signed in
   - Check if Firebase config is correct
   - Verify auth token is being sent with requests

2. **"Database not configured" error**
   - Ensure Firebase Admin SDK is properly initialized
   - Check if service account key file exists
   - Verify Firestore is enabled in Firebase console

3. **CORS errors**
   - Make sure the server is running on the expected port
   - Check CORS configuration in server.js
   - Verify the frontend is making requests to correct backend URL

4. **Google sign-in not working**
   - Ensure Google OAuth is enabled in Firebase Authentication
   - Add your domain to authorized domains in Firebase console
   - Check if Google provider is properly configured

### Debug Steps
1. Check browser console for JavaScript errors
2. Check server logs for backend errors
3. Verify Firebase project settings match your code
4. Test API endpoints directly with tools like Postman
5. Use Firebase Console to check Authentication and Firestore data

## 📊 Database Structure

### Firestore Collections

#### `users` collection
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com", 
  displayName: "User Name",
  createdAt: timestamp,
  lastLogin: timestamp,
  preferences: {
    language: "en",
    notifications: true
  }
}
```

#### `ai_designs` collection
```javascript
{
  userId: "firebase-user-id",
  prompt: "User's original prompt",
  generatedDesign: "AI generated design text",
  createdAt: timestamp,
  isPublic: false,
  metadata: {
    requestType: "initialDesign",
    targetLanguage: "English", 
    features: []
  }
}
```

#### `contact_forms` collection
```javascript
{
  name: "Contact Name",
  email: "contact@example.com",
  phone: "optional phone",
  message: "Contact message",
  submittedAt: timestamp,
  status: "new"
}
```

## 🚀 Production Deployment

### Environment Variables (.env)
```
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Deployment Checklist
- [ ] Update Firebase config with production domains
- [ ] Set environment variables on hosting platform
- [ ] Configure CORS for production domains
- [ ] Update API endpoints in frontend code
- [ ] Test all features in production environment

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Firebase console for authentication/database errors
3. Ensure all API keys and configuration are correct
4. Test with the provided `firebase-test.html` page

The integration provides a complete authentication and data storage solution for the KhaDock website, allowing users to save their AI-generated designs and manage their account seamlessly.