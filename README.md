# EOCS Competition Platform

A comprehensive competitive programming platform designed for the Egyptian Olympiad in Computational Science (EOCS). Built with Express.js and MongoDB, this platform provides a secure, real-time environment for programming competitions with advanced features including live scoring, code submission tracking, clarification systems, and administrative oversight.

## Core Features

### Competition Management
- **Timed Competitions**: Automatic start/end times with countdown timers
- **Multi-section Problems**: Support for complex problems with subsections (A, B, C, D, E)
- **Real-time Scoring**: Live leaderboard with penalty calculations
- **Session Management**: Secure team authentication with session persistence

### Code Submission System  
- **Multi-language Support**: Python (.py) and C++ (.cpp, .cc, .cxx) submissions
- **Code Review Interface**: Administrative review system for submitted solutions
- **Submission Tracking**: Complete history with timestamps and review status
- **File Management**: Secure handling of source code uploads

### Communication Tools
- **Clarification System**: Teams can request clarifications during competition
- **Admin Announcements**: Broadcast messages to all participating teams
- **Real-time Updates**: Live notifications for important competition events

### Administrative Dashboard
- **Score Management**: Manual scoring adjustments and problem status updates
- **Team Oversight**: Monitor team activity, submissions, and login history
- **Submission Review**: Code viewing and evaluation interface
- **Competition Analytics**: Comprehensive statistics and reporting

## Technical Architecture

### Environment Configuration

Create a `.env` file with the following required variables:

```env
# Server Configuration
PORT=3000
SESSION_SECRET=your-cryptographically-secure-session-key

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eocs-platform

# Competition Timing
COMPETITION_START_TIME=2025-08-21T09:00:00.000Z
COMPETITION_END_TIME=2025-08-21T13:00:00.000Z

# Administrative Access
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure-admin-password

# Optional: External Integration
GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse
```

For production deployment with MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eocs-platform
```

## Installation & Deployment

### Prerequisites
- Node.js 18.0.0 or higher
- MongoDB 5.0+ (local) or MongoDB Atlas (cloud)
- npm or yarn package manager

### Development Setup

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd simple-form
npm install
```

2. **Database initialization**:
```bash
npm run seed
```

3. **Development server**:
```bash
npm run dev
```

### Production Deployment

```bash
npm run build
npm start
```

The application is optimized for deployment on Vercel with serverless functions support.

## Database Schema

### Team Model
```javascript
{
  teamId: String,           // Unique identifier (e.g., "TEAM001")
  password: String,         // Bcrypt hashed password
  teamName: String,         // Display name
  members: [{
    name: String,
    email: String,
    grade: String
  }],
  school: String,
  loginTime: Date,
  isActive: Boolean,
  createdAt: Date
}
```

### Score Model
```javascript
{
  teamId: String,
  problems: {
    1: { sections: {A,B,C,D,E}, trials: Number, penalty: Number },
    2: { sections: {A,B,C,D,E}, trials: Number, penalty: Number },
    3: { sections: {A,B,C,D,E}, trials: Number, penalty: Number },
    4: { sections: {A,B,C,D,E}, trials: Number, penalty: Number }
  },
  totalScore: Number,
  totalPenalty: Number,
  totalTrials: Number,
  lastUpdated: Date
}
```

### Submission Model
```javascript
{
  teamId: String,
  problemId: Number,
  section: String,
  language: String,
  code: String,
  originalFilename: String,
  submittedAt: Date,
  reviewStatus: String,     // 'pending', 'correct', 'incorrect'
  reviewedAt: Date,
  reviewedBy: String,
  feedback: String
}
```

### Additional Models
- **Announcement**: Competition-wide notifications
- **ClarificationRequest**: Team questions and admin responses  
- **Problem**: Problem definitions and metadata

## API Endpoints

### Authentication Routes
- `GET /` - Landing page
- `GET /login` - Team login interface
- `POST /login` - Team authentication
- `GET /logout` - Session termination

### Competition Routes
- `GET /platform` - Main competition dashboard
- `GET /problem/:id` - Problem overview
- `GET /problem/:id/:section` - Specific problem section
- `POST /submit/:problemId/:section` - Code submission
- `GET /scoreboard` - Public leaderboard

### Administrative Routes
- `GET /admin/login` - Admin authentication
- `GET /admin` - Administrative dashboard
- `POST /admin/update-score` - Manual score adjustments
- `POST /admin/review-submission` - Submission evaluation

### Communication Routes
- `POST /clarification` - Submit clarification request
- `POST /admin/announcement` - Create announcements
- `POST /admin/clarification/answer` - Respond to clarifications

## Competition Mechanics

### Scoring System
- **Points**: 1 point per correctly solved problem section
- **Penalties**: 10 minutes per incorrect submission attempt
- **Ranking**: Primary by total score (descending), secondary by total penalty (ascending)

### Competition Phases
1. **Pre-competition**: Teams can log in and view countdown
2. **Active Phase**: Full platform access, submissions accepted
3. **Post-competition**: Read-only access, final standings displayed

### Problem Structure
Each competition problem contains multiple sections (typically A through E), allowing for granular scoring and progressive difficulty.

## Security Features

- **Password Hashing**: Bcrypt with salt rounds for team authentication
- **Session Security**: MongoDB-backed sessions with secure cookies
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Security Headers**: Helmet.js for HTTP security headers
- **File Upload Safety**: Restricted file types and secure storage handling
- **Admin Protection**: Role-based access control for administrative functions

## Monitoring & Analytics

The platform includes comprehensive logging and monitoring capabilities:
- Team activity tracking
- Submission analytics
- Competition progress monitoring
- Error logging and reporting
- Performance metrics collection

## Architecture Details

### File Structure
```
src/
├── index.js                    # Main application server
├── config/
│   ├── database.js            # MongoDB connection management
│   └── inMemoryStorage.js     # Fallback storage for development
├── models/
│   ├── Team.js               # Team authentication and data
│   ├── Score.js              # Competition scoring logic
│   ├── Submission.js         # Code submission handling
│   ├── Announcement.js       # Competition announcements
│   ├── ClarificationRequest.js # Q&A system
│   └── Problem.js            # Problem definitions
└── scripts/
    └── seedCompetition.js    # Database initialization
```

### Technology Stack
- **Backend**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Express-session with bcryptjs
- **Templating**: EJS for server-side rendering
- **Security**: Helmet.js, CORS, secure session handling
- **File Processing**: Multer for multipart form handling
- **Deployment**: Vercel-ready with serverless function support

## Development Notes

- **ES Modules**: Uses modern JavaScript module syntax
- **Environment Flexibility**: Automatic fallback to in-memory storage for development
- **Code Quality**: Clean, maintainable architecture with separation of concerns
- **Error Handling**: Comprehensive error management and user feedback
- **Performance**: Optimized database queries with proper indexing
