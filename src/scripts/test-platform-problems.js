import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Problem from '../models/Problem.js';

// Load environment variables
dotenv.config();

const testPlatformProblems = async () => {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB');

        console.log('\n🔍 Testing Problem.getAllSorted() method...');
        const problems = await Problem.getAllSorted();
        
        console.log(`📊 Found ${problems.length} problems:`);
        problems.forEach(problem => {
            console.log(`   - Problem ${problem.id}: Section ${problem.section}, Number ${problem.number}`);
            console.log(`     Title: ${problem.title}`);
            console.log(`     Max Points: ${problem.maxPoints}`);
            console.log(`     Sections: ${Object.keys(problem.sections || {}).length} subtasks\n`);
        });

        console.log('\n📋 Problems grouped by section:');
        const sectionOrder = ['1', '2', '3', '4'];
        sectionOrder.forEach(sectionNumber => {
            const sectionProblems = problems.filter(p => p.section === sectionNumber);
            console.log(`   Section ${sectionNumber}: ${sectionProblems.length} problems`);
            sectionProblems.forEach(p => {
                console.log(`     - ${p.title} (ID: ${p.id})`);
            });
        });

        console.log('\n✅ Test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error testing platform problems:', error);
        process.exit(1);
    }
};

testPlatformProblems();
