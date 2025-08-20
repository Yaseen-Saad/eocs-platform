import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Team from '../models/Team.js';
import Score from '../models/Score.js';
import Problem from '../models/Problem.js';

// Load environment variables
dotenv.config();

const testScoreboardData = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Test the exact same logic as the scoreboard route
        const teams = await Team.find({}).select('teamId teamName');
        console.log('📊 Found teams:', teams.length);
        
        const scores = await Score.find({});
        console.log('📊 Found scores:', scores.length);
        
        const allProblems = await Problem.find({}).sort({ section: 1, number: 1 });
        console.log('📊 Found problems in database:', allProblems.length);
        
        // Show sample of what we'll pass to template
        console.log('\n🔍 Sample data for template:');
        console.log('- Problems array length:', allProblems.length);
        console.log('- First problem:', allProblems[0] ? {
            id: allProblems[0].id,
            section: allProblems[0].section,
            title: allProblems[0].title,
            sectionsCount: Object.keys(allProblems[0].sections || {}).length
        } : 'None');
        
        console.log('\n- Teams:', teams.map(t => ({ teamId: t.teamId, teamName: t.teamName })));
        
        if (scores.length > 0) {
            console.log('\n- Sample score structure:');
            const sampleScore = scores[0];
            console.log('  Team:', sampleScore.teamId);
            console.log('  Total Score:', sampleScore.totalScore);
            console.log('  Problems count:', sampleScore.problems ? sampleScore.problems.size : 0);
            
            if (sampleScore.problems && sampleScore.problems.size > 0) {
                const firstProblem = Array.from(sampleScore.problems.entries())[0];
                console.log('  First problem data:', {
                    problemId: firstProblem[0],
                    totalScore: firstProblem[1].totalScore,
                    status: firstProblem[1].status,
                    sectionsCount: firstProblem[1].sections ? firstProblem[1].sections.size : 0
                });
            }
        }

        console.log('\n✅ Scoreboard data test completed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing scoreboard data:', error);
        process.exit(1);
    }
};

testScoreboardData();
