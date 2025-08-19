// In-memory storage fallback when MongoDB is not available
class InMemoryStorage {
    constructor() {
        this.teams = new Map();
        this.scores = new Map();
        this.submissions = new Map();
        this.sessions = new Map();
        this.announcements = new Map();
        this.clarifications = new Map();
    }

    // Team operations
    async findTeam(teamId) {
        return this.teams.get(teamId.toUpperCase()) || null;
    }

    async createTeam(teamData) {
        const team = {
            ...teamData,
            teamId: teamData.teamId.toUpperCase(),
            createdAt: new Date(),
            loginTime: null,
            isActive: true,
            comparePassword: function(password) {
                return Promise.resolve(this.password === password);
            },
            updateLoginTime: function() {
                this.loginTime = new Date();
                return Promise.resolve(this);
            }
        };
        this.teams.set(team.teamId, team);
        return team;
    }

    // Score operations
    async findScore(teamId) {
        return this.scores.get(teamId) || null;
    }

    async createScore(scoreData) {
        const score = {
            ...scoreData,
            calculateTotals: function() {
                this.totalScore = 0;
                this.totalPenalty = 0;
                this.totalTrials = 0;
                
                for (let i = 1; i <= 4; i++) {
                    const problem = this.problems[i];
                    if (problem.status === 'correct') {
                        this.totalScore += 1;
                    }
                    this.totalPenalty += problem.penalty;
                    this.totalTrials += problem.trials;
                }
                
                this.lastUpdated = new Date();
                return this;
            },
            updateProblem: function(problemId, status) {
                const problem = this.problems[problemId];
                
                if (status === 'correct' && problem.status !== 'correct') {
                    problem.status = 'correct';
                    problem.solvedAt = new Date();
                    problem.penalty = problem.trials * 10;
                } else if (status === 'wrong') {
                    problem.status = 'wrong';
                } else if (status === 'unsolved') {
                    problem.status = 'unsolved';
                    problem.solvedAt = null;
                    problem.penalty = 0;
                }
                
                this.calculateTotals();
                return Promise.resolve(this);
            },
            updateSection: function(problemId, section, status) {
                const problem = this.problems[problemId];
                if (!problem) {
                    this.problems[problemId] = {
                        sections: {
                            A: { status: 'unsolved', trials: 0 },
                            B: { status: 'unsolved', trials: 0 },
                            C: { status: 'unsolved', trials: 0 },
                            D: { status: 'unsolved', trials: 0 },
                            E: { status: 'unsolved', trials: 0 }
                        },
                        status: 'unsolved',
                        trials: 0,
                        penalty: 0
                    };
                }
                
                if (!problem.sections) {
                    problem.sections = {
                        A: { status: 'unsolved', trials: 0 },
                        B: { status: 'unsolved', trials: 0 },
                        C: { status: 'unsolved', trials: 0 },
                        D: { status: 'unsolved', trials: 0 },
                        E: { status: 'unsolved', trials: 0 }
                    };
                }
                
                if (!problem.sections[section]) {
                    problem.sections[section] = { status: 'unsolved', trials: 0 };
                }
                
                // Update section status
                problem.sections[section].status = status;
                
                // Update overall problem status based on section statuses
                const sections = problem.sections;
                const correctSections = Object.values(sections).filter(s => s.status === 'correct').length;
                const wrongSections = Object.values(sections).filter(s => s.status === 'wrong').length;
                
                if (correctSections === 5) {
                    problem.status = 'correct';
                    problem.solvedAt = new Date();
                    problem.penalty = problem.trials * 10;
                } else if (wrongSections > 0) {
                    problem.status = 'wrong';
                } else {
                    problem.status = 'unsolved';
                    problem.solvedAt = null;
                    problem.penalty = 0;
                }
                
                this.calculateTotals();
                return Promise.resolve(this);
            },
            incrementTrials: function(problemId) {
                this.problems[problemId].trials += 1;
                this.calculateTotals();
                return Promise.resolve(this);
            },
            save: function() {
                return Promise.resolve(this);
            }
        };
        
        this.scores.set(scoreData.teamId, score);
        return score;
    }

    async updateScore(teamId, updateData) {
        const score = this.scores.get(teamId);
        if (score) {
            Object.assign(score, updateData);
        }
        return score;
    }

    async getAllScores() {
        const scores = Array.from(this.scores.values());
        return scores.sort((a, b) => {
            if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
            return a.totalPenalty - b.totalPenalty;
        });
    }

    // Submission operations
    async createSubmission(submissionData) {
        const submission = {
            ...submissionData,
            _id: Date.now().toString(),
            submittedAt: new Date(),
            save: function() {
                return Promise.resolve(this);
            }
        };
        
        this.submissions.set(submission._id, submission);
        return submission;
    }

    async getRecentSubmissions(limit = 50) {
        const submissions = Array.from(this.submissions.values());
        return submissions
            .sort((a, b) => b.submittedAt - a.submittedAt)
            .slice(0, limit);
    }

    // Initialize with sample data
    async initializeSampleData() {
        console.log('🔄 Initializing sample data for in-memory storage...');
        
        // Create sample teams
        const sampleTeams = [
            {
                teamId: 'TEAM001',
                password: 'password123',
                teamName: 'Code Warriors',
                members: [
                    { name: 'Ahmed Mohamed', email: 'ahmed@example.com', grade: '12' },
                    { name: 'Sara Ali', email: 'sara@example.com', grade: '11' }
                ],
                school: 'Cairo High School'
            },
            {
                teamId: 'TEAM002',
                password: 'password123',
                teamName: 'Algorithm Masters',
                members: [
                    { name: 'Omar Hassan', email: 'omar@example.com', grade: '12' },
                    { name: 'Fatma Gamal', email: 'fatma@example.com', grade: '12' }
                ],
                school: 'Alexandria STEM School'
            },
            {
                teamId: 'TEAM003',
                password: 'password123',
                teamName: 'Binary Builders',
                members: [
                    { name: 'Youssef Khaled', email: 'youssef@example.com', grade: '11' },
                    { name: 'Nour Mahmoud', email: 'nour@example.com', grade: '11' }
                ],
                school: 'Giza International School'
            }
        ];

        for (const teamData of sampleTeams) {
            await this.createTeam(teamData);
            
            // Create initial score for each team
            await this.createScore({
                teamId: teamData.teamId,
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
                },
                totalScore: 0,
                totalPenalty: 0,
                totalTrials: 0
            });
        }

        console.log('✅ Sample data initialized');
        console.log('\n📋 Team Login Credentials:');
        console.log('========================');
        sampleTeams.forEach(team => {
            console.log(`Team ID: ${team.teamId} | Password: ${team.password} | Team: ${team.teamName}`);
        });
    }
}

export default InMemoryStorage;
