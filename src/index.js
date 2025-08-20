import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Database and Models
import { connectDB, isConnected } from './config/database.js';
import InMemoryStorage from './config/inMemoryStorage.js';
import Team from './models/Team.js';
import Score from './models/Score.js';
import Submission from './models/Submission.js';
import Announcement from './models/Announcement.js';
import ClarificationRequest from './models/ClarificationRequest.js';
import Problem from './models/Problem.js';

// Load environment variables
dotenv.config();

// Initialize storage
let storage = null;

// Connect to MongoDB or fallback to in-memory storage
const initializeStorage = async () => {
    await connectDB();
    
    if (!isConnected) {
        storage = new InMemoryStorage();
        await storage.initializeSampleData();
        console.log('📝 Running in in-memory mode. Data will be lost on restart.');
        console.log('📖 See MONGODB_SETUP.md for MongoDB installation instructions.');
    } else {
        console.log('📝 Running with MongoDB persistence.');
    }
};

await initializeStorage();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Static files
app.use('/public', express.static(path.join(__dirname, '..', 'public')));

// Configure multer for file uploads (Vercel-compatible)
const upload = multer({
    storage: multer.memoryStorage(), // Use memory storage for Vercel
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow only Python and C++ files
        if (file.mimetype === 'text/x-python' || 
            file.mimetype === 'text/x-c++src' || 
            file.originalname.endsWith('.py') || 
            file.originalname.endsWith('.cpp') || 
            file.originalname.endsWith('.cc') || 
            file.originalname.endsWith('.cxx')) {
            cb(null, true);
        } else {
            cb(new Error('Only Python (.py) and C++ (.cpp, .cc, .cxx) files are allowed!'));
        }
    }
});

// Middleware to check if team is authenticated
const requireAuth = async (req, res, next) => {
    try {
        const teamId = req.session.teamId;
        if (!teamId) {
            // Check if this is an AJAX request
            if (req.headers['content-type'] === 'application/json' || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({ success: false, message: 'Authentication required. Please log in again.' });
            }
            return res.redirect('/login');
        }

        let team;
        if (isConnected) {
            team = await Team.findOne({ teamId, isActive: true });
        } else {
            team = await storage.findTeam(teamId);
        }

        if (!team || !team.isActive) {
            req.session.destroy();
            // Check if this is an AJAX request
            if (req.headers['content-type'] === 'application/json' || req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(401).json({ success: false, message: 'Team not found or inactive. Please log in again.' });
            }
            return res.redirect('/login');
        }

        req.teamId = teamId;
        req.team = team;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        // Check if this is an AJAX request
        if (req.headers['content-type'] === 'application/json' || req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ success: false, message: 'Authentication error. Please try again.' });
        }
        res.redirect('/login');
    }
};

// Middleware to check if admin is authenticated
const requireAdmin = (req, res, next) => {
    const isAdmin = req.session.isAdmin;
    if (!isAdmin) {
        return res.redirect('/admin/login');
    }
    next();
};

// Helper function to get competition status
const getCompetitionStatus = () => {
    const now = new Date();
    const startTime = new Date(process.env.COMPETITION_START_TIME);
    const endTime = new Date(process.env.COMPETITION_END_TIME);

    if (now < startTime) {
        return { status: 'before', timeUntil: startTime };
    } else if (now >= startTime && now < endTime) {
        return { status: 'active', timeUntil: endTime };
    } else {
        return { status: 'ended', timeUntil: null };
    }
};

