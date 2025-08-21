import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import Team from '../models/Team.js';
import Score from '../models/Score.js';
import Problem from '../models/Problem.js';

dotenv.config();

const problems = [
    {
        id: 1,
        section: 1,
        number: 1,
        title: "Pendulum Motion Simulation",
        description: `A pendulum's motion can be described by a simple differential equation:
$$\\frac{d^2\\theta\\ }{dt^2}+\\frac{g}{L}\\ast\\sin{\\left(\\theta\\left(t\\right)\\right)}=0$$
Where $g$ is gravitational acceleration equal to $9.81\\frac{m}{s^2},$ $L$ is the length of the rope holding the pendulum, and $ \\theta$ is the angle of the pendulum's rope with the normal.

Using the differential equation, solve the following assuming$ L=10\\ m$ unless stated otherwise:`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Basic Pendulum Simulation', 
                description: 'Simulate a pendulum starting from $\\theta=90$° for 13 seconds with $L=10\\ m$ and $dt=0.01\\ s$. Output a graph with $\\theta$ on the y-axis and time on the x-axis', 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Air Resistance Effect', 
                description: `Add the effect of the following linear air resistance factor to the differential equation:
$$-\\frac{d\\theta}{dt}\\ast k$$
where $k$ is the air resistance coefficient, assumed to be $0.3$. Simulate the pendulum for $30\\ s$ with $dt=0.01$`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Phase Space Graph', 
                description: 'Output a phase space graph of the pendulum showing a spiral towards the origin point $(0,0)$', 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 2,
        section: 1,
        number: 2,
        title: "N-Body Problem Simulation",
        description: `The N-Body problem is a system of differential equations whose solutions are N curves that represent the motions of planets, stars or other celestial bodies.

Solving the N-Body problem requires getting the net force acting on each body for every interval of time, which can be done by numerically solving the following general equation:
$$m_i \\frac{d^2 x_i}{dt^2} = \\sum_{\\substack{j=1 \\\\ j \\ne i}}^{N} \\frac{G m_i m_j (x_j - x_i)}{\\|x_j - x_i\\|^3}$$
Given the initial conditions of the bodies, mainly the mass, position and velocity of each body, and using the result from this second-order ODE, one can get the acceleration of each body, and by numerically integrating for each timestep dt, one can simulate the motion of each body and how it changes due to the gravitational interactions between one and another.

To solve the N-Body problem numerically, we use integrators where: we give a timestep $dt$, and using the initial conditions we currently have, we approximate the result after time $t_n+dt$. Such integrators are called "Explicit Integrators", an example of one is the "Forward Euler":
$$y_{n+1}=y_n+dt\\cdot f(t_n,y_n)$$

In a simple ODE, $\\frac{dy}{dt}=f\\left(t,y\\right)$, with the initial $y\\left(t_0\\right)=y_0$ the goal is to find $y$ at later time intervals. Using the above equation, we can numerically approximate y at a later time.

As a shortcut to writing integrators by hand and solving ODEs, we can use the REBOUND library in Python and choose an integrator of our choice and then directly give our initial conditions and the library will output the results and simulate the process accordingly.

Using the aforementioned information and prior knowledge, solve the following problems:`,
        maxPoints: 120,
        sections: new Map([
            ['1', { 
                title: '4-Body Square System', 
                description: `Using the REBOUND library, simulate a 4-Body problem, each one is a corner of a square with side length 1 unit, and run it for $T = 10$ and $dt = 0.001$, with the following initial conditions, setting $G = 1$:
- $M = 2$ for the upper right, $M=1.5$ for upper left, $M = 1$ for lower left, and $M = 0.5$ for lower right.
- Velocity: Make each body move as if counterclockwise, perpendicular to the axis it should move towards with 0.1 speed (the upper right corner should have velocity (-0.1, 0), upper left should be (0, -0.1), lower left should be (0.1, 0), and lower right should be (0, 0.1))
- Set the square's center at the origin and find initial position accordingly.

Plot the orbit of the four bodies. Knowing that the mechanical energy is conserved, graph the energy fluctuations due to the integrator by graphing relative energy error and time.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: '5-Body Scattering', 
                description: `Building on the previous problem, add a 5th body at a (0, 5) from the square with mass = 0.5 in the positive y-axis direction, and set its velocity as (0, -5), and run the simulation for $T=10$, then:
- Record the minimum separation between the 5th particle and any of the four other particles
- Display the total energy of the system before and after the 5th body leaves`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Zeus-Odin-Jupiter ODE', 
                description: `In a three-body realm, Zeus, Odin and Jupiter fight each other in orbit, constantly bringing chaos to their realm. Using their initial conditions:
- $m_z\\ =\\ 2.0, m_o\\ =\\ 1.5, m_j\\ =\\ 1.0$
- $r_z\\ =\\ (0,0), r_o = (1,0), r_j = (0,1)$
- $v_z = (0,0.2), v_o = (0,-0.1), v_j\\ = (-0.1,0)$
- Set $G\\ =\\ 1$

Write the ODEs of each lord in component form (one for each axis x, y and z) and define the units for distance, time and mass.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Forward Euler Implementation', 
                description: 'WITHOUT using the REBOUND library, using the previous conditions, implement the Forward Euler integrator and run the system for $T=10$ time units, and integrate it with $dt\\ =\\ 0.001$, plot the orbit of the bodies using plotly or matplotlib or otherwise, output the total energy every 1 time unit, and check if the energy is conserved or not.', 
                maxPoints: 20 
            }],
            ['5', { 
                title: 'Leap Frog Comparison', 
                description: `The Forward Euler integrator is a type of integrator called "non-Symplectic", which is useful for short-term accuracy and systems with adaptive timesteps. The Leap Frog integrator is a "Symplectic integrator", which gives bounded, oscillating errors that preserve the global structure of the simulation in the long-term.

To use the Leap Frog, we divide the calculation into KDK (kick the velocity to half its new velocity, drift the position fully, and then kick the velocity to its full new velocity):

Kick: We calculate the half-velocity of the body:
$$v_{half}\\left(t+\\frac{dt}{2}\\right)=v_0\\left(t\\right)+\\frac{a_{old}(t)}{2}dt$$

Drift: We calculate the new position of the body:
$$r\\left(t+dt\\right)=r\\left(t\\right)+vt+dt2dt$$

Then compute the acceleration:
$$a_{new}\\left(t+dt\\right)=\\frac{F\\left(t+dt\\right)}{m}$$

Kick: We calculate the full velocity:
$$v_{full}(t+dt)=v_{half}\\left(t+\\frac{dt}{2}\\right)+\\frac{a_{new}}{2}dt$$

Using the new information you learned on the Leap Frog integrator, implement the integrator in the same coding file of the Zeus, Odin and Jupiter system, and for $T=50$ and $dt=0.01$, run the simulation once with the Forward Euler and once with the Leap Frog, then plot the total energy vs. time and plot the energy fluctuations vs. time.`, 
                maxPoints: 20 
            }],
            ['6', { 
                title: 'Figure 8 Stability', 
                description: `Zeus, Odin and Jupiter have signed a peace treaty and now orbit each other in a "Figure 8" way, symbolizing the indefinite time of their peace.

For their peace to continue, the Figure 8 orbit must remain stable, write a program that determines which of the following 5 initial conditions is the stable one, ensuring their peace remains:
$$p_1\\ =\\ 0.347111,\\ \\ p_2\\ =\\ 0.532728$$

Test all 5 conditions and determine the stable one:
- COND.1: $r_z=(-1,0), r_o=(1,1), r_j=(0,1)$; $v_z=(2p_1,2p_2), v_o=(p_1,p_2), v_j=(2p_1,2p_2)$
- COND.2: $r_z=(-1,4), r_o=(3,0), r_j=(0,-3)$; $v_z=(-p_1,-2p_2), v_o=(2p_1,3p_2), v_j=(-5p_1,-p_2)$
- COND.3: $r_z=(-2,0), r_o=(1,2), r_j=(1,1)$; $v_z=(-3p_1,-p_2), v_o=(2p_1,p_2), v_j=(-2p_1,2p_2)$
- COND.4: $r_z=(-1,0), r_o=(1,0), r_j=(0,0)$; $v_z=(p_1,p_2), v_o=(p_1,p_2), v_j=(-2p_1,-2p_2)$
- COND.5: $r_z=(1,1), r_o=(-2,3), r_j=(-1,0)$; $v_z=(-p_1,-p_2), v_o=(2p_1,p_2), v_j=(-2p_1,2p_2)$

The code must test all these conditions in one run. You can't manually change the initial parameters. Determine the stable condition and graph the total energy of the stable one against time.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 3,
        section: 1,
        number: 3,
        title: "2D Ising Model Simulation",
        description: `An Ising model is a lattice of side length L with spins which represent the magnetic dipoles of a ferromagnetic material. Each spin has 2 possible directions: 1 or -1. The Hamiltonian of the Ising model is as shown in the following equation:
$$H=\\frac{1}{2}\\cdot\\sum_{<i,j>}{-J\\cdot\\sigma_i\\cdot\\sigma_j}$$
Where $J$ is a coupling constant, normalized to 1 for simplicity, and $\\sigma_i, \\sigma_j$ are both adjacent spin values. The result is halved because this summation formula goes over all spin interactions twice.

To avoid falling into global minima, the Ising model is considered a canonical ensemble and $Z$ is defined as the partition function (number of forms of the Ising model, a really, really big number). Then, we can use the Boltzmann distribution to describe the probability for the system to be in any state $E$.
$$P\\left(E\\right)=\\frac{e^{-\\frac{E}{k_BT}}}{Z}$$
Assume $k_b=1$.

Using this information, solve the following problems:`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'Metropolis Probability', 
                description: 'Using the Boltzmann distribution provided above, find the metropolis probability p of going from one certain energy state to another. This\'ll allow you to figure out how likely an uphill movement is going to be accepted. Submit your answer in a neatly formatted markdown file or ipynb notebook with a markdown/latex block.', 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Basic 2D Ising Model', 
                description: `Using the derived probability $p$, simulate a 2D Ising model with the following parameters:
- $L=40$
- $T\\ =\\ 1$

Start with a random initial lattice and print the final distribution after 400 full lattice sweeps along with a graph of the lattice's magnetization as a function of time steps (use periodic boundary conditions, such that opposite lattice ends touch). You're considered to have completed a lattice sweep after you go over $L^2$ number of spins, chosen randomly.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'External Magnetic Field', 
                description: `Implement a strong magnetic field with external field coupling $ h=4$ into the 2D Ising model such that even with $T=3$ and $L=40$ its spins are still dominantly ($95\\%$) positive after 400 sweeps.

The percentage of positive spins can be calculated using the below equation:
$$pos=\\frac{n_{sp}}{L^2}$$
Where $n_{sp}$ is the number of positive +1 spins, and $L$ is the lattice linear size.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Curie Temperature', 
                description: `Using the following list of temperatures, change your code so that it simulates the 2D Ising model at each temperature and prints out the first temperature which is past the curie temperature:
- $T=0.487$
- $T=1.212$
- $T=2.054$
- $T=2.874$
- $T=3.141$
- $T=4.057$
- $T=5.845$

Consider$ L=20$, $h=0.4$, and do 400 full sweeps on each temperature. You can assume that any temperature below the curie temperature will achieve a normalized magnetization value above 0.9.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 4,
        section: 1,
        number: 4,
        title: "Particles in a Box",
        description: `Noble gases can be approximated as ideal gases. Since ideal gases have no intermolecular attraction, they are modeled as particles colliding elastically inside a container. This is often referred to as a "Particles in a Box" simulation.

Particle motion and collisions are governed by the elastic collision equations in vector form:
$$\\mathbf{v}_1' = \\mathbf{v}_1 - \\frac{2m_2}{m_1 + m_2} \\frac{\\langle \\mathbf{v}_1 - \\mathbf{v}_2, \\mathbf{x}_1 - \\mathbf{x}_2 \\rangle}{\\|\\mathbf{x}_1 - \\mathbf{x}_2\\|^2} (\\mathbf{x}_1 - \\mathbf{x}_2)$$

$$\\mathbf{v}_2' = \\mathbf{v}_2 - \\frac{2m_1}{m_1 + m_2} \\frac{\\langle \\mathbf{v}_2 - \\mathbf{v}_1, \\mathbf{x}_2 - \\mathbf{x}_1 \\rangle}{\\|\\mathbf{x}_2 - \\mathbf{x}_1\\|^2} (\\mathbf{x}_2 - \\mathbf{x}_1)$$

Using the aforementioned information, solve the following problems:`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Basic Box Simulation', 
                description: `Simulate 20 randomly dispersed particles inside a box with a side length of $5\\ m$ using $dt=0.001\\ s$ for time $10\\ s$. Make sure to implement collisions using the above velocity equations. All particles should:
- Have a mass of $m=5\\times{10}^{-3}\\ kg\\ $
- Start with an initial speed of $ 15\\frac{\\ m}{s}\\ $ in a random direction
- Each particle should have a radius of $10\\ cm$

Display a real-time histogram of the system's particle speeds during the simulation, with velocities on the x-axis and number of particles on the y-axis.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Moving Piston Wall', 
                description: `Using the same parameters as in problem 1, modify the box so that one wall moves inward like a piston, slowly reducing the box's size. The wall speed is $15\\frac{cm}{s}$. Show the same live histogram. The particles should collide with the piston as if it was a moving wall.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Circular Boundary', 
                description: 'Replace your box with a circular boundary of radius $5\\ m$', 
                maxPoints: 20 
            }]
        ])
    },

    {
        id: 5,
        section: 2,
        number: 1,
        title: "Periodic Trends Analysis",
        description: `Periodic trends in atomic properties like atomic radius and ionization energy are driven by electron configurations and nuclear charge. For the second period (Li to Ne), atomic radii decrease across the period, while ionization energies generally increase, with exceptions due to electron shell stability.

**Background**

Atomic Structure: Electron configurations (e.g., Li: $1s^22s^1$, Ne: $1s^22s^22p^6$) dictate periodic properties.

Periodic Trends: Atomic radius decreases left-to-right due to increasing nuclear charge; ionization energy increases, with drops at Be-to-B and N-to-O due to subshell stability.

**Data**: The following table provides atomic radii and first ionization energies for Li to Ne.

| Element | Atomic Radius (pm) | First Ionization Energy (kJ/mol) |
|---------|-------------------|----------------------------------|
| Li      | 152               | 520.2                           |
| Be      | 112               | 899.5                           |
| B       | 85                | 800.6                           |
| C       | 77                | 1086.5                          |
| N       | 70                | 1402.3                          |
| O       | 66                | 1313.9                          |
| F       | 64                | 1681.0                          |
| Ne      | 67                | 2080.7                          |

**Problems:**`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Effective Nuclear Charge', 
                description: `Using the data table, calculate the effective nuclear charge ($Z_{\\text{eff}}$) for each element using the simplified formula $Z_{\\text{eff}} = Z - \\sigma$, where $Z$ is the atomic number and $\\sigma$ is the screening constant (assume $\\sigma = 0.35$ per electron in the same shell, $0.85$ per inner-shell electron). Plot $Z_{\\text{eff}}$ versus atomic number.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Periodic Trend Plots', 
                description: `Create two plots: (a) atomic radius versus atomic number, and (b) ionization energy versus atomic number. Identify and explain deviations (e.g., at B and O) using electron configurations.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Ion Formation Analysis', 
                description: `Predict which element forms positive ions most readily. Justify using ionization energy and electron configuration, and compute the correlation coefficient between atomic number and ionization energy to assess trend linearity.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 6,
        section: 2,
        number: 2,
        title: "Bond Dissociation Energy",
        description: `Bond dissociation energies (BDEs) quantify the energy to break covalent bonds, enabling calculation of reaction enthalpy via Hess's law: $\\Delta H = \\sum \\text{BDEs(reactants)} - \\sum \\text{BDEs(products)}$. This is key for understanding reaction thermodynamics, such as in combustion.

**Background**

Bond Energies: Energy required to break a bond in the gas phase.

Hess's Law: Applies to net enthalpy changes in chemical reactions.

**Data**: The following table provides BDEs for the combustion of propane (C$_3$H$_8$ + 5O$_2$ $\\to$ 3CO$_2$ + 4H$_2$O).

| Bond | BDE (kJ/mol) |
|------|-------------|
| C-H  | 413         |
| C-C  | 348         |
| O=O  | 498         |
| C=O  | 803         |
| O-H  | 467         |

**Problems:**`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Propane Combustion ΔH', 
                description: `Using the data table, calculate $\\Delta H$ for the combustion of propane in kJ/mol. Show all steps, accounting for the number of each bond type.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'BDE Contribution Plot', 
                description: `Create a bar plot comparing the total BDE contributions of reactants and products. Compute the percentage each bond type contributes to the enthalpy change.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Fuel Efficiency Analysis', 
                description: `Determine if the reaction is exothermic or endothermic. Discuss how $\\Delta H$ supports propane's use as a fuel, including a calculation of heat release per gram of propane (molar mass: 44.1 g/mol).`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 7,
        section: 2,
        number: 3,
        title: "Conformational Analysis",
        description: `Molecules adopt multiple conformations due to bond rotations, with stability governed by energy minima. For butane (C$_4$H$_{10}$), rotation around the central C-C bond produces conformers like anti and gauche, analyzed via energy minimization.

**Background**

Conformational Analysis: Energy varies with dihedral angles; minima indicate stable conformers.

Boltzmann Distribution: Relative population of a conformer is $e^{-\\Delta E / kT}$, where $k = 0.001987$ kcal/(mol·K), $T = 298$ K.

**Problems:**`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Butane Conformations', 
                description: `Generate six conformations of butane by varying the dihedral angle of the central C-C bond ($0^\\circ$, $60^\\circ$, $120^\\circ$, $180^\\circ$, $240^\\circ$, $300^\\circ$). Compute their energies after minimization (in kcal/mol).`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Energy vs Dihedral Plot', 
                description: `Plot energy versus dihedral angle. Identify the global minimum and explain its stability using steric and electronic interactions.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Boltzmann Populations', 
                description: `Calculate the relative populations of the conformations using the Boltzmann factor at 298 K. Recompute at 373 K and discuss how temperature affects conformational preferences.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 8,
        section: 2,
        number: 4,
        title: "Gibbs Free Energy",
        description: `Gibbs free energy ($\\Delta G = \\Delta H - T\\Delta S$) determines reaction spontaneity, with equilibrium constants given by $K = e^{-\\Delta G / RT}$, where $R = 8.314$ J/(mol·K). For ammonia dissociation, this predicts equilibrium behavior.

**Background**

Thermodynamics: $\\Delta G < 0$ indicates spontaneity; $\\Delta S$ reflects disorder.

**Data**: For NH$_3$ $\\rightleftharpoons$ $\\frac{1}{2}$N$_2$ + $\\frac{3}{2}$H$_2$, use $\\Delta H = 46.1$ kJ/mol, $\\Delta S = 99.2$ J/(mol·K).

**Problems:**`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'ΔG and Equilibrium', 
                description: `Using the provided $\\Delta H$ and $\\Delta S$, compute $\\Delta G$ at 298 K and the equilibrium constant $K$. Calculate $\\ln K$ to 2 decimal places.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Temperature Dependence', 
                description: `Plot $\\Delta G$ versus temperature (273-473 K). Analyze how temperature affects spontaneity.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Sensitivity Analysis', 
                description: `Perform a sensitivity analysis by varying $\\Delta H$ by $±10\\%$. Plot the resulting $\\ln K$ versus temperature and discuss impacts on equilibrium predictions.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Energy Diagram', 
                description: `Create an energy diagram for the reaction coordinate, labeling $\\Delta G$ and estimating the transition state energy (assume a barrier of 100 kJ/mol).`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 9,
        section: 2,
        number: 5,
        title: "Molecular Dynamics",
        description: `Molecular dynamics (MD) simulates atomic motions using potentials like the Morse potential, which models diatomic interactions: $V(r) = D_e \\left(1 - e^{-a(r - r_e)}\\right)^2 - D_e$, where $r$ is the intermolecular distance between the centers of mass of two molecules, $D_e$ is the well depth, $a$ controls the potential width, and $r_e$ is the equilibrium distance.

**Background**

Morse Potential: Models attractive and repulsive interactions for diatomic systems.

**Data**: For CO (molar mass: 28.01 g/mol), use $D_e = 256.2$ kcal/mol, $a = 2.30$ Å$^{-1}$, $r_e = 1.128$ Å.

**Problems:**`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'MD Implementation', 
                description: `Implement an MD simulation for two CO molecules using the Morse potential. Run for 1000 steps at 300 K with a time step of 1 fs. Plot the intermolecular distance trajectory.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Energy Conservation', 
                description: `Calculate the average potential and kinetic energies. Verify energy conservation by computing the total energy variance.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Radial Distribution', 
                description: `Compute the radial distribution function (RDF) for the intermolecular distance. Estimate the most probable separation distance.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Parameter Effects', 
                description: `Increase $a$ by 20% to sharpen the potential well. Compare RDFs in a plot and discuss effects on molecular interactions, including the standard deviation of the potential energy.`, 
                maxPoints: 20 
            }]
        ])
    },

    {
        id: 10,
        section: 3,
        number: 1,
        title: "Plato's Geometric Equations",
        description: `Plato of Athens (c. 428 BC--348 BC) is a central figure in the history of philosophy. He founded in Athens the Academy, a school of philosophy and mathematics. A phrase reputedly above the door to the Academy, "let no one ignorant of geometry enter", now adorns the entrance to our intellectual home, the Mathematical Institute.

In *The Republic* (c. 375 BC), Plato enigmatically refers to an 'entire geometrical number'. The text is notoriously opaque, and scholars debate what exactly Plato means. The most popular opinion is that Plato's secret equations and expressions are divided into three main parts:

$$\\mathrm{sin}^2(x) = \\mathrm{cos}(x)\\mathrm{sin}(x)$$    
$$\\lim_{x \\to 0-} \\frac{d}{dx} |x| = -1$$

Plato has now requested your help. He is writing a sequel to *The Republic* (working title: *The Delian League Strikes Back*) and wishes to identify all the solutions to this equation. Give him the code that will generate the answer for him.`,
        maxPoints: 40,
        sections: new Map([
            ['1', { 
                title: 'Trigonometric Solution', 
                description: `Write a program for Plato that identifies the solves the **first equation** above, given that the answer should be general.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Limit Evaluation', 
                description: `Write a program that evaluates the value of the expression mentioned in the **second equation**.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 11,
        section: 3,
        number: 2,
        title: "Leibniz Calculus Problems",
        description: `Gottfried Wilhelm Leibniz (1646-1716) was a German polymath and philosopher. He made major contributions to mathematics, logic, and metaphysics. He is also considered one of the founders of modern political science and computer science. Leibniz's system of calculus, which he developed independently, is the one we primarily use today. His notation, which includes the integral sign ($\\int$) and the differential $dx$, is a testament to his clear and systematic approach. Leibniz's approach was more geometric, focusing on finding the area under a curve by summing up an infinite number of infinitesimally small rectangles.

Leibniz has now asked for your help. He wishes to solve some problems: integration of some function and solving differential equations. Unfortunately, he is too busy formulating the Pauli exclusion principle.`,
        maxPoints: 40,
        sections: new Map([
            ['1', { 
                title: 'Gaussian Integration', 
                description: `Integrate the Gaussian distribution:
$$\\int_{-\\infty}^{\\infty} \\frac{1}{\\sqrt{2\\pi}} \\exp \\left(-\\frac{1}{2}x^2\\right) dx$$`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Boundary Value Problem', 
                description: `Solve the differential equation:
$$x f''(x) + f'(x) = x^3$$
subject to:
$$f(1) = 0, \\quad f'(2) = 1$$`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 12,
        section: 3,
        number: 3,
        title: "Sieve of Eratosthenes",
        description: `Eratosthenes of Cyrene (c. 276 BC-194 BC) was a Greek polymath, making major contributions in mathematics, geography, poetry, and astronomy. He was the chief librarian of the Library of Alexandria, the greatest centre of learning in the classical world. He is remembered foremost for making the first accurate estimate of the circumference of the Earth. He did this by examining the shadows cast by rods of known length in Alexandria and Syene; his estimate was within one or two percent of the true value.

The Sieve of Eratosthenes is an algorithm for enumerating all prime numbers up to a given value $N$. The algorithm proceeds as follows:

1. Associate to each number $n=2, \\dots, N$ a Boolean flag for primality, true or false. Set all flags to true.
2. Fetch the first unprocessed number $n$ whose flag is true. (On the first iteration, this will be $n=2$.) Terminate if $n^2 > N$.
3. Mark all multiples of $n$ as composite by setting their flag to false.
4. Go to step 2.

On termination, the primes are those numbers with flag true.

Eratosthenes has now requested your help. He wants to count the number of prime numbers up to $N$, but he is too busy measuring the distance from Syene to Alexandria.

**Note:** Your program should define a function \\texttt{primes(N)} that returns a list of primes up to $N$.

**Hint:** It is more convenient to make the prime flag a numpy array with \\texttt{prime = numpy.array([True for n in range(N+1)])}, rather than with a list. This means you can use convenient slicing and striding notation for the update of all composite numbers for a given $n$.`,
        maxPoints: 40,
        sections: new Map([
            ['1', { 
                title: 'Basic Sieve Implementation', 
                description: `Write a program for Eratosthenes to calculate the number of primes $p \\leq 1,000,000$.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Large Number Optimization', 
                description: `Find the number of primes less than N, provided that $N \\leq 10^{19}$.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 13,
        section: 3,
        number: 4,
        title: "Weierstrass Function",
        description: `Karl Weierstrass was a Prussian mathematician who founded modern analysis. As an undergraduate in Bonn, he spent four years neglecting his studies of law in favour of fencing and drinking, and left without a degree. He became a teacher of mathematics in a secondary school; while on sick leave from teaching he wrote a paper on Abelian functions that won him an honourary doctorate from Königsberg, and he eventually was appointed a Professor at the University of Berlin.

In 1872 Weierstrass devised a function which is *everywhere continuous but nowhere differentiable*. At the time many mathematicians believed that continuous functions might be non-differentiable only on limited sets, and his counterexample tore up several erroneous proofs that had implicitly made this assumption. Weierstrass' function is given by
$$ f(x) = \\sum_{k=0}^{\\infty} a^k \\cos \\left( b^k \\pi x \\right)$$

where $a \\in (0, 1)$ and $b$ is a positive odd integer satisfying $ab > 1 + \\frac{3\\pi}{2}$. Poincaré denounced Weierstrass' work as "an outrage against common sense"; Hermite described it as a "lamentable scourge".

Weierstrass has now requested your help. To convince his contemporaries to overcome their incorrect intuition, he wishes to visualise this function, but ill health means he cannot do the necessary calculations.`,
        maxPoints: 40,
        sections: new Map([
            ['1', { 
                title: 'Function Visualization', 
                description: `Write a program for Weierstrass that visualises Weierstrass' function on $[-2,2]$ with default values of parameters $a = 0.3, b = 23$`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Infinite Series Approximation', 
                description: `Approximate the infinite sum by default with $100$ terms.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 14,
        section: 3,
        number: 5,
        title: "Trinity Nuclear Test Analysis",
        description: `Geoffrey Ingram Taylor (1886--1975) was an English mathematician and physicist. He came from a mathematical family; his Irish mother was the daughter of George Boole. He studied mathematics and physics at Cambridge under Whitehead, Hardy, and Thomson, and eventually won a faculty position at Cambridge in mathematical meteorology. He made many fundamental contributions to fluid mechanics, such as in Taylor-Couette flow, the Taylor-Green solution of the incompressible Navier-Stokes equations, and the Rayleigh-Taylor instability; the latter arises in everything from clouds to nuclear explosions to supernovae.

In 1950 Taylor published a famous paper estimating the initial energy $E$ released by the Trinity nuclear test, which was highly classified at the time, using timed photographs of the expansion of the spherical ball of fire from four unclassified sources. Solving the equations describing the conservation of momentum, mass, and energy, and the equation of state, he calculated that the radius of the ball $R(t)$ should be related to $E$, the density of air $\\rho_{\\text{air}}$, and time $t$ through
$$ R(t) \\propto E^{1/5} \\rho_{\\text{air}}^{-1/5} t^{2/5} $$
and via experiment estimated that the constant of proportionality was about 1.

Taylor has now asked for your help.

**Data Table**: Radius of the Trinity nuclear test as a function of time.

| t (ms) | R (m) | t (ms) | R (m) | t (ms) | R (m) |
|--------|-------|--------|-------|--------|-------|
| 0.1    | 11.1  | 1.36   | 42.8  | 15.0   | 106.5 |
| 0.24   | 19.9  | 1.50   | 44.4  | 25.0   | 130.0 |
| 0.38   | 25.4  | 1.65   | 46.0  | 34.0   | 145.0 |
| 0.52   | 28.8  | 1.79   | 46.9  | 53.0   | 175.0 |
| 0.66   | 31.9  | 1.93   | 48.7  | 62.0   | 185.0 |
| 0.80   | 34.2  | 3.26   | 59.0  |        |       |
| 0.94   | 36.3  | 3.53   | 61.1  |        |       |
| 1.08   | 38.9  | 3.80   | 62.9  |        |       |
| 1.22   | 41.0  | 4.07   | 64.3  |        |       |
|        |       | 4.34   | 65.6  |        |       |
|        |       | 4.61   | 67.3  |        |       |

*Hint: a more recent re-analysis by Hanson et al. (2016) gives an estimate of $E = 22.1 ± 2.7$ kt.*`,
        maxPoints: 60,
        sections: new Map([
            ['1', { 
                title: 'Energy Yield Calculation', 
                description: `Taking $\\rho_{\\text{air}} = 1.25$ kg m$^{-3}$, write a Python program to estimate the yield of the Trinity nuclear explosion from the data in the table, gathered by Taylor in 1949.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Unit Conversion', 
                description: `State your answer both in Joules and in kilotons of TNT, where the energy released by 1 kiloton of TNT is $4.184 \\times 10^{12}$ J.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Data Visualization', 
                description: `Using your code, plot the time and Radius data set from the table.`, 
                maxPoints: 20 
            }]
        ])
    },

    {
        id: 15,
        section: 4,
        number: 1,
        title: "Needleman-Wunsch Alignment",
        description: `Dr. Mohamed, a computational biologist working at the Genomics Institute, is analyzing genetic samples collected from two populations of Pacific island birds. These birds are closely related but have undergone slight genetic divergence due to geographic isolation over the last 500 years.

The research team has extracted DNA fragments from each bird population and provided you with two sequences to compare:

- **Sequence 1 (Population A):** \\texttt{ATGCGTACCTGACTGACCGTACGATGCTAGC}
- **Sequence 2 (Population B):** \\texttt{ATGCCGTACTGACGACGTGACGATGCTTGC}

Your task is to help Dr. Mohamed quantify the evolutionary similarity between these two sequences using the **Needleman-Wunsch algorithm** for global alignment.

**Scoring Scheme:**
- Match (same nucleotide in both sequences): +2
- Mismatch (different nucleotides): -3
- Gap penalty (insertion/deletion): -1

**Biological Context Note:**
In sequence alignment, a global alignment compares two sequences from start to end, optimizing for the overall similarity rather than just matching the most similar segment. This is particularly useful in evolutionary biology when comparing full-length genes or genomes.`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'Algorithm Implementation', 
                description: `Implement the Needleman-Wunsch algorithm in Python using the given scoring scheme, building the DP scoring matrix step-by-step.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Matrix Initialization', 
                description: `Initialize the first row and first column using the gap penalty to account for sequence prefixes being aligned with gaps.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Traceback Function', 
                description: `Implement a traceback function to retrieve all optimal alignments that yield the highest possible global alignment score for these sequences.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Results Output', 
                description: `Print: (1) The final alignment matrix (DP matrix), (2) The optimal alignment score, (3) All optimal alignments (s1 over s2 with "-" for gaps).`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 16,
        section: 4,
        number: 2,
        title: "DNA Sequence Validation",
        description: `Dr. Mohamed is leading a project to verify DNA sequences submitted by partner laboratories before uploading them to the central gene repository.

A collaborator has submitted the following coding DNA sequence (CDS) for a newly discovered bacterial enzyme:

\\texttt{ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG}

As part of the Bioinformatics Quality Control (QC) pipeline, each CDS must pass several validation checks to ensure biological plausibility:

**QC Rules:**
1. **Alphabet check:** Sequence must contain only valid nucleotides {A, C, G, T}.
2. **Length multiple of 3:** CDS length must be divisible by 3.
3. **Start codon:** Sequence must begin with the start codon (ATG).
4. **Stop codon:** Sequence must end with a valid stop codon {TAA, TAG, TGA}.
5. **Internal stops:** No in-frame stop codons allowed except at the end.
6. **GC content:** GC percentage must lie within a species-specific range (40-60%).`,
        maxPoints: 100,
        sections: new Map([
            ['1', { 
                title: 'Basic Validation', 
                description: `Write a Python function \\texttt{qc_gene(cds, gc_min, gc_max)} that accepts a DNA coding sequence and applies the QC rules above. Check valid nucleotides, length divisible by 3, and start codon.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Codon Analysis', 
                description: `Validate reading frame and stop codons. Check that the sequence ends with a valid stop codon and has no internal stop codons.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Translation Check', 
                description: `Verify proper translation without internal stops. Ensure the sequence can be properly translated from start to stop.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'GC Content', 
                description: `Calculate and validate GC percentage (40-60%). Compute the GC content and check if it falls within the acceptable range.`, 
                maxPoints: 20 
            }],
            ['5', { 
                title: 'QC Report', 
                description: `Generate comprehensive quality control report. Return a report with: sequence length, GC percentage, whether any problems were detected, and a list of detected problems (if any). Apply to the provided sequence and print all results.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 17,
        section: 4,
        number: 3,
        title: "Codon Adaptation Index (CAI)",
        description: `Dr. Mohamed Abdeltawab, a molecular biologist at the Institute for Synthetic Genomics, is designing a synthetic gene intended for high-level expression in *Escherichia coli*. Before ordering the DNA from a gene synthesis company, he wants to evaluate how well the gene's codon usage matches the optimal codon preferences of *E. coli*.

A common measure for this is the **Codon Adaptation Index (CAI)**, a value ranging from 0 to 1:
- CAI ≈ 1.0: gene uses highly preferred codons (likely efficient expression).
- CAI ≈ 0.0: gene uses rare codons (likely poor expression).

**Problem Data**

**Target gene coding sequence (CDS):**
\\texttt{ATGGCTGCCGCTGCGGCTTAA}

**Reference CDS sequences (highly expressed genes in *E. coli*):**
- \\texttt{ATGGCTGCTGCTGCTTAA}
- \\texttt{ATGGCCGCCGCCGCCGCTAA}
- \\texttt{ATGGAGGAGGAGGATAA}
- \\texttt{ATGCGTCGTCGTAGTAA}

**CAI Calculation Rules:**
1. Divide sequences into codons (triplets), ignoring the terminal stop codon.
2. Count codon frequencies in the reference set.
3. For each amino acid, identify the most frequently used codon.
4. Compute the relative adaptiveness $w_i$ of each codon:
   $$w_i = \\frac{\\text{frequency of codon } i}{\\max(\\text{frequency of codons for that amino acid})}$$
5. Calculate the Codon Adaptation Index (CAI) for the target gene:
   $$CAI = \\left( \\prod_{i=1}^{n} w_i \\right)^{1/n}$$
   where $n$ is the number of codons in the target gene (excluding stop codons).`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'Codon Frequency Analysis', 
                description: `Write a Python program to implement the CAI calculation. Count codon frequencies in the reference set and build a codon frequency table.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Relative Adaptiveness', 
                description: `For each amino acid, identify the most frequently used codon and compute the relative adaptiveness values ($w_i$) for all codons.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'CAI Calculation', 
                description: `Calculate the Codon Adaptation Index (CAI) for the target gene using the geometric mean formula.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Results Report', 
                description: `Apply the CAI calculation to the given target gene using the provided reference sequences. Print: codon frequency table from the reference set, relative adaptiveness values ($w_i$), and final CAI value for the target gene.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 18,
        section: 4,
        number: 4,
        title: "Sequence Clustering with CD-HIT",
        description: `At the Pacific Ocean Biodiversity Initiative, a team of marine bioinformaticians is processing thousands of DNA and protein sequences collected from deep-sea expeditions. These sequences, derived from environmental samples, include both:
- Nucleotide fragments from metagenomes.
- Protein sequences predicted from assembled genomes.

To avoid redundancy and improve downstream functional annotation, the team needs to cluster sequences based on their percentage identity. This will produce a non-redundant database that preserves all unique variants without retaining nearly identical duplicates.

**CD-HIT Suite:**
- **CD-HIT** → for clustering protein sequences.
- **CD-HIT-EST** → for clustering nucleotide sequences.

**Important Notes:**
1. The choice of executable depends on the type of sequence (protein vs. nucleotide).
2. CD-HIT uses a user-defined sequence identity threshold (\\texttt{-c}, e.g., 0.9 for 90% identity).
3. The allowable word size (\\texttt{-n}) is constrained by the identity threshold:
   - Higher thresholds allow larger word sizes (faster).
   - Lower thresholds require smaller word sizes (more sensitive).`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'Tool Selection', 
                description: `Select the appropriate executable (\\texttt{cd-hit} or \\texttt{cd-hit-est}) depending on the input sequence type (protein vs nucleotide).`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'Clustering Implementation', 
                description: `Cluster the provided sequences at a given identity cutoff. Implement proper parameter selection for word size based on identity threshold.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'Cluster Analysis', 
                description: `Analyze clustering results and extract representative sequences of each cluster.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Results Report', 
                description: `Report: number of clusters formed, representative sequences of each cluster, and distribution of cluster sizes.`, 
                maxPoints: 20 
            }]
        ])
    },
    {
        id: 19,
        section: 4,
        number: 5,
        title: "SNP Rate Analysis",
        description: `At the Global Plant Genetics Laboratory, researchers are comparing long genomic segments from two closely related plant cultivars. To estimate genetic differences, they compute the **SNP rate** --- the proportion of nucleotide positions at which the two sequences differ.

**Data Provided**
Two aligned DNA sequences of equal length:

- \\texttt{seq1 = "ACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTAAAAAGCTTGCAACGTACGTACGTACGTACGTTGCAACGTAAGTGCAGCGGTACGTTGCACCGTACGTACGTACGTACGTTGCAACGTACGTACGTGCGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTG"}

- \\texttt{seq2 = "ACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACATACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACATACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGCTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTGCAACGTACGTACGTACGTACGTTG"}

**Definition of SNP**
A **single nucleotide polymorphism (SNP)** is a position where the two sequences differ at the nucleotide level.
- Ambiguous bases (e.g., N, R, Y) may be excluded if filtering is enabled.
- Gaps ("-") may also be excluded if filtering is enabled.

**SNP Rate Formula**
The SNP rate is calculated as:
$$\\text{SNP Rate} = \\frac{\\text{Number of SNPs}}{\\text{Number of positions compared}}$$`,
        maxPoints: 80,
        sections: new Map([
            ['1', { 
                title: 'Sequence Comparison', 
                description: `Implement a Python function to compare the two aligned sequences position by position and identify SNPs.`, 
                maxPoints: 20 
            }],
            ['2', { 
                title: 'SNP Detection', 
                description: `Count the number of single nucleotide polymorphisms (SNPs) between the two sequences, handling ambiguous bases and gaps appropriately.`, 
                maxPoints: 20 
            }],
            ['3', { 
                title: 'SNP Rate Calculation', 
                description: `Calculate the SNP rate using the formula: SNP Rate = Number of SNPs / Number of positions compared.`, 
                maxPoints: 20 
            }],
            ['4', { 
                title: 'Results Output', 
                description: `Output: total sequence length, number of positions compared, number of SNPs detected, and final SNP rate.`, 
                maxPoints: 20 
            }]
        ])
    }
];

const teams = [
    {
        teamId: 'TEAM001',
        password: 'Debug2025!#Bug',
        teamName: 'Debug the bug',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM002',
        password: 'Algo#Ninja2025',
        teamName: 'AlgoNinjas',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM003',
        password: 'Hack@Rathim25',
        teamName: 'Hackorathim',
        school: 'STEM October'
    },
    {
        teamId: 'TEAM004',
        password: 'Team18*EOCS!',
        teamName: '18',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM005',
        password: '3la_Allah#25',
        teamName: '3la Allah',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM006',
        password: 'Logic$Axis25',
        teamName: 'LogicAxis',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM007',
        password: 'Biblio*Tech25',
        teamName: 'Bibliotech',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM008',
        password: 'Future@2025!',
        teamName: 'Future',
        school: 'STEM New Cairo'
    },
    {
        teamId: 'TEAM009',
        password: 'ByteMe#2025',
        teamName: 'byte me',
        school: 'STEM Gharbiya'
    },
    {
        teamId: 'TEAM010',
        password: 'EOCS@Acers25',
        teamName: 'EOCS Acers',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM011',
        password: 'Win*Win2025',
        teamName: 'Win Win',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM012',
        password: 'To#Finals25',
        teamName: 'To Finals',
        school: 'EOCS Competition'
    },
    {
        teamId: 'TEAM013',
        password: 'Cooked@Team25',
        teamName: 'The cooked team',
        school: 'EOCS Competition'
    }
];

const seedCompetitionData = async () => {
    try {
        await connectDB();
        await Problem.deleteMany({});
        await Team.deleteMany({});
        await Score.deleteMany({});
        
        for (const problemData of problems) {
            const problem = new Problem(problemData);
            await problem.save();
        }
        
        const createdTeams = [];
        for (const teamData of teams) {
            const team = new Team(teamData);
            const savedTeam = await team.save();
            createdTeams.push(savedTeam);
        }
        
        const scorePromises = teams.map(async (teamData) => {
            const score = new Score({
                teamId: teamData.teamId,
                totalScore: 0,
                totalPenalty: 0,
                problems: new Map()
            });
            
            for (const problemData of problems) {
                const problemMap = new Map();
                for (const [sectionKey] of problemData.sections) {
                    problemMap.set(sectionKey, {
                        status: 'not_attempted',
                        score: 0,
                        penalty: 0,
                        attempts: 0,
                        submittedAt: null
                    });
                }
                score.problems.set(problemData.id.toString(), {
                    status: 'not_attempted',
                    totalScore: 0,
                    totalPenalty: 0,
                    sections: problemMap
                });
            }
            return await score.save();
        });
        
        await Promise.all(scorePromises);
        console.log('Seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedCompetitionData();
