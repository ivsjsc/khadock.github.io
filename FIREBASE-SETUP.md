# Firebase Configuration for KhaDock

## 🔥 Firebase Project Setup

### 1. Tạo Firebase Project
1. Truy cập: https://console.firebase.google.com/
2. Click "Create a project" hoặc "Add project"
3. Project name: `khadock-website` hoặc tên bạn muốn
4. Enable Google Analytics (optional)
5. Choose Analytics account (nếu enable)

### 2. Enable Authentication
1. Trong Firebase Console, vào **Authentication**
2. Click **Get started**
3. Vào tab **Sign-in method**
4. Enable các provider:
   - ✅ **Email/Password**
   - ✅ **Google** (optional)
   - ✅ **Anonymous** (for guest users)

### 3. Setup Firestore Database
1. Vào **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select location: **nam5 (us-central)** (recommended for US)

### 4. Get Configuration Keys
1. Vào **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app icon** (</>)
4. Register app name: `khadock-web`
5. Copy the **Firebase config object**

### 5. Generate Service Account Key
1. Vào **Project Settings** > **Service accounts**
2. Click **Generate new private key**
3. Download JSON file
4. Rename to `firebase-service-account.json`

## 🔐 Required Firebase Config

Your Firebase config should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## 📊 Firestore Collections Structure

### Users Collection (`users`)
```
users/{userId}
├── email: string
├── displayName: string
├── createdAt: timestamp
├── lastLogin: timestamp
├── role: string ('user' | 'admin')
└── profile: object
    ├── phone: string
    ├── address: string
    └── preferences: object
```

### AI Designs Collection (`ai_designs`)
```
ai_designs/{designId}
├── userId: string
├── prompt: string
├── generatedDesign: string
├── createdAt: timestamp
├── isPublic: boolean
└── metadata: object
    ├── requestType: string
    ├── language: string
    └── features: array
```

### Contact Forms Collection (`contact_forms`)
```
contact_forms/{formId}
├── name: string
├── email: string
├── phone: string
├── message: string
├── submittedAt: timestamp
└── status: string ('new' | 'contacted' | 'completed')
```

## 🚀 Next Steps

1. Create Firebase project following above steps
2. Update `.env` file with Firebase credentials
3. Install Firebase dependencies: `npm install firebase firebase-admin`
4. Update server.js with Firebase integration