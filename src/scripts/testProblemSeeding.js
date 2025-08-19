import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Problem from '../models/Problem.js';

// Load environment variables
dotenv.config();

const testProblemSeeding = async () => {
    try {
        console.log('🌱 Testing Problem Seeding...');
        
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // Clear existing problems
        await Problem.deleteMany({});
        console.log('✅ Cleared existing problems');

        // Test creating one problem
        const testProblem = new Problem({
            id: 1,
            section: '1', // Physics
            number: 1,
            title: 'Test Problem',
            description: 'Test Description',
            maxPoints: 100,
            sections: new Map([
                ['1', { title: 'Part 1', description: 'First part', maxPoints: 25 }],
                ['2', { title: 'Part 2', description: 'Second part', maxPoints: 25 }]
            ])
        });

        const savedProblem = await testProblem.save();
        console.log('✅ Created test problem:', savedProblem.title);

        console.log('🎯 Test completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testProblemSeeding();