// Routes
app.get('/', (req, res) => {
    const teamId = req.session.teamId;
    if (teamId) {
        return res.redirect('/platform');
    }
    res.render('login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { teamId, password } = req.body;
        
        if (!teamId || !password) {
            return res.render('login', { error: 'Please enter team ID and password' });
        }

        let team, score;
        
        if (isConnected) {
            // MongoDB mode
            team = await Team.findOne({ teamId: teamId.toUpperCase(), isActive: true });
            if (!team) {
                return res.render('login', { error: 'Invalid team ID or password' });
            }

            const isValidPassword = await team.comparePassword(password);
            if (!isValidPassword) {
                return res.render('login', { error: 'Invalid team ID or password' });
            }

            await team.updateLoginTime();

            score = await Score.findOne({ teamId: team.teamId });
            if (!score) {
                score = new Score({
                    teamId: team.teamId,
                    problems: {
                        1: { 
                            sections: {
                                A: { status: 'unsolved', trials: 0 },
                                B: { status: 'unsolved', trials: 0 },
                                C: { status: 'unsolved', trials: 0 },
                                D: { status: 'unsolved', trials: 0 },
                                E: { status: 'unsolved', trials: 0 }
                            },
                            status: 'unsolved', trials: 0, penalty: 0 
                        },
                        2: { 
                            sections: {
                                A: { status: 'unsolved', trials: 0 },
                                B: { status: 'unsolved', trials: 0 },
                                C: { status: 'unsolved', trials: 0 },
                                D: { status: 'unsolved', trials: 0 },
                                E: { status: 'unsolved', trials: 0 }
                            },
                            status: 'unsolved', trials: 0, penalty: 0 
                        },
                        3: { 
                            sections: {
                                A: { status: 'unsolved', trials: 0 },
                                B: { status: 'unsolved', trials: 0 },
                                C: { status: 'unsolved', trials: 0 },
                                D: { status: 'unsolved', trials: 0 },
                                E: { status: 'unsolved', trials: 0 }
                            },
                            status: 'unsolved', trials: 0, penalty: 0 
                        },
                        4: { 
                            sections: {
                                A: { status: 'unsolved', trials: 0 },
                                B: { status: 'unsolved', trials: 0 },
                                C: { status: 'unsolved', trials: 0 },
                                D: { status: 'unsolved', trials: 0 },
                                E: { status: 'unsolved', trials: 0 }
                            },
                            status: 'unsolved', trials: 0, penalty: 0 
                        }
                    }
                });
                await score.save();
            }
        } else {
            // In-memory mode
            team = await storage.findTeam(teamId.toUpperCase());
            if (!team) {
                return res.render('login', { error: 'Invalid team ID or password' });
            }

            const isValidPassword = await team.comparePassword(password);
            if (!isValidPassword) {
                return res.render('login', { error: 'Invalid team ID or password' });
            }

            await team.updateLoginTime();

            score = await storage.findScore(team.teamId);
            if (!score) {
                await storage.createScore({
                    teamId: team.teamId,
                    problems: {
                        1: { status: 'unsolved', trials: 0, penalty: 0 },
                        2: { status: 'unsolved', trials: 0, penalty: 0 },
                        3: { status: 'unsolved', trials: 0, penalty: 0 },
                        4: { status: 'unsolved', trials: 0, penalty: 0 }
                    },
                    totalScore: 0,
                    totalPenalty: 0,
                    totalTrials: 0
                });
            }
        }

        // Set session
        req.session.teamId = team.teamId;
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return res.render('login', { error: 'Login failed. Please try again.' });
            }
            res.redirect('/platform');
        });

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'An error occurred. Please try again.' });
    }
});

app.get('/platform', requireAuth, async (req, res) => {
    try {
        const competitionStatus = getCompetitionStatus();
        let teamData, announcements = [], clarifications = [], problems = [];

        if (isConnected) {
            teamData = await Score.findOne({ teamId: req.teamId });
            // Get public announcements
            announcements = await Announcement.find({ 
                isPublic: true 
            }).sort({ createdAt: -1 }).limit(10);
            
            // Get clarifications: team's own clarifications (answered) + public clarifications from other teams
            clarifications = await ClarificationRequest.find({
                $and: [
                    { status: 'answered' },
                    {
                        $or: [
                            { teamId: req.teamId }, // Team's own clarifications (answered)
                            { isPublic: true }      // Public clarifications from other teams
                        ]
                    }
                ]
            }).sort({ answeredAt: -1 }).limit(20);

            // Get all problems sorted by section and number
            const rawProblems = await Problem.getAllSorted();
            // Convert Map sections to arrays for EJS compatibility
            problems = rawProblems.map(problem => ({
                ...problem.toObject(),
                sections: Array.from(problem.sections.entries()).map(([key, value]) => ({
                    name: key,
                    title: value.title,
                    description: value.description,
                    maxPoints: value.maxPoints
                }))
            }));
        } else {
            teamData = await storage.findScore(req.teamId);
        }
        
        res.render('platform', {
            teamId: req.teamId,
            user: { teamId: req.teamId }, // Add user object for EJS compatibility
            competitionStatus,
            teamData,
            announcements,
            clarifications,
            problems,
            startTime: process.env.COMPETITION_START_TIME,
            endTime: process.env.COMPETITION_END_TIME
        });
    } catch (error) {
        console.error('Platform error:', error);
        res.redirect('/login');
    }
});

