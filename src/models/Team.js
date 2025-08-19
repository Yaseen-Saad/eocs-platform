import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const teamSchema = new mongoose.Schema({
    teamId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    teamName: {
        type: String,
        required: true,
        trim: true
    },
    members: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        grade: {
            type: String,
            required: true
        }
    }],
    school: {
        type: String,
        required: true,
        trim: true
    },
    loginTime: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
teamSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
teamSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update login time
teamSchema.methods.updateLoginTime = function() {
    this.loginTime = new Date();
    return this.save();
};

export default mongoose.model('Team', teamSchema);
