import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Team from '../models/Team.js';
import Score from '../models/Score.js';
import Problem from '../models/Problem.js';

// Load environment variables
dotenv.config();

// Competition problems extracted from problems.tex
const problems = [
    // SECTION 1: COMPUTATIONAL PHYSICS (4 Problems)
    {
        id: 1,
        section: 1,
        number: 1,
        title: "Pendulum Motion Simulation",
        description: "Simulate pendulum motion using differential equations with varying parameters",
        maxPoints: 60,
        sections: new Map([
            ['1', { title: 'Basic Pendulum Simulation', description: 'Simulate pendulum from 90° for 13 seconds with L=10m, dt=0.01s', maxPoints: 20 }],
            ['2', { title: 'Air Resistance Effect', description: 'Add linear air resistance factor k=0.3, simulate for 30s', maxPoints: 20 }],
            ['3', { title: 'Phase Space Graph', description: 'Output phase space graph showing spiral to origin', maxPoints: 20 }]
        ])
    },
    {
        id: 2,
        section: 1,
        number: 2,
        title: "N-Body Problem Simulation",
        description: "Solve N-Body gravitational systems using numerical integration",
        maxPoints: 120,
        sections: new Map([
            ['1', { title: '4-Body Square System', description: 'REBOUND simulation with square configuration, plot orbits and energy', maxPoints: 20 }],
            ['2', { title: '5-Body Scattering', description: 'Add 5th body, record minimum separation and energy changes', maxPoints: 20 }],
            ['3', { title: 'Zeus-Odin-Jupiter ODE', description: 'Write ODEs for three-body system in component form', maxPoints: 20 }],
            ['4', { title: 'Forward Euler Implementation', description: 'Implement Forward Euler without REBOUND, T=10, dt=0.001', maxPoints: 20 }],
            ['5', { title: 'Leap Frog Comparison', description: 'Implement Leap Frog integrator, compare with Forward Euler', maxPoints: 20 }],
            ['6', { title: 'Figure 8 Stability', description: 'Test 5 initial conditions, find stable Figure 8 orbit', maxPoints: 20 }]
        ])
    },
    {
        id: 3,
        section: 1,
        number: 3,
        title: "2D Ising Model Simulation",
        description: "Monte Carlo simulation of magnetic spin systems",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'Metropolis Probability', description: 'Derive metropolis probability using Boltzmann distribution', maxPoints: 20 }],
            ['2', { title: 'Basic 2D Ising Model', description: 'Simulate L=40, T=1, 400 sweeps with magnetization graph', maxPoints: 20 }],
            ['3', { title: 'External Magnetic Field', description: 'Implement h=4 field, achieve 95% positive spins at T=3', maxPoints: 20 }],
            ['4', { title: 'Curie Temperature', description: 'Find first temperature past Curie point from given list', maxPoints: 20 }]
        ])
    },
    {
        id: 4,
        section: 1,
        number: 4,
        title: "Particles in a Box",
        description: "Elastic collision simulation of gas particles",
        maxPoints: 60,
        sections: new Map([
            ['1', { title: 'Basic Box Simulation', description: '20 particles, 5m box, elastic collisions, speed histogram', maxPoints: 20 }],
            ['2', { title: 'Moving Piston Wall', description: 'Add moving wall at 15cm/s, show compression effects', maxPoints: 20 }],
            ['3', { title: 'Circular Boundary', description: 'Replace box with circular boundary of 5m radius', maxPoints: 20 }]
        ])
    },

    // SECTION 2: CHEMISTRY (5 Problems)
    {
        id: 5,
        section: 2,
        number: 1,
        title: "Periodic Trends Analysis",
        description: "Analyze atomic properties across the periodic table",
        maxPoints: 60,
        sections: new Map([
            ['1', { title: 'Effective Nuclear Charge', description: 'Calculate Z_eff using screening constants, plot vs atomic number', maxPoints: 20 }],
            ['2', { title: 'Periodic Trend Plots', description: 'Plot atomic radius and ionization energy, explain deviations', maxPoints: 20 }],
            ['3', { title: 'Ion Formation Analysis', description: 'Predict most ionizable element, calculate correlation coefficient', maxPoints: 20 }]
        ])
    },
    {
        id: 6,
        section: 2,
        number: 2,
        title: "Bond Dissociation Energy",
        description: "Calculate reaction enthalpy using bond energies",
        maxPoints: 60,
        sections: new Map([
            ['1', { title: 'Propane Combustion ΔH', description: 'Calculate enthalpy change for C₃H₈ combustion', maxPoints: 20 }],
            ['2', { title: 'BDE Contribution Plot', description: 'Bar plot of reactant/product contributions, calculate percentages', maxPoints: 20 }],
            ['3', { title: 'Fuel Efficiency Analysis', description: 'Determine reaction type, calculate heat per gram of propane', maxPoints: 20 }]
        ])
    },
    {
        id: 7,
        section: 2,
        number: 3,
        title: "Conformational Analysis",
        description: "Study molecular conformations using energy minimization",
        maxPoints: 60,
        sections: new Map([
            ['1', { title: 'Butane Conformations', description: 'Generate 6 conformations at different dihedral angles', maxPoints: 20 }],
            ['2', { title: 'Energy vs Dihedral Plot', description: 'Plot energy profile, identify global minimum', maxPoints: 20 }],
            ['3', { title: 'Boltzmann Populations', description: 'Calculate populations at 298K and 373K using Boltzmann factor', maxPoints: 20 }]
        ])
    },
    {
        id: 8,
        section: 2,
        number: 4,
        title: "Gibbs Free Energy",
        description: "Thermodynamic analysis of chemical reactions",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'ΔG and Equilibrium', description: 'Calculate ΔG at 298K and equilibrium constant for NH₃ dissociation', maxPoints: 20 }],
            ['2', { title: 'Temperature Dependence', description: 'Plot ΔG vs temperature (273-473K), analyze spontaneity', maxPoints: 20 }],
            ['3', { title: 'Sensitivity Analysis', description: 'Vary ΔH by ±10%, plot ln K vs temperature', maxPoints: 20 }],
            ['4', { title: 'Energy Diagram', description: 'Create reaction coordinate diagram with 100 kJ/mol barrier', maxPoints: 20 }]
        ])
    },
    {
        id: 9,
        section: 2,
        number: 5,
        title: "Molecular Dynamics",
        description: "MD simulation using Morse potential for CO molecules",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'MD Implementation', description: 'Simulate 2 CO molecules, 1000 steps at 300K, 1fs timestep', maxPoints: 20 }],
            ['2', { title: 'Energy Conservation', description: 'Calculate average energies, verify conservation via variance', maxPoints: 20 }],
            ['3', { title: 'Radial Distribution', description: 'Compute RDF, estimate most probable separation distance', maxPoints: 20 }],
            ['4', { title: 'Parameter Effects', description: 'Increase parameter a by 20%, compare RDFs and energy variance', maxPoints: 20 }]
        ])
    },

    // SECTION 3: MATHEMATICS (5 Problems)
    {
        id: 10,
        section: 3,
        number: 1,
        title: "Plato's Geometric Equations",
        description: "Solve Plato's trigonometric and limit problems",
        maxPoints: 40,
        sections: new Map([
            ['1', { title: 'Trigonometric Solution', description: 'Solve sin²(x) = cos(x)sin(x) generally', maxPoints: 20 }],
            ['2', { title: 'Limit Evaluation', description: 'Evaluate limit as x approaches 0 from left of d/dx|x|', maxPoints: 20 }]
        ])
    },
    {
        id: 11,
        section: 3,
        number: 2,
        title: "Leibniz Calculus Problems",
        description: "Integration and differential equation solving",
        maxPoints: 40,
        sections: new Map([
            ['1', { title: 'Gaussian Integration', description: 'Integrate Gaussian distribution from -∞ to ∞', maxPoints: 20 }],
            ['2', { title: 'Boundary Value Problem', description: 'Solve ODE with conditions f(1)=0, f\'(2)=1', maxPoints: 20 }]
        ])
    },
    {
        id: 12,
        section: 3,
        number: 3,
        title: "Sieve of Eratosthenes",
        description: "Prime number enumeration algorithm",
        maxPoints: 20,
        sections: new Map([
            ['1', { title: 'Complete Sieve Algorithm', description: 'Implement complete Sieve of Eratosthenes with Boolean flags', maxPoints: 20 }]
        ])
    },
    {
        id: 13,
        section: 3,
        number: 4,
        title: "Advanced Mathematical Analysis",
        description: "Complex mathematical computations and analysis",
        maxPoints: 20,
        sections: new Map([
            ['1', { title: 'Advanced Problem', description: 'Solve advanced mathematical problem from competition', maxPoints: 20 }]
        ])
    },
    {
        id: 14,
        section: 3,
        number: 5,
        title: "Computational Mathematics",
        description: "Numerical methods and computational techniques",
        maxPoints: 20,
        sections: new Map([
            ['1', { title: 'Numerical Methods', description: 'Apply numerical methods to solve mathematical problems', maxPoints: 20 }]
        ])
    },

    // SECTION 4: BIOLOGY (5 Problems)
    {
        id: 15,
        section: 4,
        number: 1,
        title: "Needleman-Wunsch Alignment",
        description: "Global sequence alignment using dynamic programming",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'Algorithm Implementation', description: 'Implement Needleman-Wunsch with DP matrix', maxPoints: 20 }],
            ['2', { title: 'Matrix Initialization', description: 'Initialize first row/column with gap penalties', maxPoints: 20 }],
            ['3', { title: 'Traceback Function', description: 'Retrieve all optimal alignments via traceback', maxPoints: 20 }],
            ['4', { title: 'Results Output', description: 'Print matrix, score, and all optimal alignments', maxPoints: 20 }]
        ])
    },
    {
        id: 16,
        section: 4,
        number: 2,
        title: "DNA Sequence Validation",
        description: "Quality control pipeline for coding sequences",
        maxPoints: 100,
        sections: new Map([
            ['1', { title: 'Basic Validation', description: 'Check valid nucleotides, length, start codon', maxPoints: 20 }],
            ['2', { title: 'Codon Analysis', description: 'Validate reading frame and stop codons', maxPoints: 20 }],
            ['3', { title: 'Translation Check', description: 'Verify proper translation without internal stops', maxPoints: 20 }],
            ['4', { title: 'GC Content', description: 'Calculate and validate GC percentage (40-60%)', maxPoints: 20 }],
            ['5', { title: 'QC Report', description: 'Generate comprehensive quality control report', maxPoints: 20 }]
        ])
    },
    {
        id: 17,
        section: 4,
        number: 3,
        title: "Phylogenetic Analysis",
        description: "Evolutionary tree construction from sequence data",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'Distance Matrix', description: 'Calculate pairwise evolutionary distances', maxPoints: 20 }],
            ['2', { title: 'UPGMA Clustering', description: 'Build phylogenetic tree using UPGMA method', maxPoints: 20 }],
            ['3', { title: 'Tree Visualization', description: 'Visualize and interpret phylogenetic relationships', maxPoints: 20 }],
            ['4', { title: 'Statistical Validation', description: 'Perform bootstrap analysis for branch support', maxPoints: 20 }]
        ])
    },
    {
        id: 18,
        section: 4,
        number: 4,
        title: "Gene Expression Analysis",
        description: "RNA-seq differential expression analysis",
        maxPoints: 100,
        sections: new Map([
            ['1', { title: 'Data Preprocessing', description: 'Normalize and filter expression data', maxPoints: 20 }],
            ['2', { title: 'Statistical Testing', description: 'Perform differential expression tests', maxPoints: 20 }],
            ['3', { title: 'Fold Change Analysis', description: 'Calculate log fold changes and p-values', maxPoints: 20 }],
            ['4', { title: 'Volcano Plot', description: 'Create volcano plot visualization', maxPoints: 20 }],
            ['5', { title: 'Pathway Enrichment', description: 'Perform Gene Ontology enrichment analysis', maxPoints: 20 }]
        ])
    },
    {
        id: 19,
        section: 4,
        number: 5,
        title: "Protein Structure Analysis",
        description: "Computational protein structure prediction and analysis",
        maxPoints: 80,
        sections: new Map([
            ['1', { title: 'Secondary Structure', description: 'Predict alpha helix, beta sheet, loop regions', maxPoints: 20 }],
            ['2', { title: 'Hydrophobicity Profile', description: 'Calculate and plot hydrophobicity along sequence', maxPoints: 20 }],
            ['3', { title: 'Ramachandran Analysis', description: 'Generate phi-psi angle distribution plot', maxPoints: 20 }],
            ['4', { title: 'Structure Validation', description: 'Validate predicted structure quality metrics', maxPoints: 20 }]
        ])
    }
];

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

