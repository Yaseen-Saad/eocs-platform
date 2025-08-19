import mongoose from 'mongoose';
import Score from './src/models/Score.js';

// Connect to MongoDB
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Testing Score model methods...');
    
    // Find a score record
    const score = await Score.findOne({ teamId: 'TEAM002' });
    if (!score) {
        console.log('No score found for TEAM002');
        process.exit(1);
    }
    
    console.log('Score found:', score.teamId);
    console.log('Before increment:', JSON.stringify(score.problems.get('1'), null, 2));
    
    // Test incrementSectionTrials
    console.log('Testing incrementSectionTrials...');
    await score.incrementSectionTrials('1', '1');
    console.log('After increment:', JSON.stringify(score.problems.get('1'), null, 2));
    
    // Test updateSectionScore
    console.log('Testing updateSectionScore...');
    score.updateSectionScore('1', '1', 'correct', 5);
    console.log('After update:', JSON.stringify(score.problems.get('1'), null, 2));
    
    await score.save();
    console.log('Score saved successfully');
    
    console.log('All tests passed!');
} catch (error) {
    console.error('Test failed:', error);
} finally {
    await mongoose.disconnect();
}
