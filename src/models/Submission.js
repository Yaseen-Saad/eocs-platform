import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
        ref: 'Team'
    },
    problemId: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    },
    section: {
        type: String,
        required: true,
        enum: ['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    language: {
        type: String,
        required: true,
        enum: ['py', 'cpp']
    },
    code: {
        type: String,
        required: true
    },
    codeLength: {
        type: Number,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'correct', 'wrong', 'evaluated', 'error'],
        default: 'pending'
    },
    reviewStatus: {
        type: String,
        enum: ['not_reviewed', 'under_review', 'reviewed'],
        default: 'not_reviewed'
    },
    reviewedAt: {
        type: Date,
        default: null
    },
    reviewedBy: {
        type: String,
        default: null
    },
    reviewNotes: {
        type: String,
        default: ''
    },
    googleFormSubmitted: {
        type: Boolean,
        default: true // Assume it's submitted to Google Forms
    },
    googleFormResponse: {
        type: String,
        default: null
    }
});

// Indexes for better query performance
submissionSchema.index({ teamId: 1, submittedAt: -1 });
submissionSchema.index({ problemId: 1, section: 1 });
submissionSchema.index({ submittedAt: -1 });
submissionSchema.index({ reviewStatus: 1 });

// Method to get language display name
submissionSchema.methods.getLanguageDisplay = function() {
    return this.language === 'py' ? 'Python' : 'C++';
};

// Method to get code preview (first 100 characters)
submissionSchema.methods.getCodePreview = function() {
    return this.code.length > 100 ? this.code.substring(0, 100) + '...' : this.code;
};

// Static method to get recent submissions
submissionSchema.statics.getRecent = function(limit = 20) {
    return this.find()
        .sort({ submittedAt: -1 })
        .limit(limit)
        .populate('teamId', 'teamId teamName');
};

// Static method to get submissions for a team
submissionSchema.statics.getByTeam = function(teamId) {
    return this.find({ teamId })
        .sort({ submittedAt: -1 });
};

// Static method to get submissions for a problem
submissionSchema.statics.getByProblem = function(problemId, section = null) {
    const query = { problemId };
    if (section) query.section = section;
    
    return this.find(query)
        .sort({ submittedAt: -1 })
        .populate('teamId', 'teamId teamName');
};

export default mongoose.model('Submission', submissionSchema);
