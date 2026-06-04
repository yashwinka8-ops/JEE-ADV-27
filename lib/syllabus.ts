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
  groupName: string;
  groupDescription?: string;
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

interface ChapterDef {
  id: string;
  name: string;
  groupName: string;
  groupDescription?: string;
}

const MATHS_CHAPTERS: ChapterDef[] = [
  // Phase 1
  { id: 'maths-trigonometry', name: 'Trigonometry', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-functions', name: 'Functions', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-inverse-trig', name: 'Inverse Trigonometric Functions', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-quadratic', name: 'Quadratic Equations', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-sequence-series', name: 'Sequence & Series', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-limits', name: 'Limits', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-continuity', name: 'Continuity', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-differentiability', name: 'Differentiability', groupName: 'Phase 1 (Foundation + High ROI)' },
  { id: 'maths-aod', name: 'Applications of Derivatives', groupName: 'Phase 1 (Foundation + High ROI)' },

  // Phase 2
  { id: 'maths-matrices', name: 'Matrices', groupName: 'Phase 2 (Easy Scoring)' },
  { id: 'maths-determinants', name: 'Determinants', groupName: 'Phase 2 (Easy Scoring)' },
  { id: 'maths-vectors', name: 'Vector Algebra', groupName: 'Phase 2 (Easy Scoring)' },
  { id: 'maths-3d-geometry', name: '3D Geometry', groupName: 'Phase 2 (Easy Scoring)' },

  // Phase 3
  { id: 'maths-straight-line', name: 'Straight Line', groupName: 'Phase 3 (Weak Areas)' },
  { id: 'maths-circle', name: 'Circle', groupName: 'Phase 3 (Weak Areas)' },
  { id: 'maths-permutation-combination', name: 'Permutation & Combination', groupName: 'Phase 3 (Weak Areas)' },
  { id: 'maths-probability', name: 'Probability', groupName: 'Phase 3 (Weak Areas)' },

  // Phase 4
  { id: 'maths-complex-numbers', name: 'Complex Numbers', groupName: 'Phase 4 (Algebra Completion)' },
  { id: 'maths-binomial', name: 'Binomial Theorem', groupName: 'Phase 4 (Algebra Completion)' },

  // Phase 5
  { id: 'maths-indefinite-integration', name: 'Indefinite Integration', groupName: 'Phase 5 (Calculus Completion)' },
  { id: 'maths-definite-integration', name: 'Definite Integration', groupName: 'Phase 5 (Calculus Completion)' },
  { id: 'maths-area-under-curve', name: 'Area Under Curve', groupName: 'Phase 5 (Calculus Completion)' },
  { id: 'maths-differential-equations', name: 'Differential Equations', groupName: 'Phase 5 (Calculus Completion)' },

  // Phase 6
  { id: 'maths-parabola', name: 'Parabola', groupName: 'Phase 6 (Conics)' },
  { id: 'maths-ellipse', name: 'Ellipse', groupName: 'Phase 6 (Conics)' },
  { id: 'maths-hyperbola', name: 'Hyperbola', groupName: 'Phase 6 (Conics)' },

  // Phase 7
  { id: 'maths-sets', name: 'Sets', groupName: 'Phase 7 (Small Chapters)' },
  { id: 'maths-relations', name: 'Relations', groupName: 'Phase 7 (Small Chapters)' },
  { id: 'maths-statistics', name: 'Statistics', groupName: 'Phase 7 (Small Chapters)' },
  { id: 'maths-mathematical-reasoning', name: 'Mathematical Reasoning', groupName: 'Phase 7 (Small Chapters)' },
];

const CHEMISTRY_CHAPTERS: ChapterDef[] = [
  // Core sequence
  { id: 'chemistry-chemical-bonding', name: 'Chemical Bonding', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-periodic-table', name: 'Periodic Table', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-mole-concept', name: 'Mole Concept', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-equilibrium', name: 'Equilibrium', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-thermodynamics', name: 'Thermodynamics', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-electrochemistry', name: 'Electrochemistry', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-chemical-kinetics', name: 'Chemical Kinetics', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-goc', name: 'GOC', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-hydrocarbons', name: 'Hydrocarbons', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-haloalkanes-haloarenes', name: 'Haloalkanes & Haloarenes', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-alcohols-phenols-ethers', name: 'Alcohols, Phenols & Ethers', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-aldehydes-ketones', name: 'Aldehydes & Ketones', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-amines', name: 'Amines', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-biomolecules', name: 'Biomolecules', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-d-block', name: 'd-Block', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-f-block', name: 'f-Block', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-metallurgy', name: 'Metallurgy', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-atomic-structure', name: 'Atomic Structure', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-solutions', name: 'Solutions', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-coordination-compounds', name: 'Coordination Compounds', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-solid-state', name: 'Solid State', groupName: 'Chemistry Core Order' },
  { id: 'chemistry-surface-chemistry', name: 'Surface Chemistry', groupName: 'Chemistry Core Order' },

  // Last
  { id: 'chemistry-polymers', name: 'Polymers', groupName: 'Last' },
  { id: 'chemistry-everyday-life', name: 'Chemistry in Everyday Life', groupName: 'Last' },
  { id: 'chemistry-environmental', name: 'Environmental Chemistry', groupName: 'Last' },
];

const PHYSICS_CHAPTERS: ChapterDef[] = [
  // Block P1
  { id: 'physics-kinematics', name: 'Kinematics', groupName: 'Block P1 (Class 11 Foundation)', groupDescription: 'Needed for almost everything in mechanics.' },
  { id: 'physics-nlm', name: 'NLM', groupName: 'Block P1 (Class 11 Foundation)', groupDescription: 'Needed for almost everything in mechanics.' },
  { id: 'physics-wpe', name: 'WPE', groupName: 'Block P1 (Class 11 Foundation)', groupDescription: 'Needed for almost everything in mechanics.' },

  // Block P2
  { id: 'physics-electrostatics', name: 'Electrostatics', groupName: 'Block P2 (Class 12 High ROI)', groupDescription: 'Very high weightage and still fresh from Class 12.' },
  { id: 'physics-current-electricity', name: 'Current Electricity', groupName: 'Block P2 (Class 12 High ROI)', groupDescription: 'Very high weightage and still fresh from Class 12.' },

  // Block P3
  { id: 'physics-com', name: 'COM & Collision', groupName: 'Block P3 (Class 11 Advanced Mechanics)', groupDescription: 'Mechanics foundation is already built.' },
  { id: 'physics-rotation', name: 'Rotation', groupName: 'Block P3 (Class 11 Advanced Mechanics)', groupDescription: 'Mechanics foundation is already built.' },

  // Block P4
  { id: 'physics-magnetic-effects', name: 'Magnetic Effects of Current', groupName: 'Block P4 (Class 12 Magnetism)' },
  { id: 'physics-magnetism-matter', name: 'Magnetism & Matter', groupName: 'Block P4 (Class 12 Magnetism)' },
  { id: 'physics-emi', name: 'EMI', groupName: 'Block P4 (Class 12 Magnetism)' },
  { id: 'physics-ac', name: 'AC', groupName: 'Block P4 (Class 12 Magnetism)' },

  // Block P5
  { id: 'physics-thermal-properties', name: 'Thermal Properties', groupName: 'Block P5 (Class 11 Thermal)' },
  { id: 'physics-thermodynamics', name: 'Thermodynamics', groupName: 'Block P5 (Class 11 Thermal)' },
  { id: 'physics-ktg', name: 'KTG', groupName: 'Block P5 (Class 11 Thermal)' },

  // Block P6
  { id: 'physics-dual-nature', name: 'Dual Nature', groupName: 'Block P6 (Class 12 Modern Physics)', groupDescription: 'Easy scoring block.' },
  { id: 'physics-atoms', name: 'Atoms', groupName: 'Block P6 (Class 12 Modern Physics)', groupDescription: 'Easy scoring block.' },
  { id: 'physics-nuclei', name: 'Nuclei', groupName: 'Block P6 (Class 12 Modern Physics)', groupDescription: 'Easy scoring block.' },
  { id: 'physics-semiconductors', name: 'Semiconductors', groupName: 'Block P6 (Class 12 Modern Physics)', groupDescription: 'Easy scoring block.' },

  // Block P7
  { id: 'physics-shm', name: 'SHM', groupName: 'Block P7 (Class 11 Oscillations)' },
  { id: 'physics-waves', name: 'Waves', groupName: 'Block P7 (Class 11 Oscillations)' },

  // Block P8
  { id: 'physics-ray-optics', name: 'Ray Optics', groupName: 'Block P8 (Class 12 Optics)' },
  { id: 'physics-wave-optics', name: 'Wave Optics', groupName: 'Block P8 (Class 12 Optics)' },

  // Block P9
  { id: 'physics-gravitation', name: 'Gravitation', groupName: 'Block P9 (Class 11 Remaining)' },
  { id: 'physics-fluids', name: 'Fluids', groupName: 'Block P9 (Class 11 Remaining)' },

  // Block P10
  { id: 'physics-units-dimensions', name: 'Units & Dimensions', groupName: 'Block P10 (Final Small Chapters)' },
  { id: 'physics-error-analysis', name: 'Error Analysis', groupName: 'Block P10 (Final Small Chapters)' },
  { id: 'physics-experimental-physics', name: 'Experimental Physics', groupName: 'Block P10 (Final Small Chapters)' },
];

const buildChapters = (subject: 'physics' | 'chemistry' | 'maths', defs: ChapterDef[]): Chapter[] => {
  return defs.map((def) => ({
    id: def.id,
    subject,
    name: def.name,
    mastery: 'not-started',
    groupName: def.groupName,
    groupDescription: def.groupDescription,
    topics: CHECKLISTS[subject].map((t, idx) => ({
      id: `${def.id}-t${idx}`,
      name: t,
      done: false
    })),
  }));
};

export const initialSyllabus: Chapter[] = [
  ...buildChapters('physics', PHYSICS_CHAPTERS),
  ...buildChapters('chemistry', CHEMISTRY_CHAPTERS),
  ...buildChapters('maths', MATHS_CHAPTERS)
];
