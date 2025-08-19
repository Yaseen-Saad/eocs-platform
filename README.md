# EOCS Problems Platform

A simple competition platform for the Egyptian Olympiad in Computational Science (EOCS) that provides a timer-based problems portal with file submission capabilities.

## Features

- **Timer-based Competition**: Shows countdown to competition start and end times
- **Team Authentication**: Simple login with team ID and password
- **Problems Interface**: 4 problems with multiple sections (A, B, C, D, E)
- **File Submissions**: Teams can submit Python (.py) or C++ (.cpp, .cc, .cxx) files
- **Live Scoreboard**: Public scoreboard with real-time updates
- **Admin Panel**: Admin interface to manage scores and view submissions
- **Responsive Design**: Works on desktop and mobile devices

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/eocs-platform
COMPETITION_START_TIME=2025-08-20T09:00:00.000Z
COMPETITION_END_TIME=2025-08-20T13:00:00.000Z
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse
SESSION_SECRET=your-super-secret-key-here
```

For production with MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eocs-platform
```

## Installation & Setup

1. **Install MongoDB locally** (or use MongoDB Atlas for cloud):
   - Download from: https://www.mongodb.com/try/download/community
   - Start MongoDB service

2. **Install dependencies**:
```bash
npm install
```

3. **Seed the database with sample teams**:
```bash
npm run seed
```

4. **Start the development server**:
```bash
npm run dev
```

5. **Or start the production server**:
```bash
npm start
```

## Database Schema

### Teams Collection
- `teamId`: Unique team identifier (e.g., "TEAM001")
- `password`: Hashed password using bcrypt
- `teamName`: Display name for the team
- `members`: Array of team members with name, email, grade
- `school`: School/institution name
- `loginTime`: Last login timestamp
- `isActive`: Boolean flag for active teams

### Scores Collection
- `teamId`: Reference to team
- `problems`: Object with problem status, trials, penalties
- `totalScore`: Calculated total score
- `totalPenalty`: Total penalty in minutes
- `totalTrials`: Total submission attempts

### Submissions Collection
- `teamId`: Reference to team
- `problemId`: Problem number (1-4)
- `section`: Problem section (A-E)
- `filename`: Original filename
- `filePath`: Server file path
- `language`: Programming language (python/cpp)
- `submittedAt`: Submission timestamp

## Sample Team Credentials

After running `npm run seed`, you can login with:

- **Team ID**: TEAM001, **Password**: password123
- **Team ID**: TEAM002, **Password**: password123
- **Team ID**: TEAM003, **Password**: password123
- **Team ID**: TEAM004, **Password**: password123
- **Team ID**: TEAM005, **Password**: password123

## Competition Flow

1. **Before Start**: Teams can login but only see countdown timer
2. **During Competition**: Teams can access problems and submit solutions
3. **After End**: Platform shows final results and scoreboard

## Problem Structure

Each problem has 5 sections (A, B, C, D, E) where teams can submit:
- Python files (.py)
- C++ files (.cpp, .cc, .cxx)

## Scoring

- Each correct problem gives 1 point
- Wrong submissions add 10 minutes penalty per trial
- Teams are ranked by: Score (descending), then Penalty (ascending)

## Deployment

This platform is designed to work with Vercel's serverless functions:

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

## Usage

### For Teams
1. Go to the platform URL
2. Login with your team ID and password (see sample credentials above)
3. Wait for the competition timer to reach zero
4. When active, view problems and submit solutions
5. Check the public scoreboard to see rankings

### For Admins
1. Go to `/admin/login`
2. Login with admin credentials (admin/admin123)
3. Manage team scores by marking problems as correct/wrong
4. View recent submissions and team statistics

## File Structure

```
simple-form/
├── src/
│   ├── index.js              # Main Express server
│   ├── config/
│   │   └── database.js       # MongoDB connection
│   ├── models/
│   │   ├── Team.js          # Team model with authentication
│   │   ├── Score.js         # Score tracking model
│   │   └── Submission.js    # File submission model
│   └── scripts/
│       └── seedTeams.js     # Database seeding script
├── views/                   # EJS templates
├── public/                  # Static assets
├── uploads/                 # File upload storage
└── package.json
```

## Design

The platform uses the same Egyptian-themed design as the main EOCS website with:
- Egyptian gold (#ad8231) and dark (#3f3938) color scheme
- Orbitron font for headings
- Consistent styling with the main EOCS brand

## Notes

- **Authentication**: Uses bcrypt for password hashing and express-session for session management
- **Database**: MongoDB with Mongoose ODM for data modeling
- **File Storage**: Local uploads directory (in production, consider cloud storage)
- **Sessions**: Stored in MongoDB using connect-mongo
- **Security**: Helmet for security headers, input validation, and secure session handling
- **Scalability**: Designed to work with MongoDB Atlas for production deployment
