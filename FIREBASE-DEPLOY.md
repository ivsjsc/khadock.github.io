# Firebase Deployment Guide

## Prerequisites

1. Install Firebase CLI globally:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

## Deployment

### Deploy to khadock site only:
```bash
npm run deploy
```
or
```bash
firebase deploy --only hosting:khadock
```

### Deploy all Firebase services:
```bash
npm run deploy:all
```
or
```bash
firebase deploy
```

## Configuration

- **Project**: ivstech
- **Site**: khadock
- **Public directory**: . (root directory)

## Notes

- All Netlify configurations have been removed
- The project is now configured for Firebase Hosting
- Security headers from netlify.toml have been migrated to firebase.json
- Form handling will need to be implemented separately (Firebase doesn't have built-in form handling like Netlify)
