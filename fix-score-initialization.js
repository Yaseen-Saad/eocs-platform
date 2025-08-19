import mongoose from 'mongoose';
import Score from './src/models/Score.js';
import Problem from './src/models/Problem.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Fixing score initialization for all problems...');
    
    // Get all problems
    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems`);
    
    // Get all scores
    const scores = await Score.find({});
    console.log(`Found ${scores.length} scores`);
    
    for (const score of scores) {
        console.log(`\nUpdating score for ${score.teamId}...`);
        console.log(`Current problems: ${Array.from(score.problems.keys())}`);
        
        // For each problem in the database, ensure the score has an entry
        for (const problem of problems) {
            const problemKey = String(problem.id || problem.problemId);
            
            if (!score.problems.has(problemKey)) {
                console.log(`  Adding problem ${problemKey}`);
                
                const problemData = {
                    totalScore: 0,
                    status: 'unsolved',
                    sections: new Map()
                };
                
                // Add sections for this problem (A-E or 1-4 depending on structure)
                if (problem.sections && problem.sections.size > 0) {
                    for (const [sectionKey, sectionValue] of problem.sections) {
                        problemData.sections.set(String(sectionKey), {
                            status: 'unsolved',
                            score: 0,
                            trials: 0,
                            penalty: 0
                        });
                    }
                } else {
                    // Default sections if none exist
                    for (let i = 1; i <= 4; i++) {
                        problemData.sections.set(String(i), {
                            status: 'unsolved',
                            score: 0,
                            trials: 0,
                            penalty: 0
                        });
                    }
                }
                
                score.problems.set(problemKey, problemData);
            }
        }
        
        score.markModified('problems');
        await score.save();
        console.log(`  Updated! Now has problems: ${Array.from(score.problems.keys())}`);
    }
    
    console.log('\n✅ All scores updated successfully!');
    
} catch (error) {
    console.error('❌ Error:', error);
} finally {
    await mongoose.disconnect();
}
