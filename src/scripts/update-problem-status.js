import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Score from '../models/Score.js';

// Load environment variables
dotenv.config();

const updateProblemStatus = async () => {
    try {
        await connectDB();

        console.log('🔄 Updating problem status logic for all teams...');

        const scores = await Score.find({});
        console.log(`Found ${scores.length} score records to update`);

        for (const score of scores) {
            let hasChanges = false;
            
            // Recalculate problem status for each problem
            for (const [problemId, problemData] of score.problems) {
                const oldStatus = problemData.status;
                
                let correctCount = 0;
                let wrongCount = 0;
                let unsolvedCount = 0;
                
                for (const [sectionId, sectionData] of problemData.sections) {
                    if (sectionData.status === 'correct') {
                        correctCount++;
                    } else if (sectionData.status === 'wrong') {
                        wrongCount++;
                    } else {
                        unsolvedCount++;
                    }
                }
                
                // New problem status logic
                let newStatus;
                if (correctCount === problemData.sections.size && problemData.sections.size > 0) {
                    newStatus = 'correct';
                } else if (wrongCount === problemData.sections.size && problemData.sections.size > 0) {
                    newStatus = 'wrong';
                } else if (correctCount > 0) {
                    newStatus = 'partial';
                } else {
                    newStatus = 'unsolved';
                }
                
                if (oldStatus !== newStatus) {
                    console.log(`Team ${score.teamId}, Problem ${problemId}: ${oldStatus} → ${newStatus}`);
                    problemData.status = newStatus;
                    hasChanges = true;
                }
            }
            
            if (hasChanges) {
                score.markModified('problems');
                await score.save();
                console.log(`✅ Updated score record for team ${score.teamId}`);
            }
        }

        console.log('\n🎯 Problem status update completed successfully!');
        
        // Show summary
        const updatedScores = await Score.find({});
        const statusCounts = {
            correct: 0,
            partial: 0,
            wrong: 0,
            unsolved: 0
        };
        
        for (const score of updatedScores) {
            for (const [problemId, problemData] of score.problems) {
                statusCounts[problemData.status]++;
            }
        }
        
        console.log('\n📊 Problem Status Summary:');
        console.log('========================');
        console.log(`Correct: ${statusCounts.correct}`);
        console.log(`Partial: ${statusCounts.partial}`);
        console.log(`Wrong: ${statusCounts.wrong}`);
        console.log(`Unsolved: ${statusCounts.unsolved}`);
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error updating problem status:', error);
        process.exit(1);
    }
};

updateProblemStatus();