// Main problem route - shows all subtasks for a problem
app.get('/problem/:id', requireAuth, async (req, res) => {
    const problemId = parseInt(req.params.id);
    const competitionStatus = getCompetitionStatus();
    
    console.log('Problem route accessed:', { problemId, competitionStatus: competitionStatus.status, teamId: req.teamId });
    
    if (competitionStatus.status !== 'active') {
        console.log('Competition not active, redirecting to platform');
        return res.redirect('/platform');
    }
    
    if (problemId < 1 || problemId > 19) { // Support all 19 problems
        console.log('Invalid problem ID, redirecting to platform');
        return res.redirect('/platform');
    }
    
    try {
        let problemData = null;
        
        if (isConnected) {
            // Find the problem by ID
            const rawProblem = await Problem.findOne({ id: problemId });
            if (rawProblem) {
                // Convert the Map to an array for easier template processing
                const sectionsArray = [];
                if (rawProblem.sections) {
                    for (let [key, value] of rawProblem.sections) {
                        sectionsArray.push({
                            name: key,
                            title: value.title,
                            description: value.description,
                            maxPoints: value.maxPoints
                        });
                    }
                }
                
                problemData = {
                    id: rawProblem.id,
                    section: rawProblem.section,
                    number: rawProblem.number,
                    title: rawProblem.title,
                    description: rawProblem.description,
                    maxPoints: rawProblem.maxPoints,
                    sections: sectionsArray
                };
            }
        }
        
        res.render('problem', {
            problemId: problemId,
            problemData: problemData,
            teamId: req.session.teamId,
            competitionStatus: competitionStatus
        });
    } catch (error) {
        console.error('Problem route error:', error);
        res.redirect('/platform');
    }
});

// Legacy route for backward compatibility - redirect to main problem page
app.get('/problem/:id/:section', requireAuth, (req, res) => {
    const problemId = parseInt(req.params.id);
    res.redirect(`/problem/${problemId}`);
});

// Get submission status for all sections of a problem
app.get('/submission-status/:problemId', requireAuth, async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        
        if (!isConnected) {
            return res.json({ success: false, statuses: {}, message: 'Database not connected' });
        }

        const statuses = {};
        
        // Get the problem to know its sections
        const problem = await Problem.findOne({ id: problemId });
        if (problem && problem.sections) {
            for (let [sectionName] of problem.sections) {
                // Find the latest submission for this section
                const latestSubmission = await Submission.findOne({
                    teamId: req.teamId,
                    problemId: problemId,
                    section: sectionName
                }).sort({ submittedAt: -1 });

                if (!latestSubmission) {
                    statuses[sectionName] = { status: 'none' };
                    continue;
                }

                if (latestSubmission.status === 'correct') {
                    statuses[sectionName] = {
                        status: 'correct',
                        score: latestSubmission.score,
                        submittedAt: latestSubmission.submittedAt
                    };
                } else if (latestSubmission.status === 'pending') {
                    statuses[sectionName] = {
                        status: 'pending',
                        submittedAt: latestSubmission.submittedAt
                    };
                } else if (latestSubmission.status === 'wrong') {
                    // Get penalty count for wrong submissions
                    const wrongSubmissions = await Submission.countDocuments({
                        teamId: req.teamId,
                        problemId: problemId,
                        section: sectionName,
                        status: 'wrong'
                    });
                    
                    statuses[sectionName] = {
                        status: 'can_submit', // Allow resubmission after wrong answer
                        penalties: wrongSubmissions,
                        message: `${wrongSubmissions} wrong attempt(s)`,
                        submittedAt: latestSubmission.submittedAt
                    };
                } else {
                    // Get penalty count for wrong submissions
                    const wrongSubmissions = await Submission.countDocuments({
                        teamId: req.teamId,
                        problemId: problemId,
                        section: sectionName,
                        status: 'wrong'
                    });
                    
                    statuses[sectionName] = {
                        status: 'can_submit',
                        penalties: wrongSubmissions
                    };
                }
            }
        }
        
        res.json({ success: true, statuses });
    } catch (error) {
        console.error('Error checking submission statuses:', error);
        res.json({ success: false, statuses: {}, message: 'Error checking submission status' });
    }
});

