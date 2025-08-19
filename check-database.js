import mongoose from 'mongoose';

// Connect to MongoDB  
await mongoose.connect('mongodb://localhost:27017/eocs-competition');

try {
    console.log('Checking all collections...');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    // Check problems collection
    const problemsCollection = mongoose.connection.db.collection('problems');
    const problems = await problemsCollection.find({}).toArray();
    console.log(`\nFound ${problems.length} problems:`);
    problems.forEach(p => {
        console.log(`- ID: ${p.id || p.problemId}, Section: ${p.section}, Number: ${p.number}, Title: ${p.title}`);
    });
    
    // Check teams
    const teamsCollection = mongoose.connection.db.collection('teams');
    const teams = await teamsCollection.find({}).toArray();
    console.log(`\nFound ${teams.length} teams:`);
    teams.forEach(t => {
        console.log(`- ${t.teamId}: ${t.teamName}`);
    });
    
    // Check scores
    const scoresCollection = mongoose.connection.db.collection('scores');
    const scores = await scoresCollection.find({}).toArray();
    console.log(`\nFound ${scores.length} scores:`);
    scores.forEach(s => {
        console.log(`- ${s.teamId}: Total ${s.totalScore}, Problems: ${Object.keys(s.problems || {}).length}`);
    });
    
} catch (error) {
    console.error('Error:', error);
} finally {
    await mongoose.disconnect();
}
