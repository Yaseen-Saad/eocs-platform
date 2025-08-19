import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Team from './src/models/Team.js';
import Score from './src/models/Score.js';
import Problem from './src/models/Problem.js';

dotenv.config();

const rebuildScores = async () => {
    try {
        await connectDB();
        
        console.log('🔄 Rebuilding score structure to match actual problems...');
        
        // Get all problems to understand the structure
        const problems = await Problem.find({}).sort({ id: 1 });
        console.log(`Found ${problems.length} problems in database`);
        
        // Group problems by their main problem ID and get section structure
        const problemStructure = {};
        problems.forEach(problem => {
            const problemId = problem.id;
            const sectionKeys = Array.from(problem.sections.keys());
            
            problemStructure[problemId] = {
                title: problem.title,
                section: problem.section,
                sections: sectionKeys
            };
        });
        
        console.log('Problem structure analysis:');
        Object.keys(problemStructure).forEach(id => {
            const prob = problemStructure[id];
            console.log(`  Problem ${id}: ${prob.title} (Section ${prob.section}) - ${prob.sections.length} subsections`);
        });
        
        // Get all teams
        const teams = await Team.find({});
        console.log(`Found ${teams.length} teams`);
        
        // Clear existing scores
        await Score.deleteMany({});
        console.log('✅ Cleared existing scores');
        
        // Create new score structure for each team
        for (const team of teams) {
            const scoreData = {
                teamId: team.teamId,
                problems: new Map(),
                totalScore: 0,
                totalPenalty: 0,
                totalTrials: 0
            };
            
            // Initialize all problems and their sections with zero scores
            Object.keys(problemStructure).forEach(problemId => {
                const prob = problemStructure[problemId];
                const problemSections = new Map();
                
                // Initialize each section for this problem
                prob.sections.forEach(sectionId => {
                    problemSections.set(sectionId, {
                        status: 'unsolved',
                        trials: 0,
                        penalty: 0,
                        solvedAt: null
                    });
                });
                
                scoreData.problems.set(problemId, {
                    sections: problemSections,
                    status: 'unsolved',
                    trials: 0,
                    penalty: 0,
                    solvedAt: null
                });
            });
            
            const newScore = new Score(scoreData);
            await newScore.save();
            console.log(`✅ Created score for team ${team.teamId}`);
        }
        
        console.log('\n📊 New score structure summary:');
        const sampleScore = await Score.findOne({});
        if (sampleScore) {
            console.log(`Problems in score: ${Array.from(sampleScore.problems.keys()).length}`);
            console.log('Sample problem sections:');
            
            // Show first few problems as examples
            let count = 0;
            for (const [problemId, problem] of sampleScore.problems) {
                if (count < 5) {
                    const sectionCount = problem.sections.size;
                    const sectionKeys = Array.from(problem.sections.keys());
                    console.log(`  Problem ${problemId}: ${sectionCount} sections [${sectionKeys.join(', ')}]`);
                    count++;
                }
            }
        }
        
        console.log('\n✅ Score rebuild completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error rebuilding scores:', error);
        process.exit(1);
    }
};

rebuildScores();
