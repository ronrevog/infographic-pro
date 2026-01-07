# Firebase Setup Guide

This document explains how to configure Firebase for the Infographic Pro application with secure API key storage and domain-restricted authentication.

## Prerequisites

- A Firebase project (already configured: `infographic-creator-b5778`)
- Access to Firebase Console

## Step 1: Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `infographic-creator-b5778`
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Configure the authorized domains:
   - Add `localhost` for development
   - Add your production domain when deploying

## Step 2: Enable Firestore

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Select **Production mode** (we'll configure security rules)
4. Choose your preferred region

## Step 3: Store API Key in Firestore

1. In Firestore, create a collection called `config`
2. Create a document with ID `api`
3. Add a field:
   - Field name: `geminiApiKey`
   - Field type: `string`
   - Field value: Your Gemini API key

### Structure:
```
config (collection)
└── api (document)
    └── geminiApiKey: "YOUR_GEMINI_API_KEY_HERE"
```

## Step 4: Configure Security Rules

Copy these security rules to your Firestore:

1. Navigate to **Firestore Database** → **Rules**
2. Replace the existing rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Function to check if user email is from complex.com domain
    function isComplexUser() {
      return request.auth != null && 
             request.auth.token.email.matches('.*@complex[.]com$');
    }
    
    // Config collection - only authenticated complex.com users can read
    match /config/{document} {
      allow read: if isComplexUser();
      allow write: if false; // Only admin via console
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish**

## Step 5: Add Authorized Domain (for Production)

When deploying to production:

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your production domain (e.g., `yourdomain.com`)

## Security Notes

### Why This Architecture?

1. **API Key Protection**: The Gemini API key is stored in Firestore, not in client-side code or environment variables. This prevents exposure in browser DevTools or source code.

2. **Domain Restriction**: Only users with `@complex.com` email addresses can:
   - Sign in to the application
   - Access the API key from Firestore

3. **Double Validation**: 
   - Google Sign-in is configured with `hd: 'complex.com'` to restrict the domain prompt
   - Server-side Firestore rules validate the email domain
   - Client-side code also validates the domain as an extra layer

### Best Practices

- Never commit API keys to git
- Regularly rotate your Gemini API key
- Monitor Firestore usage in the Firebase Console
- Review authentication logs for suspicious activity

## Troubleshooting

### "API Key is not configured in Firestore"

This error appears when:
- The `config/api` document doesn't exist
- The `geminiApiKey` field is missing or empty
- Firestore security rules are blocking access

**Solution**: Verify the Firestore document exists and security rules allow read access for authenticated users.

### "Access denied. Only @complex.com emails are allowed"

This error appears when:
- User tried to sign in with a non-complex.com email

**Solution**: Sign in with a `@complex.com` Google Workspace account.

### "This domain is not authorized for sign-in"

This error appears when:
- The application domain is not in Firebase's authorized domains list

**Solution**: Add the domain to Authentication → Settings → Authorized domains.

## Testing Locally

For local development, `localhost` should already be authorized. If you're using a different local domain:

1. Add it to Firebase authorized domains
2. Update `vite.config.ts` if needed for custom host configuration
