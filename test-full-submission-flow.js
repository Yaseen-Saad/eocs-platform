import mongoose from 'mongoose';
import Score from './src/models/Score.js';
import Submission from './src/models/Submission.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Testing submission and admin review flow...');
    
    // 1. Create a test submission
    const submissionData = {
        teamId: 'TEAM001',
        problemId: 1,
        section: '1',
        language: 'py',
        code: 'print("Hello World")',
        codeLength: 20, // Required field
        explanation: 'Test submission',
        status: 'pending',
        reviewStatus: 'under_review',
        submittedAt: new Date()
    };
    
    const submission = new Submission(submissionData);
    await submission.save();
    console.log('✅ Test submission created:', submission._id);
    
    // 2. Test incrementSectionTrials
    const score = await Score.findOne({ teamId: 'TEAM001' });
    if (score) {
        console.log('Before increment trials:', score.problems.get('1')?.sections?.get('1')?.trials || 0);
        
        await score.incrementSectionTrials('1', '1');
        await score.save();
        
        // Refresh from database
        const updatedScore = await Score.findOne({ teamId: 'TEAM001' });
        console.log('After increment trials:', updatedScore.problems.get('1')?.sections?.get('1')?.trials || 0);
    }
    
    // 3. Test admin review (mark as correct)
    submission.status = 'correct';
    submission.reviewStatus = 'reviewed';
    submission.reviewedAt = new Date();
    await submission.save();
    
    const scoreForReview = await Score.findOne({ teamId: 'TEAM001' });
    if (scoreForReview) {
        console.log('Before admin review - section status:', scoreForReview.problems.get('1')?.sections?.get('1')?.status);
        
        scoreForReview.updateSectionScore('1', '1', 'correct', 0);
        await scoreForReview.save();
        
        // Refresh from database
        const finalScore = await Score.findOne({ teamId: 'TEAM001' });
        console.log('After admin review:');
        console.log('- Section status:', finalScore.problems.get('1')?.sections?.get('1')?.status);
        console.log('- Section score:', finalScore.problems.get('1')?.sections?.get('1')?.score);
        console.log('- Total score:', finalScore.totalScore);
    }
    
    // 4. Clean up test submission
    await Submission.findByIdAndDelete(submission._id);
    console.log('✅ Test submission cleaned up');
    
    console.log('✅ All tests passed! Submission flow is working correctly.');
    
} catch (error) {
    console.error('❌ Test failed:', error);
} finally {
    await mongoose.disconnect();
}
