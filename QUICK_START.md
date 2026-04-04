# Quick Start Guide - Authentication System

## 🚀 Get Started in 3 Steps

### Step 1: Verify Environment
Check that your `.env` file has these variables:
```env
DATABASE_URL="postgresql://postgres:1234@localhost:5432/subscription_db?schema=public"
NEXTAUTH_SECRET="dev-secret-change-me-in-production-at-least-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### Step 2: Create Admin User (Already Done! ✅)
The admin user has been created with:
- **Email:** `admin@subsms.local`
- **Password:** `Admin@1234!`
- **Role:** `admin`

### Step 3: Start Development Server
```bash
pnpm dev
```

## 🧪 Test the Authentication

### Test 1: Protected Route Redirect
1. Open browser to `http://localhost:3000/dashboard`
2. ✅ Should redirect to `/login`
3. ✅ URL should include `?callbackUrl=/dashboard`

### Test 2: Login
1. On login page, click "Autofill" button
2. Click "Sign in"
3. ✅ Should redirect to `/dashboard`
4. ✅ Header should show "Admin User" and "Sign out" button

### Test 3: Session Persistence
1. Refresh the page
2. ✅ Should stay logged in
3. ✅ Header still shows user info

### Test 4: Logout
1. Click "Sign out" in header
2. ✅ Should redirect to home page
3. ✅ Header should show "Log in" and "Sign up" buttons

### Test 5: Auth Page Redirect
1. While logged in, try to visit `/login`
2. ✅ Should redirect to `/dashboard`

## 📋 What's Working

✅ Login with email/password
✅ Login with Google OAuth
✅ Automatic redirect to login for protected pages
✅ Automatic redirect to dashboard after login
✅ Session persistence (30 days)
✅ Secure cookies (HttpOnly, SameSite)
✅ User info in header
✅ Sign out functionality
✅ Protected routes:
  - `/dashboard`
  - `/admin/*`
  - `/profile`
  - `/subscriptions`
  - `/invoices`
  - `/cart`
  - `/checkout`

## 🔧 Troubleshooting

### "Invalid email or password"
- Verify admin user was created: `pnpm db:create-admin`
- Check database connection
- Verify credentials: `admin@subsms.local` / `Admin@1234!`

### Session not persisting
- Check browser cookies are enabled
- Verify `NEXTAUTH_SECRET` is set in `.env`
- Check browser console for errors

### Redirect loop
- Clear browser cookies
- Restart dev server
- Check middleware.ts exists

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check Google Console authorized redirect URIs
- Add `http://localhost:3000/api/auth/callback/google`

## 📚 Documentation

- **Complete Setup:** See `AUTH_SETUP.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **NextAuth Docs:** https://authjs.dev

## 🎯 Next Actions

Want to customize? Here's what you can do:

1. **Add more users:** Create a signup flow or use admin panel
2. **Customize protected routes:** Edit `middleware.ts`
3. **Change session duration:** Edit `session.maxAge` in `lib/auth.ts`
4. **Add role-based access:** Use `session.user.role` in components
5. **Implement password reset:** Add reset flow in auth pages

## 💡 Pro Tips

- Use the "Autofill" button on login page for quick testing
- Check Network tab in DevTools to see session cookies
- Use `pnpm db:studio` to view users in database
- Session data available via `useSession()` hook in client components
- Session data available via `auth()` function in server components

## ⚠️ Important for Production

Before going live:
1. Install bcryptjs: `pnpm add bcryptjs @types/bcryptjs`
2. Update password hashing in `lib/auth.ts`
3. Generate new `NEXTAUTH_SECRET`: `openssl rand -base64 32`
4. Set production `NEXTAUTH_URL`
5. Enable HTTPS
6. Configure production OAuth credentials

---

**Need Help?** Check the detailed guides in `AUTH_SETUP.md` and `IMPLEMENTATION_SUMMARY.md`
