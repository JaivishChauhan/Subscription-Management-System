# Authentication Setup Guide

## Overview

The application now supports both Google OAuth and email/password authentication with proper session management and cookie handling.

## Features Implemented

✅ Session-based authentication with NextAuth v5
✅ Login/Logout functionality in header navigation
✅ Protected routes with middleware
✅ Automatic redirect to dashboard after login
✅ Redirect to login for protected pages
✅ Secure cookie configuration
✅ Session persistence (30 days)

## Quick Start

### 1. Create Admin User

Run this command to create the default admin user:

```bash
pnpm db:create-admin
```

This creates:
- Email: `admin@subsms.local`
- Password: `Admin@1234!`
- Role: `admin`

### 2. Environment Variables

Ensure your `.env` file has the following:

```env
# Database
DATABASE_URL="your-database-url"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secret with:
```bash
openssl rand -base64 32
```

### 3. Start Development Server

```bash
pnpm dev
```

## Protected Routes

The following routes require authentication:
- `/dashboard` - User dashboard
- `/admin/*` - Admin panel
- `/profile` - User profile
- `/subscriptions` - User subscriptions
- `/invoices` - User invoices
- `/cart` - Shopping cart
- `/checkout` - Checkout process

Unauthenticated users are automatically redirected to `/login` with a callback URL.

## Navigation Features

### Authenticated Users See:
- User name/avatar
- Dashboard link
- Sign out button

### Unauthenticated Users See:
- Log in button
- Sign up button

## Security Features

### Cookie Configuration
- HttpOnly cookies (prevents XSS attacks)
- SameSite: Lax (CSRF protection)
- Secure flag in production (HTTPS only)
- 30-day session expiration

### Middleware Protection
- Automatic route protection
- Callback URL preservation
- Prevents authenticated users from accessing auth pages

## Production Deployment

### Important: Password Hashing

For production, implement proper password hashing:

1. Install bcryptjs:
```bash
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

2. Update `lib/auth.ts`:
```typescript
import { compare } from "bcryptjs";

// In the Credentials provider authorize function:
const isPasswordValid = await compare(
  credentials.password as string,
  user.password
);
```

3. Update `scripts/create-admin.ts`:
```typescript
import { hash } from "bcryptjs";

const hashedPassword = await hash("Admin@1234!", 12);
// Use hashedPassword in user creation
```

### Environment Variables

Ensure all production environment variables are set:
- Use strong `NEXTAUTH_SECRET`
- Set correct `NEXTAUTH_URL` (your production domain)
- Configure Google OAuth credentials for production

## Testing

### Test Login Flow
1. Navigate to `/dashboard` (should redirect to login)
2. Use demo credentials or Google OAuth
3. Should redirect back to dashboard
4. Header should show user info and logout button

### Test Logout Flow
1. Click "Sign out" in header
2. Should redirect to home page
3. Header should show login/signup buttons
4. Accessing `/dashboard` should redirect to login

## Troubleshooting

### Session Not Persisting
- Check `NEXTAUTH_SECRET` is set
- Verify cookies are enabled in browser
- Check browser console for errors

### Redirect Loop
- Ensure middleware matcher excludes static files
- Check `NEXTAUTH_URL` matches your domain
- Verify database connection
- **REPETITIVE ERROR FIX (NextAuth v5 Role Loss):** If you experience an infinite loop specifically between `/admin` and `/dashboard` (i.e. `GET /admin 307` and `GET /dashboard 307`), this is caused by a session mismatch between the Edge Middleware (`proxy.ts`) and Node.js Server Components (`lib/auth.ts`). When mixing `PrismaAdapter` with `strategy: "jwt"`, the `session` callback receives either `token` (Edge) or `user` (Node) properties. The `session` callback must safely extract variables using `const userRole = token?.role || user?.role || "portal"` to ensure `.role` isn't silently dropped by NextAuth, preventing the server component (`layout.tsx`) from incorrectly perceiving logged-in admins as unprivileged users.

### Google OAuth Not Working
- Verify Google OAuth credentials
- Check authorized redirect URIs in Google Console
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

## API Routes

### Authentication Endpoints
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session
- `GET /api/auth/providers` - Get available providers

## File Structure

```
├── lib/
│   └── auth.ts                 # NextAuth configuration
├── middleware.ts               # Route protection
├── components/
│   ├── navigation.tsx          # Header with auth UI
│   └── providers.tsx           # SessionProvider wrapper
├── app/
│   ├── (auth)/                 # Auth pages (login, signup)
│   └── dashboard/              # Protected dashboard
└── scripts/
    └── create-admin.ts         # Admin user creation
```

## Next Steps

- [ ] Implement password reset functionality
- [ ] Add email verification
- [ ] Implement 2FA (optional)
- [ ] Add user profile management
- [ ] Implement role-based access control (RBAC)