// Get submission status for a specific problem section
app.get('/submission-status/:problemId/:section', requireAuth, async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        const section = req.params.section;
        
        if (!isConnected) {
            return res.json({ status: 'none', message: 'Database not connected' });
        }

        // Find the latest submission for this team, problem, and section
        const latestSubmission = await Submission.findOne({
            teamId: req.teamId,
            problemId: problemId,
            section: section
        }).sort({ submittedAt: -1 });

        if (!latestSubmission) {
            return res.json({ status: 'none' });
        }

        // If the submission is correct, prevent further submissions
        if (latestSubmission.status === 'correct') {
            return res.json({
                status: 'correct',
                score: latestSubmission.score,
                submittedAt: latestSubmission.submittedAt,
                message: 'This section has already been solved correctly'
            });
        }

        // If there's a pending submission, prevent new submissions
        if (latestSubmission.status === 'pending') {
            return res.json({
                status: 'pending',
                submittedAt: latestSubmission.submittedAt,
                message: 'Previous submission is under review'
            });
        }

        // Get penalty count for wrong submissions
        const wrongSubmissions = await Submission.countDocuments({
            teamId: req.teamId,
            problemId: problemId,
            section: section,
            status: 'wrong'
        });

        // Return appropriate status based on latest submission
        if (latestSubmission.status === 'wrong') {
            return res.json({
                status: 'can_submit', // Allow resubmission after wrong answer
                penalties: wrongSubmissions,
                message: `Previous submission was incorrect. You have ${wrongSubmissions} wrong attempt(s).`,
                submittedAt: latestSubmission.submittedAt
            });
        }

        return res.json({
            status: latestSubmission.status,
            penalties: wrongSubmissions,
            submittedAt: latestSubmission.submittedAt
        });

    } catch (error) {
        console.error('Error checking submission status:', error);
        res.json({ status: 'error', message: 'Error checking submission status' });
    }
});

app.post('/submit/:problemId/:section', requireAuth, upload.none(), async (req, res) => {
    try {
        const problemId = parseInt(req.params.problemId);
        const section = req.params.section;
        const competitionStatus = getCompetitionStatus();
        
        if (competitionStatus.status !== 'active') {
            return res.json({ success: false, message: 'Competition is not active' });
        }

        // Check if this section is already solved correctly
        if (isConnected) {
            const existingCorrectSubmission = await Submission.findOne({
                teamId: req.teamId,
                problemId: problemId,
                section: section,
                status: 'correct'
            });

            if (existingCorrectSubmission) {
                return res.json({ 
                    success: false, 
                    message: 'This section has already been solved correctly. You cannot submit again.' 
                });
            }

            // Check for pending submissions
            const pendingSubmission = await Submission.findOne({
                teamId: req.teamId,
                problemId: problemId,
                section: section,
                status: 'pending'
            });

            if (pendingSubmission) {
                return res.json({ 
                    success: false, 
                    message: 'You have a pending submission under review. Please wait for the review to complete.' 
                });
            }
        }
        
        console.log('Server submission debug:', {
            body: req.body,
            language: req.body.language,
            code: req.body.code ? `${req.body.code.length} chars` : 'missing',
            bodyKeys: Object.keys(req.body)
        });
        
        const { language, code } = req.body;
        
        if (!language || !code) {
            console.log('Validation failed:', { language: !!language, code: !!code });
            return res.json({ success: false, message: 'Language and code are required' });
        }

        if (!['py', 'cpp'].includes(language)) {
            return res.json({ success: false, message: 'Invalid language. Only Python (.py) and C++ (.cpp) are supported.' });
        }

        const codeLength = code.length;
        if (codeLength < 10) {
            return res.json({ success: false, message: 'Code too short' });
        }

        // Create submission record
        const submissionData = {
            teamId: req.teamId,
            problemId,
            section,
            language,
            code,
            codeLength,
            reviewStatus: 'under_review',  // Mark as under review
            submittedAt: new Date()
        };

        if (isConnected) {
            const submission = new Submission(submissionData);
            await submission.save();

            // Update team trials for specific section
            const score = await Score.findOne({ teamId: req.teamId });
            if (score) {
                await score.incrementSectionTrials(String(problemId), String(section));
                await score.save();
            }
        } else {
            await storage.createSubmission(submissionData);

            // Update team trials
            const score = await storage.findScore(req.teamId);
            if (score) {
                await score.incrementTrials(problemId);
            }
        }

        console.log(`Code submission received: Team ${req.teamId}, Problem ${problemId}, Section ${section}, Language: ${language}, Code length: ${code.length} chars`);
        
        res.json({ success: true, message: 'Solution submitted successfully!' });

    } catch (error) {
        console.error('Submission error:', error);
        res.json({ success: false, message: 'Error submitting solution' });
    }
});