const seedCompetitionData = async () => {
    try {
        console.log('🌱 Starting Competition Data Seeding...\n');
        
        // Connect to MongoDB using the URI from .env
        await connectDB();
        console.log('✅ Connected to MongoDB using .env configuration\n');

        // Clear existing data
        console.log('🧹 Clearing existing data...');
        await Problem.deleteMany({});
        await Team.deleteMany({});
        await Score.deleteMany({});
        console.log('✅ Cleared existing problems, teams, and scores\n');

        // Insert problems from problems.tex
        console.log('📚 Seeding problems from problems.tex...');
        for (const problemData of problems) {
            const problem = new Problem(problemData);
            await problem.save();
            console.log(`   ✅ Problem ${problemData.section}-${problemData.number}: ${problemData.title}`);
        }
        console.log(`✅ Successfully inserted ${problems.length} problems\n`);

        // Create teams
        console.log('👥 Creating teams...');
        const createdTeams = [];
        for (const teamData of teams) {
            const team = new Team(teamData);
            const savedTeam = await team.save();
            createdTeams.push(savedTeam);
            console.log(`   ✅ Created team: ${teamData.teamId} - ${teamData.teamName}`);
        }
        console.log(`✅ Successfully created ${createdTeams.length} teams\n`);

        // Create score records with zeros for all problems and sections
        console.log('📊 Creating zero score records matching problems structure...');
        const scorePromises = teams.map(async (teamData) => {
            const score = new Score({
                teamId: teamData.teamId,
                totalScore: 0,
                totalPenalty: 0,
                problems: new Map()
            });

            // Add all problems from the problems array
            for (const problemData of problems) {
                const problemScore = {
                    totalScore: 0,
                    status: 'unsolved',
                    sections: new Map()
                };
                
                // Add all sections for this problem
                for (const [sectionId, sectionData] of problemData.sections) {
                    problemScore.sections.set(sectionId, {
                        status: 'unsolved',
                        score: 0,
                        trials: 0,
                        penalty: 0
                    });
                }
                
                score.problems.set(String(problemData.id), problemScore);
            }
            
            return await score.save();
        });

        const createdScores = await Promise.all(scorePromises);
        console.log(`✅ Created ${createdScores.length} zero score records\n`);

        // Display summary
        console.log('📋 Competition Setup Summary:');
        console.log('============================');
        console.log(`📚 Problems: ${problems.length} problems across 4 sections`);
        console.log('   - Section 1 (Physics): 4 problems');
        console.log('   - Section 2 (Chemistry): 5 problems');
        console.log('   - Section 3 (Mathematics): 5 problems');
        console.log('   - Section 4 (Biology): 5 problems');
        console.log(`👥 Teams: ${createdTeams.length} teams created`);
        console.log(`📊 Scores: ${createdScores.length} score records initialized\n`);

        console.log('🔑 Team Login Credentials:');
        console.log('==========================');
        teams.forEach(team => {
            console.log(`Team ID: ${team.teamId} | Password: ${team.password} | Team: ${team.teamName}`);
        });

        console.log('\n📊 Sample Score Structure (Team 1):');
        console.log('===================================');
        const sampleScore = createdScores[0];
        console.log(`Team: ${sampleScore.teamId}`);
        console.log(`Total Score: ${sampleScore.totalScore}`);
        console.log(`Total Penalty: ${sampleScore.totalPenalty}`);
        console.log('Problems:');
        
        let problemCount = 0;
        for (let [problemId, problemData] of sampleScore.problems) {
            const problemInfo = problems.find(p => p.id === parseInt(problemId));
            console.log(`  Problem ${problemId} (${problemInfo.title}):`);
            console.log(`    Status: ${problemData.status}, Score: ${problemData.totalScore}`);
            console.log(`    Sections: ${problemData.sections.size} sections`);
            problemCount++;
            if (problemCount >= 3) {
                console.log(`    ... and ${sampleScore.problems.size - 3} more problems`);
                break;
            }
        }

        console.log('\n🎯 Seeding completed successfully!');
        console.log(`📡 MongoDB URI: ${process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
        console.log('🌐 Competition is ready to start!\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding competition data:', error);
        process.exit(1);
    }
};

seedCompetitionData();
