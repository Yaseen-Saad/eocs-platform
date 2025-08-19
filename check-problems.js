import mongoose from 'mongoose';
import Problem from './src/models/Problem.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Checking problems in database...');
    
    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems`);
    
    if (problems.length === 0) {
        console.log('Creating sample problems...');
        
        // Create sample problems with sections
        for (let i = 1; i <= 19; i++) {
            const problem = new Problem({
                problemId: i,
                title: `Problem ${i}`,
                description: `Description for problem ${i}`,
                difficulty: i <= 5 ? 'easy' : i <= 15 ? 'medium' : 'hard',
                sections: new Map()
            });
            
            // Add 4 sections to each problem
            for (let j = 1; j <= 4; j++) {
                problem.sections.set(j.toString(), {
                    title: `Section ${j}`,
                    description: `Section ${j} of problem ${i}`,
                    maxScore: 20,
                    testCases: []
                });
            }
            
            await problem.save();
            console.log(`Created problem ${i}`);
        }
        
        console.log('Sample problems created!');
    } else {
        for (const problem of problems) {
            console.log(`Problem ${problem.problemId}: ${problem.title} (${problem.sections.size} sections)`);
        }
    }
    
} catch (error) {
    console.error('Error:', error);
} finally {
    await mongoose.disconnect();
}