// Clarification request route
app.post('/clarification', requireAuth, async (req, res) => {
    console.log('=== CLARIFICATION REQUEST ===');
    console.log('Request body:', req.body);
    console.log('Team ID:', req.teamId);
    
    try {
        const { problemId, question } = req.body;
        
        if (!problemId || !question || !question.trim()) {
            console.log('❌ Missing required fields:', { problemId, question: !!question });
            return res.json({ success: false, message: 'Please provide a problem ID and question' });
        }

        const clarificationData = {
            teamId: req.teamId,
            problemId: parseInt(problemId),
            question: question.trim()
        };
        
        console.log('📝 Clarification data:', clarificationData);

        if (isConnected) {
            const clarification = new ClarificationRequest(clarificationData);
            await clarification.save();
            console.log('✅ Clarification saved to database');
        } else {
            // For in-memory storage, we could add this to the storage class
            console.log('📝 Clarification request (in-memory):', clarificationData);
        }

        console.log('✅ Clarification request processed successfully');
        res.json({ success: true, message: 'Clarification request submitted successfully!' });
    } catch (error) {
        console.error('❌ Clarification submission error:', error);
        res.json({ success: false, message: 'Error submitting clarification request: ' + error.message });
    }
});

app.get('/scoreboard', async (req, res) => {
    console.log('=== SCOREBOARD ROUTE CALLED ===');
    
    try {
        // Get all teams with their scores
        const teams = await Team.find({}).select('teamId teamName');
        console.log('Found teams:', teams.length);
        
        // Get all scores
        const scores = await Score.find({});
        console.log('Found scores:', scores.length);
        
        // Get actual problems from database and organize by section
        const allProblems = await Problem.find({}).sort({ section: 1, number: 1 });
        console.log('Found problems in database:', allProblems.length);
        
        // Group problems by section for display
        const problemsBySection = {};
        allProblems.forEach(problem => {
            if (!problemsBySection[problem.section]) {
                problemsBySection[problem.section] = [];
            }
            problemsBySection[problem.section].push({
                id: problem.id,
                title: problem.title,
                sections: problem.sections || new Map()
            });
        });
        
        console.log('Problems organized by section:', Object.keys(problemsBySection));
        
        // Create detailed scoreboard data
        const scoreboard = [];
        
        for (const team of teams) {
            const teamScore = scores.find(s => s.teamId === team.teamId);
            
            let totalScore = 0;
            let totalPenalty = 0;
            const problemScores = {};
            
            if (teamScore && teamScore.problems) {
                // Use the actual problems from the score data
                for (const [problemId, problemData] of teamScore.problems) {
                    problemScores[problemId] = {
                        totalScore: problemData.totalScore || 0,
                        totalPenalty: 0,
                        status: problemData.status || 'unsolved',
                        sections: new Map()
                    };
                    
                    // Add sections
                    if (problemData.sections) {
                        for (const [sectionId, sectionData] of problemData.sections) {
                            console.log(`Problem ${problemId}, Section ${sectionId}: status=${sectionData.status}, score=${sectionData.score}`);
                            problemScores[problemId].sections.set(sectionId, {
                                status: sectionData.status || 'unsolved',
                                trials: sectionData.trials || 0,
                                score: sectionData.score || 0,
                                penalty: sectionData.penalty || 0
                            });
                            problemScores[problemId].totalPenalty += sectionData.penalty || 0;
                        }
                    }
                    
                    totalScore += problemData.totalScore || 0;
                    totalPenalty += problemScores[problemId].totalPenalty;
                }
            }
            
            scoreboard.push({
                teamId: team.teamId,
                teamName: team.teamName || team.teamId,
                totalScore,
                totalPenalty,
                problems: problemScores
            });
        }
        
        // Sort by score (descending), then by penalty (ascending)
        scoreboard.sort((a, b) => {
            if (b.totalScore !== a.totalScore) {
                return b.totalScore - a.totalScore;
            }
            return a.totalPenalty - b.totalPenalty;
        });
        
        console.log('Final detailed scoreboard with', scoreboard.length, 'teams');
        
        res.render('scoreboard', { 
            scoreboard, 
            problems: allProblems,
            problemsBySection: problemsBySection
        });
        
    } catch (error) {
        console.error('Scoreboard error:', error);
        res.render('scoreboard', { scoreboard: [], problems: [], problemsBySection: {} });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Admin routes
app.get('/admin/login', (req, res) => {
    res.render('admin-login');
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        req.session.save((err) => {
            if (err) {
                console.error('Admin session save error:', err);
                return res.render('admin-login', { error: 'Login failed. Please try again.' });
            }
            res.redirect('/admin');
        });
    } else {
        res.render('admin-login', { error: 'Invalid credentials' });
    }
});

app.get('/admin', requireAdmin, async (req, res) => {
    try {
        let scoreboardArray = [];
        let submissionsArray = [];
        let announcementsArray = [];
        let clarificationsArray = [];

        if (isConnected) {
            const scores = await Score.find().sort({ totalScore: -1, totalPenalty: 1 });
            const submissions = await Submission.find().sort({ submittedAt: -1 }).limit(50);
            const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(20);
            const clarifications = await ClarificationRequest.find().sort({ submittedAt: -1 }).limit(50);

            scoreboardArray = scores.map(score => ({
                teamId: score.teamId,
                totalScore: score.totalScore,
                penalties: score.totalPenalty,
                trials: score.totalTrials,
                problems: score.problems
            }));

            submissionsArray = submissions.map(sub => ({
                _id: sub._id,
                teamId: sub.teamId,
                problemId: sub.problemId,
                section: sub.section,
                language: sub.language,
                codePreview: sub.code ? sub.code.substring(0, 100) + (sub.code.length > 100 ? '...' : '') : 'No code',
                codeLength: sub.codeLength || 0,
                timestamp: sub.submittedAt,
                reviewStatus: sub.reviewStatus,
                status: sub.status,
                reviewNotes: sub.reviewNotes
            }));

            announcementsArray = announcements;
            clarificationsArray = clarifications;
        } else {
            const scores = await storage.getAllScores();
            const submissions = await storage.getRecentSubmissions(50);

            scoreboardArray = scores.map(score => ({
                teamId: score.teamId,
                totalScore: score.totalScore,
                penalties: score.totalPenalty,
                trials: score.totalTrials,
                problems: score.problems
            }));

            submissionsArray = submissions.map(sub => ({
                teamId: sub.teamId,
                problemId: sub.problemId,
                section: sub.section,
                filename: sub.originalName,
                timestamp: sub.submittedAt
            }));
        }

        res.render('admin', { 
            scoreboard: scoreboardArray, 
            submissions: submissionsArray,
            announcements: announcementsArray,
            clarifications: clarificationsArray
        });
    } catch (error) {
        console.error('Admin panel error:', error);
        res.render('admin', { scoreboard: [], submissions: [], announcements: [], clarifications: [] });
    }
});

app.post('/admin/update-section', requireAdmin, async (req, res) => {
    try {
        const { teamId, problemId, section, status } = req.body;
        
        if (isConnected) {
            const score = await Score.findOne({ teamId });
            if (!score) {
                return res.json({ success: false, message: 'Team not found' });
            }

            await score.updateSection(parseInt(problemId), section, status);
        } else {
            const score = await storage.findScore(teamId);
            if (!score) {
                return res.json({ success: false, message: 'Team not found' });
            }

            await score.updateSection(parseInt(problemId), section, status);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Section update error:', error);
        res.json({ success: false, message: 'Error updating section' });
    }
});

app.post('/admin/update-score', requireAdmin, async (req, res) => {
    try {
        const { teamId, problemId, status } = req.body;
        
        if (isConnected) {
            const score = await Score.findOne({ teamId });
            if (!score) {
                return res.json({ success: false, message: 'Team not found' });
            }

            await score.updateProblem(parseInt(problemId), status);
        } else {
            const score = await storage.findScore(teamId);
            if (!score) {
                return res.json({ success: false, message: 'Team not found' });
            }

            await score.updateProblem(parseInt(problemId), status);
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Score update error:', error);
        res.json({ success: false, message: 'Error updating score' });
    }
});

// Admin announcement routes
app.post('/admin/announcement', requireAdmin, async (req, res) => {
    try {
        const { title, content, type, priority, isPublic } = req.body;
        
        if (!title || !content) {
            return res.json({ success: false, message: 'Title and content are required' });
        }

        if (isConnected) {
            const announcement = new Announcement({
                title: title.trim(),
                content: content.trim(),
                type: type || 'announcement',
                priority: priority || 'medium',
                isPublic: isPublic === 'true'
            });
            await announcement.save();
        }

        res.json({ success: true, message: 'Announcement created successfully' });
    } catch (error) {
        console.error('Announcement creation error:', error);
        res.json({ success: false, message: 'Error creating announcement' });
    }
});

app.post('/admin/clarification/answer', requireAdmin, async (req, res) => {
    try {
        const { clarificationId, answer, isPublic } = req.body;
        
        if (!clarificationId || !answer) {
            return res.json({ success: false, message: 'Clarification ID and answer are required' });
        }

        if (isConnected) {
            const clarification = await ClarificationRequest.findById(clarificationId);
            if (!clarification) {
                return res.json({ success: false, message: 'Clarification not found' });
            }

            clarification.answer = answer.trim();
            clarification.status = 'answered';
            clarification.isPublic = isPublic === 'true';
            clarification.answeredAt = new Date();
            
            await clarification.save();
        }

        res.json({ success: true, message: 'Clarification answered successfully' });
    } catch (error) {
        console.error('Clarification answer error:', error);
        res.json({ success: false, message: 'Error answering clarification' });
    }
});

// Admin submission review routes
app.post('/admin/review-submission', requireAdmin, async (req, res) => {
    try {
        const { submissionId, decision, notes } = req.body;
        
        if (!submissionId || !decision) {
            return res.json({ success: false, message: 'Submission ID and decision are required' });
        }

        if (isConnected) {
            const submission = await Submission.findById(submissionId);
            if (!submission) {
                return res.json({ success: false, message: 'Submission not found' });
            }

            // Update submission status
            submission.status = decision; // 'correct' or 'wrong'
            submission.reviewStatus = 'reviewed';
            submission.reviewedAt = new Date();
            submission.reviewedBy = 'admin';
            submission.reviewNotes = notes || '';
            await submission.save();

            // Update score based on decision
            const score = await Score.findOne({ teamId: submission.teamId });
            if (score) {
                // Calculate penalty based on decision
                const penalty = decision === 'wrong' ? 20 : 0; // 20 minute penalty for wrong answers
                
                await score.updateSectionScore(String(submission.problemId), String(submission.section), decision, penalty);
                await score.save();
                
                console.log(`Score updated for team ${submission.teamId}: Section ${submission.section} of Problem ${submission.problemId} marked as ${decision} (penalty: ${penalty})`);
            }
        }

        res.json({ success: true, message: 'Submission reviewed successfully' });
    } catch (error) {
        console.error('Submission review error:', error);
        res.json({ success: false, message: 'Error reviewing submission' });
    }
});

// Get full submission code
app.get('/admin/submission/:id/code', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isConnected) {
            const submission = await Submission.findById(id);
            if (!submission) {
                return res.json({ success: false, message: 'Submission not found' });
            }
            
            res.json({ 
                success: true, 
                code: submission.code,
                language: submission.language,
                teamId: submission.teamId,
                problemId: submission.problemId,
                section: submission.section
            });
        } else {
            res.json({ success: false, message: 'Feature not available in memory mode' });
        }
    } catch (error) {
        console.error('Get code error:', error);
        res.json({ success: false, message: 'Error fetching code' });
    }
});

// Get unreviewed submissions count
app.get('/admin/unreviewed-count', requireAdmin, async (req, res) => {
    try {
        let count = 0;
        
        if (isConnected) {
            count = await Submission.countDocuments({ reviewStatus: 'under_review' });
        }
        
        res.json({ count });
    } catch (error) {
        console.error('Unreviewed count error:', error);
        res.json({ count: 0 });
    }
});

app.delete('/admin/announcement/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (isConnected) {
            await Announcement.findByIdAndDelete(id);
        }

        res.json({ success: true, message: 'Announcement deleted successfully' });
    } catch (error) {
        console.error('Announcement deletion error:', error);
        res.json({ success: false, message: 'Error deleting announcement' });
    }
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Admin session destroy error:', err);
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
