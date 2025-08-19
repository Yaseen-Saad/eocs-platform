import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Problem from '../models/Problem.js';

// Load environment variables
dotenv.config();

const examineProblems = async () => {
    try {
        await connectDB();

        const problems = await Problem.find({}).sort({ id: 1, section: 1, number: 1 });
        
        console.log('📋 Current Problems in Database:');
        console.log('================================');
        
        if (problems.length === 0) {
            console.log('❌ No problems found in database');
            return;
        }

        const problemsBySection = {};
        problems.forEach(problem => {
            const sectionKey = `Section ${problem.section}`;
            if (!problemsBySection[sectionKey]) {
                problemsBySection[sectionKey] = [];
            }
            problemsBySection[sectionKey].push(problem);
        });

        for (const [section, sectionProblems] of Object.entries(problemsBySection)) {
            console.log(`\n📚 ${section}:`);
            sectionProblems.forEach(problem => {
                console.log(`  Problem ${problem.number}: ${problem.title}`);
                if (problem.sections && problem.sections.size > 0) {
                    console.log(`    Sections: ${Array.from(problem.sections.keys()).join(', ')}`);
                }
            });
        }

        console.log(`\n📊 Total Problems: ${problems.length}`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Error examining problems:', error);
        process.exit(1);
    }
};

examineProblems();
