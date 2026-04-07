# Registration Feature Setup Guide

This document provides step-by-step instructions for setting up and configuring the registration feature for GUIDR, including email/password signup and Google OAuth integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Supabase Configuration](#supabase-configuration)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Database Schema](#database-schema)
6. [Testing the Registration Flow](#testing-the-registration-flow)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before setting up the registration feature, ensure you have:

- Node.js 18+ installed
- A Supabase account and project created
- Access to your Supabase project dashboard
- A Google Cloud Console account (for OAuth)

## Environment Variables

Create or update your `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

You can find these values in your Supabase project dashboard under **Settings > API**.

---

## Supabase Configuration

### 1. Enable Email Authentication

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Providers**
3. Ensure **Email** provider is enabled
4. Configure email settings:
   - **Enable email confirmations**: Toggle based on your preference
   - **Secure email change**: Recommended to enable
   - **Minimum password length**: Set to 8 characters (matches validation)

### 2. Configure Site URL and Redirect URLs

1. Go to **Authentication > URL Configuration**
2. Set your **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```

### 3. Email Templates (Optional)

Customize your email templates under **Authentication > Email Templates**:

- Confirmation email
- Password recovery
- Email change confirmation

---

## Google OAuth Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application**
6. Configure the OAuth consent screen if prompted

### Step 2: Configure OAuth Client

Set the following values:

**Authorized JavaScript origins:**

```
http://localhost:3000
https://your-production-domain.com
```

**Authorized redirect URIs:**

```
https://your-project-id.supabase.co/auth/v1/callback
```

> **Important:** Use your actual Supabase project URL, not your Next.js app URL.

### Step 3: Get Client ID and Secret

After creating the OAuth client:

1. Copy the **Client ID**
2. Copy the **Client Secret**

### Step 4: Enable Google Provider in Supabase

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Providers**
3. Find **Google** in the list and click to configure
4. Enable the Google provider
5. Paste your **Client ID**
6. Paste your **Client Secret**
7. Click **Save**

---

## Database Schema

The registration feature uses the `profiles` table. Ensure your table has the following structure:

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_type TEXT[] DEFAULT ARRAY['student'],
  program TEXT DEFAULT '',
  year_standing TEXT DEFAULT '',
  skills TEXT DEFAULT '',
  chat_link TEXT DEFAULT '',
  photo_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

Run this migration in your Supabase SQL Editor if the table doesn't exist or needs updates.

---

## Testing the Registration Flow

### 1. Start the Development Server

```powershell
npm run dev
```

### 2. Test Organization Registration

1. Navigate to `http://localhost:3000/register`
2. Click the **Organization** tab
3. Fill in:
   - Organization name: `Test Company`
   - Email: `test@example.com`
   - Password: `testpassword123`
4. Check the Terms of Use checkbox
5. Click **Create account**

### 3. Test Mentor Registration

1. Navigate to `http://localhost:3000/register`
2. Click the **Mentor** tab
3. Fill in:
   - First name: `John`
   - Last name: `Doe`
   - Profession: `Software Engineer`
   - Email: `mentor@example.com`
   - Password: `mentorpass123`
4. Check the Terms of Use checkbox
5. Click **Create account**

### 4. Test Google OAuth

1. Navigate to `http://localhost:3000/register`
2. Select your desired role (Organization or Mentor)
3. Click **Sign-up with Google**
4. Complete the Google sign-in flow
5. You should be redirected to the home page

### 5. Verify in Supabase

1. Go to **Authentication > Users** in your Supabase dashboard
2. Check that the new user appears
3. Go to **Table Editor > profiles**
4. Verify the profile was created with correct role information

---

## Registration Feature Components

### Files Created

1. **`src/app/register/page.tsx`**

   - Server component that checks auth state
   - Redirects logged-in users to home
   - Renders RegisterClient component

2. **`src/components/RegisterClient.tsx`**

   - Client component with registration forms
   - Role selection (Organization/Mentor)
   - Form validation and error handling
   - Supabase auth integration
   - Google OAuth button

3. **`src/app/auth/callback/route.ts`**

   - OAuth callback handler
   - Exchanges code for session
   - Creates profile for new OAuth users
   - Redirects to home page

4. **Updated `tailwind.config.ts`**

   - Added brand colors: `guidr.green`, `guidr.dark`, `guidr.light`
   - Added League Spartan font family

5. **Updated `src/app/layout.tsx`**
   - Imported and configured League Spartan font

---

## Validation Rules

The registration form enforces the following validation:

### Organization Form

- **Organization name**: Required, cannot be empty
- **Email**: Valid email format (contains @ and domain)
- **Password**: Minimum 8 characters
- **Terms**: Must be accepted

### Mentor Form

- **First name**: Required, cannot be empty
- **Last name**: Required, cannot be empty
- **Profession/Title**: Required, cannot be empty
- **Email**: Valid email format (contains @ and domain)
- **Password**: Minimum 8 characters
- **Terms**: Must be accepted

---

## Troubleshooting

### Issue: "Invalid redirect URL"

**Solution:**

- Verify your redirect URL in Supabase matches exactly: `http://localhost:3000/auth/callback`
- Check that you've added the Supabase callback URL in Google OAuth settings
- Restart the dev server after updating environment variables

### Issue: Google OAuth shows "Error 400: redirect_uri_mismatch"

**Solution:**

- Ensure your Google OAuth redirect URI is set to your Supabase auth callback:
  ```
  https://your-project-id.supabase.co/auth/v1/callback
  ```
- Wait a few minutes for Google to propagate the changes

### Issue: Profile not created after signup

**Solution:**

- Check Supabase logs under **Logs > Auth**
- Verify RLS policies allow INSERT for authenticated users
- Check that the `profiles` table exists and has correct schema
- Look for errors in browser console (F12)

### Issue: "Email not confirmed"

**Solution:**

- If email confirmation is required, check the user's email inbox
- For development, disable email confirmation in Supabase:
  - Go to **Authentication > Settings**
  - Toggle off "Enable email confirmations"

### Issue: User can't see their profile data

**Solution:**

- Verify RLS policies are set correctly
- Check that the profile `user_id` matches `auth.uid()`
- Test the policy in Supabase SQL editor:
  ```sql
  SELECT * FROM profiles WHERE user_id = auth.uid();
  ```

---

## Security Considerations

1. **Password Strength**: Consider adding additional password requirements (uppercase, numbers, special characters)

2. **Rate Limiting**: Implement rate limiting for signup endpoints to prevent abuse

3. **Email Verification**: Enable email confirmation for production to verify user emails

4. **CAPTCHA**: Consider adding CAPTCHA/reCAPTCHA for bot protection

5. **OAuth Scopes**: Review and minimize Google OAuth scopes to only what's needed

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Update `NEXT_PUBLIC_SUPABASE_URL` with production URL
- [ ] Set production redirect URLs in Supabase
- [ ] Add production domain to Google OAuth authorized origins
- [ ] Enable email confirmation in Supabase
- [ ] Review and test RLS policies
- [ ] Set up proper error logging (e.g., Sentry)
- [ ] Test all registration flows in production environment
- [ ] Configure custom email templates with your branding
- [ ] Set up monitoring for failed signups

---

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router Authentication](https://nextjs.org/docs/app/building-your-application/authentication)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Review Supabase logs (Auth and Database)
3. Verify all environment variables are set correctly
4. Ensure you're using the latest version of dependencies

For project-specific questions, refer to the main `README.md` or open an issue in the repository.

---

## Local Development & Project Setup

To run this Next.js project locally after cloning:

### 1. Install Dependencies
```bash
npm install
```

### 2. TypeScript Configuration for Supabase
If you are writing Supabase Edge Functions (which use Deno) in the same repository, ensure that the Next.js compiler ignores them so that build/dev scripts don't fail with Deno type errors.

In your `tsconfig.json`:
```json
{
  "exclude": ["node_modules", "supabase/functions/**/*"]
}
```

### 3. Running the Server
```bash
# Start the development server on localhost:3000
npm run dev
```

### 4. Production Build
To verify that there are no remaining TypeScript or compiler errors:
```bash
# Check for TS errors and build Next.js optimized assets
npm run build
```

