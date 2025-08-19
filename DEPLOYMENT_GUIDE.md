# Vercel Deployment Guide

## Files Configured for Vercel

✅ **vercel.json** - Routes configured for static and serverless function
✅ **.vercelignore** - Deployment exclusions
✅ **.env.production** - Environment variable template
✅ **package.json** - Scripts updated for Vercel
✅ **src/index.js** - Export default app for serverless

## Deployment Steps

1. **Upload to GitHub** (or connect existing repo)
2. **Import project to Vercel**
3. **Set Environment Variables** in Vercel Dashboard:
   - `MONGODB_URI=your_mongodb_connection_string`
   - `SESSION_SECRET=your_secure_session_secret`
   - `ADMIN_PASSWORD=your_admin_password`

4. **Deploy!**

## Key Configuration Details

### vercel.json
- Routes `/public/*` to static files
- Routes all other requests to serverless function
- Builds with `npm run vercel-build`

### Static Assets
- CSS, JS, images served from `/public/*`
- Configured with `express.static` middleware

### Environment Variables Required
- **MONGODB_URI**: MongoDB Atlas connection string
- **SESSION_SECRET**: Random string for session encryption
- **ADMIN_PASSWORD**: Password for admin panel access

### URLs After Deployment
- Main site: `https://your-vercel-domain.vercel.app/`
- Admin panel: `https://your-vercel-domain.vercel.app/admin`
- Platform: `https://your-vercel-domain.vercel.app/platform`
- Scoreboard: `https://your-vercel-domain.vercel.app/scoreboard`

## Features Ready
- ✅ Team authentication
- ✅ Timer countdown
- ✅ Code submission (4 problems, 5 sections)
- ✅ Admin review panel with pending/waiting status
- ✅ Scoreboard with CSS Grid layout
- ✅ Announcements system
- ✅ Clarifications (public and team-specific)
- ✅ Responsive design
- ✅ EOCS branding and styling

## MongoDB Setup
Make sure to:
1. Create MongoDB Atlas cluster
2. Add your Vercel deployment domain to IP whitelist
3. Create database user with read/write permissions
4. Use the connection string in MONGODB_URI environment variable
