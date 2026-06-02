export type MasteryLevel = 'not-started' | 'learning' | 'practiced' | 'mastered';

export interface Topic {
  id: string;
  name: string;
  done: boolean;
}

export interface Chapter {
  id: string;
  subject: 'physics' | 'chemistry' | 'maths';
  name: string;
  topics: Topic[];
  mastery: MasteryLevel;
}

const CHECKLISTS = {
  physics: [
    'Lectures & Class Notes',
    'Physics Galaxy (Solved Examples)',
    'Allen Modules (Practice)',
    'HC Verma',
    'JEE Mains PYQs',
    'JEE Advanced PYQs',
    'Short Notes Revision',
  ],
  chemistry: [
    'Lectures & Class Notes',
    'Solved Examples (TBD)',
    'Allen Modules (Practice)',
    'Narendra Avasthi / MS Chouhan',
    'JEE Mains PYQs',
    'JEE Advanced PYQs',
    'Short Notes Revision',
  ],
  maths: [
    'Lectures & Class Notes',
    'Cengage (Solved Examples)',
    'Allen Modules (Practice)',
    'Sameer Bansal Calculus / Black Book',
    'JEE Mains PYQs',
    'JEE Advanced PYQs',
    'Short Notes Revision',
  ]
};

const createChapters = (subject: 'physics' | 'chemistry' | 'maths', names: string[]): Chapter[] => {
  return names.map((name, i) => ({
    id: `${subject}-${i}`,
    subject,
    name,
    mastery: 'not-started',
    topics: CHECKLISTS[subject].map((t, idx) => ({
      id: `${subject}-${i}-t${idx}`,
      name: t,
      done: false
    })),
  }));
};

export const initialSyllabus: Chapter[] = [
  ...createChapters('physics', [
    'Units and Measurements',
    'Kinematics',
    'Laws of Motion',
    'Work, Energy, and Power',
    'System of Particles and Rotational Motion',
    'Gravitation',
    'Mechanical Properties of Solids & Fluids',
    'Thermal Physics & Thermodynamics',
    'Kinetic Theory of Gases',
    'Oscillations (SHM)',
    'Waves',
    'Electrostatics',
    'Capacitance',
    'Current Electricity',
    'Magnetic Effects of Current',
    'Magnetism and Matter',
    'Electromagnetic Induction (EMI)',
    'Alternating Current (AC)',
    'Electromagnetic Waves',
    'Ray Optics and Optical Instruments',
    'Wave Optics',
    'Dual Nature of Radiation and Matter',
    'Atoms and Nuclei',
    'Electronic Devices',
  ]),
  ...createChapters('chemistry', [
    'Some Basic Concepts of Chemistry',
    'Atomic Structure',
    'Chemical Thermodynamics',
    'Chemical and Ionic Equilibrium',
    'Redox Reactions',
    'Solutions',
    'Electrochemistry',
    'Chemical Kinetics',
    'Classification of Elements and Periodicity',
    'Chemical Bonding and Molecular Structure',
    'd and f Block Elements',
    'Coordination Compounds',
    'p-Block Elements',
    'Purification and Characterization of Organic Compounds',
    'General Organic Chemistry (GOC)',
    'Isomerism',
    'Hydrocarbons',
    'Haloalkanes and Haloarenes',
    'Alcohols, Phenols, and Ethers',
    'Aldehydes and Ketones',
    'Carboxylic Acids and Derivatives',
    'Amines',
    'Biomolecules',
  ]),
  ...createChapters('maths', [
    'Basic of Mathematics',
    'Sets and Relations',
    'Quadratic Equation',
    'Complex Number',
    'Sequences and Series',
    'Permutation Combination',
    'Binomial Theorem',
    'Mathematical Reasoning',
    'Statistics',
    'Matrices',
    'Determinants',
    'Probability',
    'Functions',
    'Limits',
    'Continuity and Differentiability',
    'Differentiation',
    'Application of Derivatives',
    'Indefinite Integration',
    'Definite Integration',
    'Area Under Curves',
    'Differential Equations',
    'Straight Lines',
    'Circle',
    'Parabola',
    'Ellipse',
    'Hyperbola',
    'Trigonometric Ratios & Identities',
    'Trigonometric Equations',
    'Heights and Distances',
    'Inverse Trigonometric Functions',
    'Properties of Triangles',
    'Vector Algebra',
    'Three-Dimensional Geometry',
  ])
];
