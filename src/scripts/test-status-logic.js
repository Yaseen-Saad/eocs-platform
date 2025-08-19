import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Score from '../models/Score.js';

// Load environment variables
dotenv.config();

const testStatusLogic = async () => {
    try {
        await connectDB();

        console.log('🧪 Testing new problem status logic...');

        // Find the first team's score record
        const score = await Score.findOne({});
        if (!score) {
            console.log('❌ No score records found. Run seedTeams.js first.');
            process.exit(1);
        }

        console.log(`\n📝 Testing with team: ${score.teamId}`);
        
        // Test scenario 1: One section correct, others unsolved
        console.log('\n--- Test 1: One section correct, others unsolved ---');
        await score.updateSectionScore('1', 'A', 'correct', 0);
        const problem1 = score.problems.get('1');
        console.log(`Problem 1 status: ${problem1.status} (expected: partial)`);
        console.log(`Problem 1 score: ${problem1.totalScore} (expected: 20)`);

        // Test scenario 2: One section wrong, others unsolved
        console.log('\n--- Test 2: One section wrong, others unsolved ---');
        await score.updateSectionScore('2', 'A', 'wrong', 5);
        const problem2 = score.problems.get('2');
        console.log(`Problem 2 status: ${problem2.status} (expected: unsolved)`);
        console.log(`Problem 2 score: ${problem2.totalScore} (expected: 0)`);

        // Test scenario 3: Mixed - some correct, some wrong
        console.log('\n--- Test 3: Mixed - some correct, some wrong ---');
        await score.updateSectionScore('3', 'A', 'correct', 0);
        await score.updateSectionScore('3', 'B', 'wrong', 5);
        const problem3 = score.problems.get('3');
        console.log(`Problem 3 status: ${problem3.status} (expected: partial)`);
        console.log(`Problem 3 score: ${problem3.totalScore} (expected: 20)`);

        // Test scenario 4: All sections correct
        console.log('\n--- Test 4: All sections correct ---');
        await score.updateSectionScore('4', 'A', 'correct', 0);
        await score.updateSectionScore('4', 'B', 'correct', 0);
        await score.updateSectionScore('4', 'C', 'correct', 0);
        await score.updateSectionScore('4', 'D', 'correct', 0);
        await score.updateSectionScore('4', 'E', 'correct', 0);
        const problem4 = score.problems.get('4');
        console.log(`Problem 4 status: ${problem4.status} (expected: correct)`);
        console.log(`Problem 4 score: ${problem4.totalScore} (expected: 100)`);

        await score.save();

        console.log('\n📊 Final Score Summary:');
        console.log('=======================');
        console.log(`Team: ${score.teamId}`);
        console.log(`Total Score: ${score.totalScore}`);
        console.log(`Total Penalty: ${score.totalPenalty}`);

        console.log('\nProblem Details:');
        for (const [problemId, problemData] of score.problems) {
            console.log(`Problem ${problemId}: ${problemData.status} (${problemData.totalScore} points)`);
            for (const [sectionId, sectionData] of problemData.sections) {
                console.log(`  Section ${sectionId}: ${sectionData.status} (${sectionData.score} points, ${sectionData.trials} trials, ${sectionData.penalty} penalty)`);
            }
        }

        console.log('\n🎯 Test completed successfully!');
        console.log('Now check the scoreboard to see if colors are correct.');
        
        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing status logic:', error);
        process.exit(1);
    }
};

testStatusLogic();
