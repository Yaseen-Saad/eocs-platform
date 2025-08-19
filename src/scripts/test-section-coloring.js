import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Team from '../models/Team.js';
import Score from '../models/Score.js';
import Submission from '../models/Submission.js';

dotenv.config();

const testSectionColoring = async () => {
    try {
        await connectDB();

        console.log('🧪 Testing Section-Level Status Coloring\n');

        // Find a team to test with
        const testTeam = await Team.findOne({ teamId: 'TEAM001' });
        if (!testTeam) {
            console.log('❌ No test team found. Run seedTeams.js first.');
            return;
        }

        console.log(`📝 Testing with team: ${testTeam.teamId} (${testTeam.teamName})\n`);

        // Clear any existing submissions and scores for this team
        await Submission.deleteMany({ teamId: testTeam.teamId });
        
        let score = await Score.findOne({ teamId: testTeam.teamId });
        if (score) {
            // Reset the score to all zeros
            score.totalScore = 0;
            score.totalPenalty = 0;
            for (let [problemId, problemData] of score.problems) {
                problemData.totalScore = 0;
                problemData.status = 'unsolved';
                for (let [sectionId, sectionData] of problemData.sections) {
                    sectionData.status = 'unsolved';
                    sectionData.score = 0;
                    sectionData.trials = 0;
                    sectionData.penalty = 0;
                }
            }
            await score.save();
        }

        console.log('✅ Reset team scores to all zeros\n');

        // Test 1: Submit wrong answer to Problem 1, Section A
        console.log('🔴 Test 1: Submitting WRONG answer to Problem 1, Section A');
        const wrongSubmission = new Submission({
            teamId: testTeam.teamId,
            problemId: 1,
            section: 'A',
            language: 'py',
            code: 'print("wrong answer")',
            codeLength: 22,
            status: 'wrong'
        });
        await wrongSubmission.save();

        // Update score for wrong answer
        score = await Score.findOne({ teamId: testTeam.teamId });
        await score.updateSectionScore('1', 'A', 'wrong', 0);
        await score.save();

        console.log('   ➤ Problem 1, Section A should now be RED (wrong)');
        console.log('   ➤ Problem 1 Total should be YELLOW (partial - has wrong but other sections unsolved)');

        // Test 2: Submit correct answer to Problem 1, Section B
        console.log('\n🟢 Test 2: Submitting CORRECT answer to Problem 1, Section B');
        const correctSubmission = new Submission({
            teamId: testTeam.teamId,
            problemId: 1,
            section: 'B',
            language: 'py',
            code: 'print("correct answer")',
            codeLength: 24,
            status: 'correct'
        });
        await correctSubmission.save();

        // Update score for correct answer
        score = await Score.findOne({ teamId: testTeam.teamId });
        await score.updateSectionScore('1', 'B', 'correct', 20);
        await score.save();

        console.log('   ➤ Problem 1, Section A should still be RED (wrong)');
        console.log('   ➤ Problem 1, Section B should now be GREEN (correct)');
        console.log('   ➤ Problem 1 Total should be YELLOW (partial - mix of correct/wrong/unsolved)');

        // Test 3: Submit correct answer to Problem 2, Section A (different problem)
        console.log('\n🟢 Test 3: Submitting CORRECT answer to Problem 2, Section A');
        const correctSubmission2 = new Submission({
            teamId: testTeam.teamId,
            problemId: 2,
            section: 'A',
            language: 'cpp',
            code: 'cout << "correct answer";',
            codeLength: 26,
            status: 'correct'
        });
        await correctSubmission2.save();

        // Update score for correct answer
        score = await Score.findOne({ teamId: testTeam.teamId });
        await score.updateSectionScore('2', 'A', 'correct', 20);
        await score.save();

        console.log('   ➤ Problem 2, Section A should now be GREEN (correct)');
        console.log('   ➤ Problem 2 Total should be YELLOW (partial - one correct, others unsolved)');

        // Display final score state
        console.log('\n📊 Final Score State:');
        score = await Score.findOne({ teamId: testTeam.teamId });
        console.log(`Total Score: ${score.totalScore}`);
        console.log(`Total Penalty: ${score.totalPenalty}`);
        
        for (let [problemId, problemData] of score.problems) {
            console.log(`\nProblem ${problemId}:`);
            console.log(`  Total Score: ${problemData.totalScore}`);
            console.log(`  Status: ${problemData.status}`);
            for (let [sectionId, sectionData] of problemData.sections) {
                console.log(`    Section ${sectionId}: ${sectionData.status} (score: ${sectionData.score}, trials: ${sectionData.trials})`);
            }
        }

        console.log('\n🌐 Expected Scoreboard Colors:');
        console.log('   Problem 1, Section A: RED background (wrong)');
        console.log('   Problem 1, Section B: GREEN background (correct)');
        console.log('   Problem 1, Section C-E: GRAY background (unsolved)');
        console.log('   Problem 1 Total: YELLOW background (partial)');
        console.log('');
        console.log('   Problem 2, Section A: GREEN background (correct)');
        console.log('   Problem 2, Section B-E: GRAY background (unsolved)');
        console.log('   Problem 2 Total: YELLOW background (partial)');
        console.log('');
        console.log('   Problem 3-4: All GRAY (unsolved)');

        console.log('\n✅ Test completed! Check the scoreboard at http://localhost:3000/scoreboard');

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        process.exit(0);
    }
};

testSectionColoring();
