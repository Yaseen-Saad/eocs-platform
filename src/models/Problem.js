import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    section: { type: String, required: true, enum: ['A', 'B', 'C', 'D', 'E'] },
    number: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    maxPoints: { type: Number, default: 100 },
    sections: {
        type: Map,
        of: {
            title: String,
            description: String,
            maxPoints: { type: Number, default: 25 }
        },
        default: () => new Map()
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
problemSchema.index({ section: 1, number: 1 });
problemSchema.index({ id: 1 });

// Methods
problemSchema.methods.getSectionArray = function() {
    return Array.from(this.sections.entries()).map(([key, value]) => ({
        key,
        ...value
    }));
};

problemSchema.statics.getBySection = function(section) {
    return this.find({ section }).sort({ number: 1 });
};

problemSchema.statics.getAllSorted = function() {
    return this.find({}).sort({ section: 1, number: 1 });
};

export default mongoose.model('Problem', problemSchema);
