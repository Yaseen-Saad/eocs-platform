import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Problem from './src/models/Problem.js';
import Score from './src/models/Score.js';

dotenv.config();

const checkDatabaseStructure = async () => {
    try {
        await connectDB();
        
        console.log('=== CURRENT PROBLEMS IN DATABASE ===');
        const problems = await Problem.find({}).sort({ id: 1 });
        console.log('Total problems found:', problems.length);
        
        problems.forEach(problem => {
            console.log(`\nProblem: ${problem.id}`);
            console.log(`Title: ${problem.title}`);
            console.log(`Sections: ${problem.sections ? problem.sections.length : 'No sections'}`);
            if (problem.sections) {
                problem.sections.forEach((section, index) => {
                    console.log(`  Section ${index + 1}: ${section[0]} - ${section[1]}`);
                });
            }
        });
        
        console.log('\n=== CURRENT SCORE STRUCTURE ===');
        const sampleScore = await Score.findOne({ teamId: 'TEAM001' });
        if (sampleScore) {
            console.log('Score structure for TEAM001:');
            console.log('Problems in score:', Object.keys(sampleScore.problems));
            
            Object.keys(sampleScore.problems).forEach(problemId => {
                const problem = sampleScore.problems[problemId];
                console.log(`\nProblem ${problemId}:`);
                if (problem.sections) {
                    console.log('  Sections:', Object.keys(problem.sections));
                }
            });
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkDatabaseStructure();
