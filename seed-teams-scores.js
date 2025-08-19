import mongoose from 'mongoose';
import Team from './src/models/Team.js';
import Score from './src/models/Score.js';
import Problem from './src/models/Problem.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Creating teams and scores...');
    
    // First, let's see what problems exist
    const problems = await Problem.find({});
    console.log(`Found ${problems.length} problems`);
    
    // Create teams if they don't exist
    const teamData = [
        { teamId: 'TEAM001', teamName: 'Code Warriors', password: 'team001pass', school: 'Test School', members: [] },
        { teamId: 'TEAM002', teamName: 'Algorithm Masters', password: 'team002pass', school: 'Test School', members: [] },
        { teamId: 'TEAM003', teamName: 'Binary Builders', password: 'team003pass', school: 'Test School', members: [] },
        { teamId: 'TEAM004', teamName: 'Data Dynamos', password: 'team004pass', school: 'Test School', members: [] },
        { teamId: 'TEAM005', teamName: 'Python Pros', password: 'team005pass', school: 'Test School', members: [] }
    ];
    
    for (const data of teamData) {
        const existingTeam = await Team.findOne({ teamId: data.teamId });
        if (!existingTeam) {
            const team = new Team(data);
            await team.save();
            console.log(`Created team: ${data.teamId}`);
        } else {
            console.log(`Team already exists: ${data.teamId}`);
        }
        
        // Create score record for this team
        const existingScore = await Score.findOne({ teamId: data.teamId });
        if (!existingScore) {
            const score = new Score({
                teamId: data.teamId,
                totalScore: 0,
                totalPenalty: 0,
                problems: new Map()
            });
            
            // Initialize problems with sections
            for (const problem of problems) {
                const problemData = {
                    totalScore: 0,
                    status: 'unsolved',
                    sections: new Map()
                };
                
                // Add sections for this problem
                for (const [sectionKey, sectionValue] of problem.sections) {
                    problemData.sections.set(String(sectionKey), {
                        status: 'unsolved',
                        score: 0,
                        trials: 0,
                        penalty: 0
                    });
                }
                
                score.problems.set(String(problem.problemId), problemData);
            }
            
            await score.save();
            console.log(`Created score record for: ${data.teamId}`);
        } else {
            console.log(`Score already exists for: ${data.teamId}`);
        }
    }
    
    console.log('Seeding completed successfully!');
} catch (error) {
    console.error('Seeding failed:', error);
} finally {
    await mongoose.disconnect();
}
