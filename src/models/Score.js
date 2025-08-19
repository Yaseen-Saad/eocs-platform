import mongoose from 'mongoose';

const ScoreSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
        unique: true
    },
    totalScore: {
        type: Number,
        default: 0
    },
    totalPenalty: {
        type: Number,
        default: 0
    },
    problems: {
        type: Map,
        of: {
            totalScore: { type: Number, default: 0 },
            status: { type: String, enum: ['correct', 'wrong', 'unsolved', 'partial'], default: 'unsolved' },
            sections: {
                type: Map,
                of: {
                    status: { type: String, enum: ['correct', 'wrong', 'unsolved'], default: 'unsolved' },
                    score: { type: Number, default: 0 },
                    trials: { type: Number, default: 0 },
                    firstSolvedTime: { type: Date },
                    penalty: { type: Number, default: 0 }
                }
            }
        },
        default: new Map()
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Update lastUpdated on save
ScoreSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Method to update score for a specific problem and section
ScoreSchema.methods.updateSectionScore = function(problemId, sectionId, status, penalty = 0) {
    // Ensure keys are strings for Mongoose Maps
    const problemKey = String(problemId);
    const sectionKey = String(sectionId);
    
    if (!this.problems.has(problemKey)) {
        this.problems.set(problemKey, {
            totalScore: 0,
            status: 'unsolved',
            sections: new Map()
        });
    }
    
    const problem = this.problems.get(problemKey);
    
    if (!problem.sections.has(sectionKey)) {
        problem.sections.set(sectionKey, {
            status: 'unsolved',
            score: 0,
            trials: 0,
            penalty: 0
        });
    }
    
    const section = problem.sections.get(sectionKey);
    section.trials += 1;
    
    if (status === 'correct' && section.status !== 'correct') {
        section.status = 'correct';
        section.score = 20; // 20 points per section
        section.firstSolvedTime = new Date();
        section.penalty = penalty;
    } else if (status === 'wrong') {
        section.status = 'wrong';
        section.penalty += penalty;
    }
    
    // Recalculate problem total
    let problemTotal = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unsolvedCount = 0;
    
    for (const [sectionKey, sectionData] of problem.sections) {
        if (sectionData.status === 'correct') {
            problemTotal += sectionData.score;
            correctCount++;
        } else if (sectionData.status === 'wrong') {
            wrongCount++;
        } else {
            unsolvedCount++;
        }
    }
    
    problem.totalScore = problemTotal;
    
    // Problem status logic:
    // - 'correct' if all sections are correct
    // - 'wrong' if all sections are wrong (no correct or unsolved)
    // - 'partial' if has both correct and wrong/unsolved (mixed status)
    // - 'unsolved' if no sections attempted yet
    if (correctCount === problem.sections.size && problem.sections.size > 0) {
        problem.status = 'correct';
    } else if (wrongCount === problem.sections.size && problem.sections.size > 0) {
        problem.status = 'wrong';
    } else if (correctCount > 0) {
        problem.status = 'partial';
    } else {
        problem.status = 'unsolved';
    }
    
    // Recalculate totals
    this.totalScore = 0;
    this.totalPenalty = 0;
    
    for (const [problemKey, problemData] of this.problems) {
        this.totalScore += problemData.totalScore;
        for (const [sectionKey, sectionData] of problemData.sections) {
            this.totalPenalty += sectionData.penalty;
        }
    }
    
    this.markModified('problems');
};

// Method to increment trials for a specific section
ScoreSchema.methods.incrementSectionTrials = function(problemId, sectionId) {
    // Ensure keys are strings for Mongoose Maps
    const problemKey = String(problemId);
    const sectionKey = String(sectionId);
    
    if (!this.problems.has(problemKey)) {
        this.problems.set(problemKey, {
            totalScore: 0,
            status: 'unsolved',
            sections: new Map()
        });
    }
    
    const problem = this.problems.get(problemKey);
    
    if (!problem.sections.has(sectionKey)) {
        problem.sections.set(sectionKey, {
            status: 'unsolved',
            score: 0,
            trials: 0,
            penalty: 0
        });
    }
    
    const section = problem.sections.get(sectionKey);
    section.trials += 1;
    
    this.markModified('problems');
};

export default mongoose.model('Score', ScoreSchema);
