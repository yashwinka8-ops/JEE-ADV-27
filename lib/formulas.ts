export interface Formula {
  id: string;
  subject: 'physics' | 'chemistry' | 'maths';
  chapter: string;
  title: string;
  latex: string;
  description: string;
  bookmarked?: boolean;
}

export const formulaBank: Formula[] = [
  // ── PHYSICS ──────────────────────────────────────────────────
  { id: 'f1', subject: 'physics', chapter: 'Kinematics', title: 'Equations of Motion', latex: 'v = u + at,\\quad s = ut + \\tfrac{1}{2}at^2,\\quad v^2 = u^2 + 2as', description: 'Three kinematic equations for uniform acceleration' },
  { id: 'f2', subject: 'physics', chapter: 'Kinematics', title: 'Projectile Range', latex: 'R = \\frac{u^2 \\sin 2\\theta}{g}', description: 'Horizontal range of a projectile' },
  { id: 'f3', subject: 'physics', chapter: 'Mechanics', title: 'Newton\'s Second Law', latex: 'F = ma', description: 'Net force equals mass times acceleration' },
  { id: 'f4', subject: 'physics', chapter: 'Mechanics', title: 'Work-Energy Theorem', latex: 'W_{net} = \\Delta KE = \\tfrac{1}{2}mv^2 - \\tfrac{1}{2}mu^2', description: 'Net work done equals change in kinetic energy' },
  { id: 'f5', subject: 'physics', chapter: 'Gravitation', title: 'Newton\'s Law of Gravitation', latex: 'F = \\frac{Gm_1 m_2}{r^2}', description: 'Gravitational force between two masses' },
  { id: 'f6', subject: 'physics', chapter: 'Gravitation', title: 'Orbital Velocity', latex: 'v_o = \\sqrt{\\frac{GM}{r}}', description: 'Velocity for circular orbit at radius r' },
  { id: 'f7', subject: 'physics', chapter: 'SHM', title: 'Angular Frequency', latex: '\\omega = 2\\pi f = \\sqrt{\\frac{k}{m}}', description: 'Angular frequency of a spring-mass system' },
  { id: 'f8', subject: 'physics', chapter: 'SHM', title: 'Time Period of Simple Pendulum', latex: 'T = 2\\pi\\sqrt{\\frac{l}{g}}', description: 'Period of a simple pendulum for small oscillations' },
  { id: 'f9', subject: 'physics', chapter: 'Electrostatics', title: 'Coulomb\'s Law', latex: 'F = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q_1 q_2}{r^2}', description: 'Force between two point charges' },
  { id: 'f10', subject: 'physics', chapter: 'Electrostatics', title: 'Electric Field of Point Charge', latex: 'E = \\frac{1}{4\\pi\\varepsilon_0}\\frac{q}{r^2}', description: 'Electric field at distance r from point charge q' },
  { id: 'f11', subject: 'physics', chapter: 'Electrostatics', title: 'Capacitance', latex: 'C = \\frac{Q}{V} = \\varepsilon_0 \\frac{A}{d}', description: 'Capacitance of a parallel plate capacitor' },
  { id: 'f12', subject: 'physics', chapter: 'Current Electricity', title: 'Ohm\'s Law', latex: 'V = IR', description: 'Voltage, current and resistance relationship' },
  { id: 'f13', subject: 'physics', chapter: 'Magnetism', title: 'Biot-Savart Law', latex: 'dB = \\frac{\\mu_0}{4\\pi}\\frac{I\\,dl\\sin\\theta}{r^2}', description: 'Magnetic field due to current element' },
  { id: 'f14', subject: 'physics', chapter: 'Magnetism', title: 'Force on Current in Field', latex: 'F = BIL\\sin\\theta', description: 'Force on a current-carrying conductor in magnetic field' },
  { id: 'f15', subject: 'physics', chapter: 'Optics', title: 'Lens Formula', latex: '\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u}', description: 'Thin lens equation (New Cartesian sign convention)' },
  { id: 'f16', subject: 'physics', chapter: 'Optics', title: 'Snell\'s Law', latex: 'n_1 \\sin\\theta_1 = n_2 \\sin\\theta_2', description: 'Refraction at an interface' },
  { id: 'f17', subject: 'physics', chapter: 'Wave Optics', title: 'Young\'s Double Slit Fringe Width', latex: '\\beta = \\frac{\\lambda D}{d}', description: 'Fringe width in Young\'s double slit experiment' },
  { id: 'f18', subject: 'physics', chapter: 'Modern Physics', title: 'Photoelectric Effect', latex: 'KE_{max} = h\\nu - \\phi', description: 'Maximum kinetic energy of photoelectrons' },
  { id: 'f19', subject: 'physics', chapter: 'Modern Physics', title: 'de Broglie Wavelength', latex: '\\lambda = \\frac{h}{mv} = \\frac{h}{p}', description: 'de Broglie wavelength of a particle' },
  { id: 'f20', subject: 'physics', chapter: 'Thermodynamics', title: 'First Law of Thermodynamics', latex: '\\Delta U = Q - W', description: 'Change in internal energy equals heat added minus work done' },

  // ── CHEMISTRY ────────────────────────────────────────────────
  { id: 'c1', subject: 'chemistry', chapter: 'Chemical Kinetics', title: 'Rate Law', latex: 'r = k[A]^m[B]^n', description: 'Rate law expression for reaction aA + bB → products' },
  { id: 'c2', subject: 'chemistry', chapter: 'Chemical Kinetics', title: 'Arrhenius Equation', latex: 'k = Ae^{-E_a/RT}', description: 'Temperature dependence of rate constant' },
  { id: 'c3', subject: 'chemistry', chapter: 'Chemical Kinetics', title: 'Half Life (1st Order)', latex: 't_{1/2} = \\frac{0.693}{k}', description: 'Half-life for first order reaction' },
  { id: 'c4', subject: 'chemistry', chapter: 'Thermodynamics', title: 'Gibbs Free Energy', latex: '\\Delta G = \\Delta H - T\\Delta S', description: 'Gibbs energy determines spontaneity' },
  { id: 'c5', subject: 'chemistry', chapter: 'Thermodynamics', title: 'Hess\'s Law', latex: '\\Delta H_{rxn} = \\sum \\Delta H_f(products) - \\sum \\Delta H_f(reactants)', description: 'Enthalpy of reaction from formation enthalpies' },
  { id: 'c6', subject: 'chemistry', chapter: 'Equilibrium', title: 'Kp and Kc Relation', latex: 'K_p = K_c(RT)^{\\Delta n_g}', description: 'Relation between pressure and concentration equilibrium constants' },
  { id: 'c7', subject: 'chemistry', chapter: 'Electrochemistry', title: 'Nernst Equation', latex: 'E = E^\\circ - \\frac{RT}{nF}\\ln Q', description: 'Cell potential under non-standard conditions' },
  { id: 'c8', subject: 'chemistry', chapter: 'Electrochemistry', title: 'Faraday\'s Law', latex: 'm = \\frac{M \\cdot I \\cdot t}{n \\cdot F}', description: 'Mass deposited in electrolysis' },
  { id: 'c9', subject: 'chemistry', chapter: 'Solutions', title: 'Raoult\'s Law', latex: 'P_A = x_A P_A^\\circ', description: 'Vapour pressure of solvent over solution' },
  { id: 'c10', subject: 'chemistry', chapter: 'Solutions', title: 'Boiling Point Elevation', latex: '\\Delta T_b = K_b \\cdot m', description: 'Elevation in boiling point due to solute' },

  // ── MATHEMATICS ──────────────────────────────────────────────
  { id: 'm1', subject: 'maths', chapter: 'Quadratics', title: 'Quadratic Formula', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', description: 'Roots of ax² + bx + c = 0' },
  { id: 'm2', subject: 'maths', chapter: 'Quadratics', title: 'Discriminant', latex: 'D = b^2 - 4ac', description: 'Determines nature of roots' },
  { id: 'm3', subject: 'maths', chapter: 'Sequences', title: 'Sum of AP', latex: 'S_n = \\frac{n}{2}[2a + (n-1)d]', description: 'Sum of first n terms of an AP' },
  { id: 'm4', subject: 'maths', chapter: 'Sequences', title: 'Sum of GP', latex: 'S_n = \\frac{a(r^n - 1)}{r - 1},\\quad r \\neq 1', description: 'Sum of first n terms of a GP' },
  { id: 'm5', subject: 'maths', chapter: 'Binomial Theorem', title: 'General Term', latex: 'T_{r+1} = \\binom{n}{r} a^{n-r} b^r', description: '(r+1)th term in expansion of (a+b)ⁿ' },
  { id: 'm6', subject: 'maths', chapter: 'Complex Numbers', title: 'Euler\'s Formula', latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta', description: 'Euler\'s formula connecting complex exponentials and trig' },
  { id: 'm7', subject: 'maths', chapter: 'Coordinate Geometry', title: 'Distance Formula', latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}', description: 'Distance between two points' },
  { id: 'm8', subject: 'maths', chapter: 'Circles', title: 'Equation of Circle', latex: '(x - h)^2 + (y - k)^2 = r^2', description: 'Standard form with centre (h,k) and radius r' },
  { id: 'm9', subject: 'maths', chapter: 'Calculus', title: 'Fundamental Theorem', latex: '\\int_a^b f(x)\\,dx = F(b) - F(a)', description: 'Definite integral via antiderivative' },
  { id: 'm10', subject: 'maths', chapter: 'Calculus', title: 'Chain Rule', latex: '\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}', description: 'Derivative of composite functions' },
  { id: 'm11', subject: 'maths', chapter: 'Calculus', title: 'Product Rule', latex: '\\frac{d}{dx}[uv] = u\'v + uv\'', description: 'Derivative of a product of two functions' },
  { id: 'm12', subject: 'maths', chapter: 'Trigonometry', title: 'Sine Rule', latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R', description: 'Relates sides and angles of a triangle' },
  { id: 'm13', subject: 'maths', chapter: 'Trigonometry', title: 'Cosine Rule', latex: 'c^2 = a^2 + b^2 - 2ab\\cos C', description: 'Generalization of Pythagoras theorem' },
  { id: 'm14', subject: 'maths', chapter: 'Vectors', title: 'Dot Product', latex: '\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta', description: 'Dot product definition' },
  { id: 'm15', subject: 'maths', chapter: 'Vectors', title: 'Cross Product Magnitude', latex: '|\\vec{a} \\times \\vec{b}| = |a||b|\\sin\\theta', description: 'Magnitude of cross product' },
  { id: 'm16', subject: 'maths', chapter: 'Probability', title: 'Bayes\' Theorem', latex: 'P(A|B) = \\frac{P(B|A)\\,P(A)}{P(B)}', description: 'Conditional probability reversal' },
];
