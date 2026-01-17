# Google OAuth Setup Guide

## Why the Google Sign-In Button Doesn't Work Yet

The Google OAuth button requires credentials from Google Cloud Console. Without these credentials in your `.env` file, the button won't function.

## Quick Setup (5 minutes)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "SimbaOS" (or any name you prefer)
4. Click "Create"

### Step 2: Enable Google+ API

1. In your new project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **SimbaOS**
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue" through the remaining steps
4. Back to "Create OAuth client ID":
   - Application type: **Web application**
   - Name: **SimbaOS Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Click "Create"

### Step 4: Add Credentials to .env

1. Copy the **Client ID** and **Client Secret** shown in the popup
2. Open your `.env` file
3. Add these lines (replace with your actual values):

```env
GOOGLE_CLIENT_ID="your-actual-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-actual-client-secret-here"
```

### Step 5: Restart the Dev Server

```bash
# Stop the server (Ctrl+C if running)
npm run dev
```

## Testing

1. Go to `http://localhost:3000/auth/signin`
2. Click "Continue with Google"
3. You should see the Google sign-in popup
4. After signing in, you'll be redirected to the dashboard

## Optional: For Production Deployment

When deploying to production (e.g., Vercel, Netlify):

1. Add your production URL to authorized origins and redirect URIs in Google Cloud Console
2. Add the same `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to your production environment variables

Example production redirect URI:

```
https://your-domain.com/api/auth/callback/google
```

## Troubleshooting

### "Error 400: redirect_uri_mismatch"

- Make sure `http://localhost:3000/api/auth/callback/google` is in your authorized redirect URIs
- Check that there are no extra spaces or typos

### "Access blocked: This app's request is invalid"

- Complete the OAuth consent screen configuration
- Make sure you added your email as a test user (for External apps in development)

### Button still doesn't work

- Verify credentials are in `.env` file
- Restart the dev server after adding credentials
- Check browser console for errors (F12)

## Using Email/Password Instead

If you prefer not to set up Google OAuth right now, you can still use the email/password sign-up:

1. Click "Or continue with email" on the sign-in page
2. Or go to the sign-up page and create an account with email/password
3. Google OAuth can be added later without affecting existing accounts
