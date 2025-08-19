import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import Problem from './src/models/Problem.js';

dotenv.config();

const examineProblems = async () => {
    try {
        await connectDB();
        
        console.log('=== EXAMINING PROBLEM STRUCTURE ===');
        const problem1 = await Problem.findOne({ id: 1 });
        
        if (problem1) {
            console.log('Problem 1 details:');
            console.log('ID:', problem1.id);
            console.log('Title:', problem1.title);
            console.log('Section:', problem1.section);
            console.log('Number:', problem1.number);
            console.log('Sections Map:', problem1.sections);
            console.log('Sections keys:', problem1.sections ? Array.from(problem1.sections.keys()) : 'No sections');
            console.log('Sections entries:', problem1.sections ? Array.from(problem1.sections.entries()) : 'No sections');
            
            console.log('\nUsing getSectionArray method:');
            console.log(problem1.getSectionArray());
        }
        
        console.log('\n=== PROBLEM DISTRIBUTION BY SECTION ===');
        const sections = ['A', 'B', 'C', 'D', 'E'];
        for (const section of sections) {
            const problemsInSection = await Problem.find({ section });
            console.log(`Section ${section}: ${problemsInSection.length} problems`);
            if (problemsInSection.length > 0) {
                problemsInSection.slice(0, 3).forEach(p => {
                    console.log(`  - Problem ${p.id}: ${p.title}`);
                });
            }
        }
        
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

examineProblems();
