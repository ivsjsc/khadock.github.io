# Facebook Login Setup Guide for KhaDock

## Meta App Credentials Provided

- **App ID**: 1725321315465311
- **App Secret**: 1294ea7d961ed9a09f226caeaaa5217a

## Step 1: Configure Meta App Settings

### 1.1 Basic App Configuration

1. Go to [Meta Developer Portal](https://developers.facebook.com/apps/)
2. Select your app (ID: 1725321315465311)
3. Navigate to: **Cài đặt ứng dụng → Thông tin cơ bản** (App Settings → Basic)

#### Add App Domains:
```
App Domains:
khadock.web.app
```
**Note**: Do NOT include `https://` in App Domains.

#### Add Platform:
```
Platform: Website
Site URL: https://khadock.web.app/
```

### 1.2 Facebook Login Configuration

1. Navigate to: **Đăng nhập bằng Facebook → Cài đặt** (Facebook Login → Settings)
2. In the **Valid OAuth Redirect URIs** section, add:

```
https://gen-lang-client-0011229021.firebaseapp.com/__/auth/handler
```

**Important**: This is the Firebase Authentication redirect URI for your project.

### 1.3 App Review (Required for Production)

For your app to work in production:
1. Go to **App Review** in the left sidebar
2. Make sure your app is in **Development Mode** for testing
3. For production, you'll need to submit for review and get approval

## Step 2: Configure Firebase Authentication

### 2.1 Enable Facebook Provider in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `gen-lang-client-0011229021`
3. Navigate to: **Authentication → Sign-in method**
4. Click on **Facebook** provider
5. Enable the toggle switch
6. Enter the following credentials:

```
App ID: 1725321315465311
App Secret: 1294ea7d961ed9a09f226caeaaa5217a
```

### 2.2 Copy OAuth Redirect URI

Firebase will display an OAuth redirect URI. It should be:
```
https://gen-lang-client-0011229021.firebaseapp.com/__/auth/handler
```

**Copy this URI** and add it to your Meta App's Valid OAuth Redirect URIs (as shown in Step 1.2).

### 2.3 Save Configuration

Click **Save** in Firebase Console to enable Facebook Authentication.

## Step 3: Test Facebook Login

### 3.1 Local Testing

1. Open `firebase-test.html` in your browser
2. Click "Sign In" button
3. Click "Sign in with Facebook"
4. You should be redirected to Facebook's login page
5. After authentication, you'll be redirected back to your app

### 3.2 Production Testing

After deploying to Firebase Hosting:
1. Visit: `https://khadock.web.app/firebase-test.html`
2. Test the Facebook login flow
3. Verify authentication works correctly

## Step 4: Custom Domain Configuration (Optional)

If you want to use `khadock.com` instead of `khadock.web.app`:

### 4.1 Add Custom Domain in Firebase

1. Go to Firebase Console → Hosting
2. Click **Add custom domain**
3. Enter: `khadock.com`
4. Firebase will provide DNS records to add to your domain registrar

### 4.2 Update Meta App Configuration

After custom domain is active:
1. Update App Domains in Meta App:
```
khadock.com
www.khadock.com
```

2. Update Website URL:
```
https://khadock.com/
```

3. Update Valid OAuth Redirect URI:
```
https://khadock.com/__/auth/handler
```

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Ensure the redirect URI in Firebase matches exactly with Meta App's Valid OAuth Redirect URIs
- Check for trailing slashes and protocol (https://)

### Error: "App not setup"
- Verify your Meta App is in Development Mode
- Ensure you've added yourself as a Test User in Meta App settings

### Error: "Unauthorized domain"
- Verify App Domains in Meta App include your Firebase hosting domain
- Check that the domain format is correct (no https:// in App Domains)

## Security Notes

- **Never expose your App Secret in client-side code**
- The App Secret is only used in Firebase Console configuration
- Your Firebase config in `js/auth.js` only contains the App ID, which is safe for public use

## Current Configuration Summary

**Meta App:**
- App ID: 1725321315465311
- App Domains: khadock.web.app
- Website URL: https://khadock.web.app/
- OAuth Redirect URI: https://gen-lang-client-0011229021.firebaseapp.com/__/auth/handler

**Firebase:**
- Project: gen-lang-client-0011229021
- Auth Domain: gen-lang-client-0011229021.firebaseapp.com
- Facebook Provider: Enabled with App ID and Secret

## Next Steps

1. Complete Meta App configuration (Step 1)
2. Enable Facebook provider in Firebase Console (Step 2)
3. Test the login flow (Step 3)
4. Deploy and verify production functionality

For more information, refer to:
- [Firebase Facebook Authentication](https://firebase.google.com/docs/auth/web/facebook-login)
- [Meta Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
