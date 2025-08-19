import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Submission from './src/models/Submission.js';
import Score from './src/models/Score.js';

dotenv.config();

const testSubmissionFlow = async () => {
    try {
        await connectDB();
        
        // Create a test submission for TEAM001, Problem 1, Section A
        const testSubmission = new Submission({
            teamId: 'TEAM001',
            problemId: 1,
            section: 'A',
            language: 'py',
            code: 'print("Hello World")',
            codeLength: 19,
            status: 'pending',
            reviewStatus: 'under_review',
            submittedAt: new Date()
        });
        
        await testSubmission.save();
        console.log('✅ Test submission created:', testSubmission._id);
        
        // Update trials in score
        const score = await Score.findOne({ teamId: 'TEAM001' });
        if (score) {
            await score.incrementSectionTrials(1, 'A');
            console.log('✅ Trials incremented for section A of problem 1');
        }
        
        console.log('\n📋 Current state before admin review:');
        const updatedScore = await Score.findOne({ teamId: 'TEAM001' });
        console.log('Problem 1 Section A trials:', updatedScore.problems[1].sections.A.trials);
        console.log('Problem 1 Section A status:', updatedScore.problems[1].sections.A.status);
        console.log('Total score:', updatedScore.totalScore);
        
        // Simulate admin marking it as wrong
        testSubmission.status = 'wrong';
        testSubmission.reviewStatus = 'reviewed';
        testSubmission.reviewedAt = new Date();
        testSubmission.reviewedBy = 'admin';
        testSubmission.reviewNotes = 'Incorrect solution';
        await testSubmission.save();
        
        // Update score - mark section as wrong
        const problem = updatedScore.problems[1];
        const section = problem.sections.A;
        section.status = 'wrong';
        
        // Recalculate totals
        updatedScore.totalScore = 0;
        updatedScore.totalPenalty = 0;
        updatedScore.totalTrials = 0;

        for (let i = 1; i <= 4; i++) {
            const prob = updatedScore.problems[i];
            if (prob) {
                const correctSections = Object.values(prob.sections || {})
                    .filter(s => s.status === 'correct').length;
                updatedScore.totalScore += correctSections * 20;
                updatedScore.totalPenalty += prob.penalty || 0;
                updatedScore.totalTrials += prob.trials || 0;
            }
        }
        
        updatedScore.markModified('problems.1');
        await updatedScore.save();
        
        console.log('\n📋 State after admin marked as wrong:');
        const finalScore = await Score.findOne({ teamId: 'TEAM001' });
        console.log('Problem 1 Section A status:', finalScore.problems[1].sections.A.status);
        console.log('Problem 1 Section A trials:', finalScore.problems[1].sections.A.trials);
        console.log('Total score:', finalScore.totalScore);
        
        console.log('\n📋 Submission status:');
        const finalSubmission = await Submission.findById(testSubmission._id);
        console.log('Submission status:', finalSubmission.status);
        console.log('Review status:', finalSubmission.reviewStatus);
        
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testSubmissionFlow();
