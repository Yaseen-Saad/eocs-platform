import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Team from '../models/Team.js';
import Score from '../models/Score.js';

// Load environment variables
dotenv.config();

const seedTeams = async () => {
    try {
        await connectDB();

        // Clear existing data
        await Team.deleteMany({});
        await Score.deleteMany({});

        // Sample teams data
        const teams = [
            {
                teamId: 'TEAM001',
                password: 'password123',
                teamName: 'Code Warriors',
                members: [
                    { name: 'Ahmed Mohamed', email: 'ahmed@example.com', grade: '12' },
                    { name: 'Sara Ali', email: 'sara@example.com', grade: '11' }
                ],
                school: 'Cairo High School'
            },
            {
                teamId: 'TEAM002',
                password: 'password123',
                teamName: 'Algorithm Masters',
                members: [
                    { name: 'Omar Hassan', email: 'omar@example.com', grade: '12' },
                    { name: 'Fatma Gamal', email: 'fatma@example.com', grade: '12' }
                ],
                school: 'Alexandria STEM School'
            },
            {
                teamId: 'TEAM003',
                password: 'password123',
                teamName: 'Binary Builders',
                members: [
                    { name: 'Youssef Khaled', email: 'youssef@example.com', grade: '11' },
                    { name: 'Nour Mahmoud', email: 'nour@example.com', grade: '11' }
                ],
                school: 'Giza International School'
            },
            {
                teamId: 'TEAM004',
                password: 'password123',
                teamName: 'Data Dynamos',
                members: [
                    { name: 'Amr Tarek', email: 'amr@example.com', grade: '12' },
                    { name: 'Yasmin Adel', email: 'yasmin@example.com', grade: '12' }
                ],
                school: 'Mansoura STEM High School'
            },
            {
                teamId: 'TEAM005',
                password: 'password123',
                teamName: 'Python Pros',
                members: [
                    { name: 'Kareem Samir', email: 'kareem@example.com', grade: '11' },
                    { name: 'Rana Mohamed', email: 'rana@example.com', grade: '11' }
                ],
                school: 'Aswan Technology School'
            }
        ];

        // Create teams one by one to trigger password hashing
        const createdTeams = [];
        for (const teamData of teams) {
            const team = new Team(teamData);
            const savedTeam = await team.save();
            createdTeams.push(savedTeam);
        }
        console.log(`✅ Created ${createdTeams.length} teams`);

        // Create score records with all zeros for fresh competition start using Map structure
        const scorePromises = teams.map(async (teamData) => {
            const score = new Score({
                teamId: teamData.teamId,
                totalScore: 0,
                totalPenalty: 0,
                problems: new Map()
            });

            // Add problems 1-4 with sections A-E (or adjust based on your actual problem structure)
            for (let problemId = 1; problemId <= 4; problemId++) {
                const problemData = {
                    totalScore: 0,
                    status: 'unsolved',
                    sections: new Map()
                };
                
                // Add sections A-E for each problem
                ['A', 'B', 'C', 'D', 'E'].forEach(sectionId => {
                    problemData.sections.set(sectionId, {
                        status: 'unsolved',
                        score: 0,
                        trials: 0,
                        penalty: 0
                    });
                });
                
                score.problems.set(String(problemId), problemData);
            }
            
            return await score.save();
        });

        const createdScores = await Promise.all(scorePromises);
        console.log(`✅ Created ${createdScores.length} zero score records`);

        console.log('\n📋 Team Login Credentials:');
        console.log('========================');
        teams.forEach(team => {
            console.log(`Team ID: ${team.teamId} | Password: ${team.password} | Team: ${team.teamName}`);
        });

        console.log('\n📊 Competition Standings Preview:');
        console.log('================================');
        const standings = createdScores
            .sort((a, b) => b.totalScore - a.totalScore || a.totalPenalty - b.totalPenalty)
            .map((score, index) => {
                const teamInfo = teams.find(t => t.teamId === score.teamId);
                return {
                    rank: index + 1,
                    teamId: score.teamId,
                    teamName: teamInfo.teamName,
                    totalScore: score.totalScore,
                    totalPenalty: score.totalPenalty
                };
            });

        standings.forEach(team => {
            console.log(`${team.rank}. ${team.teamName} (${team.teamId}) - ${team.totalScore} points, ${team.totalPenalty}min penalty`);
        });

        console.log('\n🎯 Seeding completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedTeams();
