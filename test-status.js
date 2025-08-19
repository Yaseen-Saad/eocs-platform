import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Submission from './src/models/Submission.js';

dotenv.config();

const testStatusChecking = async () => {
    try {
        await connectDB();
        
        // Simulate checking status for TEAM001, Problem 1, Section A
        const problemId = 1;
        const section = 'A';
        const teamId = 'TEAM001';
        
        console.log('Testing submission status checking...');
        
        // Find the latest submission for this team, problem, and section
        const latestSubmission = await Submission.findOne({
            teamId: teamId,
            problemId: problemId,
            section: section
        }).sort({ submittedAt: -1 });

        console.log('Latest submission found:', {
            id: latestSubmission?._id,
            status: latestSubmission?.status,
            reviewStatus: latestSubmission?.reviewStatus,
            submittedAt: latestSubmission?.submittedAt
        });

        if (!latestSubmission) {
            console.log('Status would be: none');
            process.exit(0);
        }

        // Check what status would be returned
        if (latestSubmission.status === 'correct') {
            console.log('Status would be: correct (no more submissions allowed)');
        } else if (latestSubmission.status === 'pending') {
            console.log('Status would be: pending (waiting for review)');
        } else if (latestSubmission.status === 'wrong') {
            // Get penalty count for wrong submissions
            const wrongSubmissions = await Submission.countDocuments({
                teamId: teamId,
                problemId: problemId,
                section: section,
                status: 'wrong'
            });
            
            console.log('Status would be: can_submit');
            console.log('Wrong submissions count:', wrongSubmissions);
            console.log('Message would be: Previous submission was incorrect. You have', wrongSubmissions, 'wrong attempt(s).');
        }
        
        console.log('\n✅ Status checking test completed!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testStatusChecking();
