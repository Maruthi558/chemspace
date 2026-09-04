/**
 * ChemNova Comprehensive Scientific History & Scientist Directory Archive
 * Contains verified biographical profiles, discoveries, molecules, equations, timelines,
 * awards, and citations for foundational scientists across all chemical subdisciplines.
 */

export const SCIENTIST_FIELDS = [
  'All Fields',
  'Quantum Chemistry',
  'Physical Chemistry',
  'Organic Chemistry',
  'Inorganic Chemistry',
  'Biochemistry',
  'Analytical & Spectroscopy',
  'Computational Chemistry',
  'Nuclear & Materials'
];

export const SCIENTIST_ERAS = [
  'All Eras',
  '18th–19th Century (Foundations)',
  'Early 20th Century (Quantum & Structure)',
  'Mid 20th Century (Synthesis & Biology)',
  'Modern & Contemporary'
];

export const FAMOUS_CHEMISTS = [
  {
    id: 'mendeleev',
    name: 'Dmitri Mendeleev',
    fullName: 'Dmitri Ivanovich Mendeleev',
    years: '1834 – 1907',
    birthDate: 'February 8, 1834',
    birthPlace: 'Verkhnie Aremzyani, Tobolsk Governorate, Russian Empire',
    deathDate: 'February 2, 1907',
    deathPlace: 'Saint Petersburg, Russian Empire',
    nationality: 'Russian',
    field: 'Inorganic Chemistry',
    era: '18th–19th Century (Foundations)',
    institutions: ['Saint Petersburg State University', 'Main Pedagogical Institute', 'Bureau of Weights and Measures'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Dmitri_Mendeleev_1890s.jpg',
    nobel: 'Nominated for Nobel Prize in Chemistry (1905, 1906, 1907). Element 101 (Mendelevium) named in his honor.',
    isNobelLaureate: false,
    summary: 'Formulated the Periodic Law and constructed the first comprehensive Periodic Table of Elements, accurately predicting properties of undiscovered elements (Gallium, Germanium, Scandium).',
    biography: 'Dmitri Mendeleev was a Russian chemist and inventor who revolutionized chemistry by organizing known chemical elements by increasing atomic weight and recognizing periodic patterns in their chemical valency and properties. He boldly left empty gaps in his 1869 table, predicting the exact atomic weights and chemical behaviors of elements such as gallium (eka-aluminum), scandium (eka-boron), and germanium (eka-silicon), which were later discovered with astonishing accuracy.',
    story: {
      who: 'A passionate Siberian-born chemist who sought to bring pedagogical order to the chaotic knowledge of chemical elements.',
      problem: 'In the mid-19th century, over 60 chemical elements were known, but there was no overarching theoretical framework explaining their atomic properties, valencies, and relationships.',
      discovery: 'He discovered the Periodic Law: chemical and physical properties of elements are periodic functions of their atomic weights.',
      how: 'By writing each element and its properties onto separate cards and organizing them in order of increasing atomic weight, noticing periodic repetitions in chemical behavior.',
      why: 'It transformed chemistry from a descriptive collection of empirical observations into a predictive, systematic exact science.',
      scienceChanged: 'Gave chemists a roadmap to discover missing elements and later provided foundational evidence for quantum atomic shell structures.',
      modernUse: 'The Periodic Table remains the universal visual framework of chemistry and material science taught across the world.'
    },
    discoveries: [
      { type: 'Discovery', title: 'The Periodic Law & Periodic Table (1869)', description: 'Arranged the 63 known elements systematically by atomic weight and recurring chemical valence.' },
      { type: 'Prediction', title: 'Prediction of Undiscovered Elements', description: 'Predicted eka-boron (Scandium), eka-aluminum (Gallium), and eka-silicon (Germanium) with remarkable precision.' },
      { type: 'Physical Chemistry', title: 'Critical Temperature of Gases', description: 'Defined the absolute boiling point of liquids (critical temperature) above which a gas cannot be liquefied.' }
    ],
    equations: [
      { name: 'Mendeleev-Clapeyron Ideal Gas Law Form', formula: 'P \\cdot V = \\frac{m}{M} \\cdot R \\cdot T', description: 'Extended Clapeyron equation by introducing universal gas constant R and molar mass M.' }
    ],
    molecule: {
      name: 'Gallium Trichloride (GaCl3)',
      formula: 'GaCl3',
      smiles: 'Cl[Ga](Cl)Cl',
      description: 'Compound of Gallium, the first element discovered (1875 by Lecoq de Boisbaudran) verifying Mendeleev’s eka-aluminum prediction.'
    },
    timeline: [
      { year: '1834', event: 'Born in Verkhnie Aremzyani, Siberia.' },
      { year: '1855', event: 'Graduated at the top of his class from the Main Pedagogical Institute in Saint Petersburg.' },
      { year: '1860', event: 'Attended the first International Chemical Congress at Karlsruhe, absorbing Cannizzaro’s atomic weights.' },
      { year: '1869', event: 'Published "The Dependence Between the Properties of the Atomic Weights of the Elements" presenting the Periodic Table.' },
      { year: '1875', event: 'Discovery of Gallium by Lecoq de Boisbaudran confirmed his predictive power.' },
      { year: '1907', event: 'Died in Saint Petersburg at age 72.' }
    ],
    awards: ['Copley Medal of the Royal Society (1905)', 'Davy Medal (1882)', 'Demidov Prize (1862)'],
    publications: ['Principles of Chemistry (Osnovy Khimii, 1868–1870)', 'On the Relationship of the Properties of Elements to their Atomic Weights (1869)'],
    collaborators: ['Robert Bunsen', 'Gustav Kirchhoff', 'Stanislao Cannizzaro'],
    references: ['NobelPrize.org Historical Archives', 'Royal Society Archive (Copley Citation 1905)', 'NIST Standard Reference Data']
  },
  {
    id: 'curie',
    name: 'Marie Skłodowska-Curie',
    fullName: 'Maria Salomea Skłodowska-Curie',
    years: '1867 – 1934',
    birthDate: 'November 7, 1867',
    birthPlace: 'Warsaw, Kingdom of Poland, Russian Empire',
    deathDate: 'July 4, 1934',
    deathPlace: 'Passy, Haute-Savoie, France',
    nationality: 'Polish / French',
    field: 'Nuclear & Materials',
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Paris (Sorbonne)', 'Radium Institute (Institut du Radium)', 'Warsaw Radium Institute'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Marie_Curie_c._1920s.jpg',
    nobel: 'Nobel Prize in Physics (1903), Nobel Prize in Chemistry (1911) — First person to win two Nobel Prizes, and the only person to win in two scientific fields.',
    isNobelLaureate: true,
    summary: 'Pioneered research on radioactivity, isolated pure radium metal, discovered Polonium and Radium, and developed mobile radiological vehicles for battlefield medicine.',
    biography: 'Marie Skłodowska-Curie was a Polish-naturalized French physicist and chemist who conducted pioneering research on radioactivity. She coined the term "radioactivity", developed techniques for isolating radioactive isotopes from pitchblende ore, and discovered two new chemical elements: Polonium (named after her native Poland) and Radium. She became the first woman to become a professor at the University of Paris and established the Curie Institutes.',
    story: {
      who: 'A brilliant Polish scientist who worked under arduous physical conditions to unravel the nature of radioactive atomic decay.',
      problem: 'Henri Becquerel noticed uranium emitted mystery rays in 1896, but no one understood the origin of the radiation or whether other elements possessed it.',
      discovery: 'Proved that radioactivity is an intrinsic subatomic property of atoms, not a molecular reaction, and discovered Polonium and Radium.',
      how: 'Using Pierre Curie’s sensitive piezoelectric electrometer to measure electrical conductivity of air ionized by pitchblende ore, followed by fractional crystallization of tons of ore.',
      why: 'Shattered the ancient concept of atoms as indivisible spheres and launched modern nuclear physics and radiation therapy.',
      scienceChanged: 'Opened the doorway to nuclear chemistry, cancer radiotherapy, and radioisotope tracing.',
      modernUse: 'Radium and targeted radioisotopes form the foundation of contemporary oncology and nuclear medicine.'
    },
    discoveries: [
      { type: 'Discovery', title: 'Discovery of Polonium & Radium (1898)', description: 'Chemically isolated trace radioactive elements from pitchblende ore with Pierre Curie.' },
      { type: 'Theory', title: 'Concept of Radioactivity (1898)', description: 'Established that radiation emission is an atomic phenomenon originating within individual atoms.' },
      { type: 'Isolation', title: 'Pure Radium Metal Isolation (1910)', description: 'Successfully isolated pure metallic radium by mercury-cathode electrolysis.' }
    ],
    equations: [
      { name: 'Radioactive Decay Law', formula: 'N(t) = N_0 \\cdot e^{-\\lambda t}', description: 'Fundamental exponential decay law describing spontaneous radioactive disintegration rate.' }
    ],
    molecule: {
      name: 'Radium Dichloride (RaCl2)',
      formula: 'RaCl2',
      smiles: '[Cl-].[Cl-].[Ra+2]',
      description: 'Luminescent salt through which Marie Curie first isolated and identified radioactive Radium.'
    },
    timeline: [
      { year: '1867', event: 'Born Maria Skłodowska in Warsaw, Poland.' },
      { year: '1891', event: 'Moved to Paris to study physics and mathematics at the Sorbonne.' },
      { year: '1898', event: 'Announced discovery of Polonium (July) and Radium (December) with Pierre Curie.' },
      { year: '1903', event: 'Awarded Nobel Prize in Physics with Pierre Curie and Henri Becquerel.' },
      { year: '1911', event: 'Awarded Nobel Prize in Chemistry for discovery of Radium and Polonium.' },
      { year: '1914', event: 'Equipped mobile radiological ambulances ("Little Curies") during World War I.' },
      { year: '1934', event: 'Died from aplastic anemia caused by prolonged radiation exposure.' }
    ],
    awards: ['Nobel Prize in Physics (1903)', 'Nobel Prize in Chemistry (1911)', 'Davy Medal (1903)', 'Matteucci Medal (1904)', 'Franklin Medal (1921)'],
    publications: ['Recherches sur les substances radioactives (Doctoral Thesis, 1903)', 'Traité de radioactivité (1910)'],
    collaborators: ['Pierre Curie', 'Henri Becquerel', 'Paul Langevin', 'Irène Joliot-Curie'],
    references: ['NobelPrize.org Official Biography', 'Académie des Sciences Archives', 'Institut Curie Historical Records']
  },
  {
    id: 'pauling',
    name: 'Linus Pauling',
    fullName: 'Linus Carl Pauling',
    years: '1901 – 1994',
    birthDate: 'February 28, 1901',
    birthPlace: 'Portland, Oregon, United States',
    deathDate: 'August 19, 1994',
    deathPlace: 'Big Sur, California, United States',
    nationality: 'American',
    field: 'Quantum Chemistry',
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['California Institute of Technology (Caltech)', 'Stanford University', 'Linus Pauling Institute'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Linus_Pauling_1962.jpg',
    nobel: 'Nobel Prize in Chemistry (1954), Nobel Peace Prize (1962) — Only person to win two unshared Nobel Prizes.',
    isNobelLaureate: true,
    summary: 'Founded quantum structural chemistry, formulated orbital hybridization (sp, sp2, sp3), the Pauling electronegativity scale, resonance valence theory, and the alpha-helix protein structure.',
    biography: 'Linus Pauling was an American theoretical physical chemist and peace activist who is widely regarded as one of the most influential chemists of all time. He applied quantum mechanics to elucidate the nature of the chemical bond, introduced the concept of electronegativity, explained chemical resonance in aromatic systems, and discovered the alpha-helix secondary structure of proteins.',
    story: {
      who: 'A visionary physical chemist who bridged quantum physics, organic structures, and molecular biology.',
      problem: 'Classical chemical bond theory could not explain directional valences (like tetrahedral methane) or the equal bond lengths of benzene.',
      discovery: 'Formulated quantum orbital hybridization ($sp, sp^2, sp^3$), resonance theory, and bond electronegativity scales.',
      how: 'By applying wave mechanics and matrix quantum models to chemical bond superposition and X-ray crystallographic data.',
      why: 'Unified organic, inorganic, and biological structures under consistent quantum mechanical principles.',
      scienceChanged: 'Provided the foundational rules for modern molecular geometry, drug design, and structural biochemistry.',
      modernUse: 'Pauling’s hybridization and electronegativity concepts are used daily across computational chemistry and drug discovery.'
    },
    discoveries: [
      { type: 'Theory', title: 'Orbital Hybridization Theory (1931)', description: 'Derived mathematical linear combinations of atomic orbitals ($s$ and $p$) to explain tetrahedral carbon valence.' },
      { type: 'Scale', title: 'Pauling Electronegativity Scale (1932)', description: 'Quantified the tendency of an atom to attract bonding electrons based on bond dissociation energies.' },
      { type: 'Structural Biology', title: 'Alpha-Helix & Beta-Sheet Models (1951)', description: 'Correctly proposed the right-handed alpha-helix and pleated sheet as secondary protein structural motifs.' }
    ],
    equations: [
      { name: 'Pauling Electronegativity Difference', formula: '\\chi_A - \\chi_B = \\sqrt{E_d(AB) - \\frac{E_d(AA) + E_d(BB)}{2}}', description: 'Relates electronegativity difference to excess bond dissociation energy due to ionic resonance.' }
    ],
    molecule: {
      name: 'Methane (CH4) & sp3 Hybridization',
      formula: 'CH4',
      smiles: 'C',
      description: 'The prototypical tetrahedral molecule explained by Pauling’s sp3 orbital hybridization theory.'
    },
    timeline: [
      { year: '1901', event: 'Born in Portland, Oregon.' },
      { year: '1925', event: 'Received Ph.D. in physical chemistry from Caltech.' },
      { year: '1931', event: 'Published landmark paper "The Nature of the Chemical Bond".' },
      { year: '1951', event: 'Published the alpha-helix and beta-sheet protein structural models.' },
      { year: '1954', event: 'Awarded Nobel Prize in Chemistry for research into the nature of the chemical bond.' },
      { year: '1962', event: 'Awarded Nobel Peace Prize for his campaign against nuclear weapons testing.' },
      { year: '1994', event: 'Died in Big Sur, California at age 93.' }
    ],
    awards: ['Nobel Prize in Chemistry (1954)', 'Nobel Peace Prize (1962)', 'Priestley Medal (1984)', 'National Medal of Science (1974)', 'Davy Medal (1947)'],
    publications: ['The Nature of the Chemical Bond (1939)', 'General Chemistry (1947)', 'The Structure of Proteins (1951)'],
    collaborators: ['Robert Corey', 'Herman Branson', 'Richard Tolman', 'E. Bright Wilson'],
    references: ['NobelPrize.org Official Biography', 'Caltech Special Collections Archives', 'National Academy of Sciences Memoirs']
  },
  {
    id: 'woodward',
    name: 'Robert Burns Woodward',
    fullName: 'Robert Burns Woodward',
    years: '1917 – 1979',
    birthDate: 'April 10, 1917',
    birthPlace: 'Boston, Massachusetts, United States',
    deathDate: 'July 8, 1979',
    deathPlace: 'Cambridge, Massachusetts, United States',
    nationality: 'American',
    field: 'Organic Chemistry',
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['Harvard University', 'Massachusetts Institute of Technology (MIT)'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Robert_Burns_Woodward.jpg',
    nobel: 'Nobel Prize in Chemistry (1965) for his outstanding achievements in the art of organic synthesis.',
    isNobelLaureate: true,
    summary: 'Master of total organic synthesis (Quinine, Cholesterol, Cortisone, Strychnine, Chlorophyll, Vitamin B12) and co-developer of the Woodward-Hoffmann rules for pericyclic reactions.',
    biography: 'Robert Burns Woodward is widely considered the preeminent organic chemist of the 20th century. He transformed organic synthesis from an empirical craft into an exact science by applying physical principles, UV/IR spectroscopy, and stereochemical control. His monumental total syntheses of natural products including quinine, cholesterol, cortisone, lysergic acid, strychnine, reserpine, chlorophyll, and Vitamin B12 established unprecedented benchmarks.',
    story: {
      who: 'An organic chemistry prodigy at Harvard who elevated chemical synthesis to an art of pure logic.',
      problem: 'Complex natural products containing dozens of chiral centers were considered impossible to construct synthetically from simple precursors.',
      discovery: 'Demonstrated total synthesis of ultra-complex natural products and formulated the orbital symmetry conservation rules (Woodward-Hoffmann rules).',
      how: 'By devising elegant multi-step retrosynthetic logic, stereospecific reactions, and applying frontier molecular orbital symmetries.',
      why: 'Unlocked the synthesis of vital pharmaceuticals, antibiotics, and vitamins, proving molecular complexity is fully conquerable.',
      scienceChanged: 'Unified synthetic organic strategy and theoretical pericyclic reaction mechanisms.',
      modernUse: 'Woodward’s retrosynthetic logic and orbital symmetry rules underpin all modern pharmaceutical drug manufacturing.'
    },
    discoveries: [
      { type: 'Total Synthesis', title: 'Synthesis of Quinine (1944) & Strychnine (1954)', description: 'Completed milestone total syntheses of historically challenging alkaloid natural products.' },
      { type: 'Total Synthesis', title: 'Total Synthesis of Vitamin B12 (1972)', description: 'A monumental 12-year collaboration involving over 100 chemists synthesizing the cobalt corrinoid complex.' },
      { type: 'Theory', title: 'Woodward-Hoffmann Rules (1965)', description: 'Predicted stereospecificity of pericyclic reactions based on the conservation of orbital symmetry.' }
    ],
    equations: [
      { name: 'Woodward-Fieser Rules for UV Absorption', formula: '\\lambda_{max} = \\lambda_{base} + \\sum \\Delta\\lambda_{substituents}', description: 'Empirical rules calculating UV-Vis absorption maxima for conjugated dienes and polyenes.' }
    ],
    molecule: {
      name: 'Strychnine (C21H22N2O2)',
      formula: 'C21H22N2O2',
      smiles: 'O=C1CC2OCC=C3CN4CCC56C4CC3C2C5(CC1)Nc7ccccc67',
      description: 'The notoriously complex heptacyclic alkaloid synthesized by Woodward in 1954, proving total synthesis capability.'
    },
    timeline: [
      { year: '1917', event: 'Born in Boston, Massachusetts.' },
      { year: '1937', event: 'Received Ph.D. from MIT at age 20.' },
      { year: '1944', event: 'Synthesized quinine with William von Eggers Doering.' },
      { year: '1965', event: 'Awarded Nobel Prize in Chemistry; published Woodward-Hoffmann rules with Roald Hoffmann.' },
      { year: '1972', event: 'Completed the landmark 100-step total synthesis of Vitamin B12 with Albert Eschenmoser.' },
      { year: '1979', event: 'Died in Cambridge, Massachusetts at age 62.' }
    ],
    awards: ['Nobel Prize in Chemistry (1965)', 'National Medal of Science (1964)', 'Copley Medal (1978)', 'Davy Medal (1959)', 'Willard Gibbs Award (1967)'],
    publications: ['The Total Synthesis of Strychnine (1954)', 'The Conservation of Orbital Symmetry (1970)'],
    collaborators: ['Roald Hoffmann', 'Albert Eschenmoser', 'William von Eggers Doering', 'Gilbert Stork'],
    references: ['NobelPrize.org Official Biography', 'Harvard University Archives', 'Biographical Memoirs of Fellows of the Royal Society']
  },
  {
    id: 'kohn',
    name: 'Walter Kohn',
    fullName: 'Walter Kohn',
    years: '1923 – 2016',
    birthDate: 'March 9, 1923',
    birthPlace: 'Vienna, Austria',
    deathDate: 'April 19, 2016',
    deathPlace: 'Santa Barbara, California, United States',
    nationality: 'Austrian / American',
    field: 'Computational Chemistry',
    era: 'Modern & Contemporary',
    institutions: ['University of California, Santa Barbara (UCSB)', 'University of California, San Diego (UCSD)', 'Carnegie Mellon University'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/7/77/Walter_Kohn_2008.jpg',
    nobel: 'Nobel Prize in Chemistry (1998) for his development of the density-functional theory (DFT).',
    isNobelLaureate: true,
    summary: 'Founded Density Functional Theory (DFT), replacing the 3N-dimensional many-body electronic wavefunction with the 3D electron density function, making quantum chemistry computationally tractable.',
    biography: 'Walter Kohn was an Austrian-born American theoretical physicist and theoretical chemist who received the 1998 Nobel Prize in Chemistry for founding Density Functional Theory (DFT). Together with Pierre Hohenberg and Lu Jeu Sham, he established that the ground-state total energy of any electronic system is uniquely determined by its 3D spatial electron density, enabling accurate electronic structure calculations for molecules and solids containing thousands of atoms.',
    story: {
      who: 'A theoretical physicist who transformed quantum chemistry from an intractable mathematical problem into a practical computational science.',
      problem: 'Schrödinger’s equation for a molecule with N electrons involves a wavefunction of 3N spatial coordinates, which becomes computationally impossible for more than a few electrons (the exponential wall).',
      discovery: 'Proved the Hohenberg-Kohn theorems and derived the Kohn-Sham equations of Density Functional Theory (DFT).',
      how: 'Demonstrated mathematically that ground-state energy is an exact functional of the 3-dimensional electron density $\\rho(\\mathbf{r})$, mapping the complex interacting system to an equivalent non-interacting single-particle system.',
      why: 'Reduced the mathematical dimensionality from $3N$ variables to just 3 spatial coordinates $(x,y,z)$.',
      scienceChanged: 'DFT became the most widely used quantum chemistry and solid-state physics calculation tool in human history.',
      modernUse: 'Over 80% of all quantum chemical calculations published globally today utilize Kohn-Sham DFT (such as B3LYP and PBE).'
    },
    discoveries: [
      { type: 'Theorem', title: 'Hohenberg-Kohn Theorems (1964)', description: 'Proved that ground-state properties are uniquely determined by electron density $\\rho(\\mathbf{r})$.' },
      { type: 'Methodology', title: 'Kohn-Sham Equations (1965)', description: 'Constructed fictitious non-interacting single-electron equations incorporating exchange-correlation potentials.' },
      { type: 'Condensed Matter', title: 'Kohn Anomaly in Phonon Dispersion', description: 'Discovered anomaly in phonon vibrational dispersion curves in metal Fermi surfaces.' }
    ],
    equations: [
      { name: 'Kohn-Sham Single-Particle Schrödinger Equation', formula: '\\left[ -\\frac{1}{2}\\nabla^2 + V_{ext}(\\mathbf{r}) + V_H[\\rho](\\mathbf{r}) + V_{xc}[\\rho](\\mathbf{r}) \\right] \\psi_i(\\mathbf{r}) = \\epsilon_i \\psi_i(\\mathbf{r})', description: 'Single-particle self-consistent field equation of Density Functional Theory.' }
    ],
    molecule: {
      name: 'Benzene & Molecular Orbitals via DFT',
      formula: 'C6H6',
      smiles: 'c1ccccc1',
      description: 'Prototypical aromatic system whose electronic density and HOMO-LUMO orbitals are simulated with DFT.'
    },
    timeline: [
      { year: '1923', event: 'Born in Vienna, Austria.' },
      { year: '1948', event: 'Received Ph.D. in physics from Harvard University under Julian Schwinger.' },
      { year: '1964', event: 'Published the Hohenberg-Kohn theorem establishing DFT foundations.' },
      { year: '1965', event: 'Published the Kohn-Sham equations with Lu Jeu Sham.' },
      { year: '1979', event: 'Founding director of the Institute for Theoretical Physics at UCSB.' },
      { year: '1998', event: 'Awarded Nobel Prize in Chemistry with John Pople.' },
      { year: '2016', event: 'Died in Santa Barbara, California at age 93.' }
    ],
    awards: ['Nobel Prize in Chemistry (1998)', 'National Medal of Science (1988)', 'Oliver E. Buckley Condensed Matter Prize (1961)', 'Feenberg Medal (1991)'],
    publications: ['Inhomogeneous Electron Gas (Hohenberg & Kohn, 1964)', 'Self-Consistent Equations Including Exchange and Correlation Effects (Kohn & Sham, 1965)'],
    collaborators: ['Pierre Hohenberg', 'Lu Jeu Sham', 'Julian Schwinger', 'John Pople'],
    references: ['NobelPrize.org Official Biography', 'APS Physics Historical Archives', 'UCSB Department of Physics Records']
  },
  {
    id: 'hodgkin',
    name: 'Dorothy Crowfoot Hodgkin',
    fullName: 'Dorothy Mary Crowfoot Hodgkin',
    years: '1910 – 1994',
    birthDate: 'May 12, 1910',
    birthPlace: 'Cairo, Egypt',
    deathDate: 'July 29, 1994',
    deathPlace: 'Ilmington, Warwickshire, United Kingdom',
    nationality: 'British',
    field: 'Analytical & Spectroscopy',
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['University of Oxford (Somerville College)', 'University of Cambridge'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Dorothy_Hodgkin_1989.jpg',
    nobel: 'Nobel Prize in Chemistry (1964) for her determinations by X-ray techniques of the structures of important biochemical substances.',
    isNobelLaureate: true,
    summary: 'Pioneered 3D protein and biomolecular X-ray crystallography, solving the definitive crystal structures of Cholesterol, Penicillin, Vitamin B12, and Insulin.',
    biography: 'Dorothy Crowfoot Hodgkin was a British chemist who pioneered the technique of X-ray crystallography to determine the 3D structures of complex biological molecules. Her breakthrough determinations of penicillin (1945), Vitamin B12 (1955), and insulin (1969) resolved major biochemical controversies, confirmed the presence of the beta-lactam ring in penicillin, and enabled modern structure-based pharmacology.',
    story: {
      who: 'A British crystallographer who mapped the 3D architecture of life’s most complex biomolecules.',
      problem: 'Before her work, organic chemical structures could only be inferred from indirect chemical degradation, leaving spatial 3D atomic coordinates unknown.',
      discovery: 'Solved the exact 3D crystal structures of Penicillin, Vitamin B12, and Insulin using X-ray diffraction and computational Fourier synthesis.',
      how: 'By meticulously collecting thousands of X-ray diffraction spot intensities on photographic plates and calculating electron density maps on early electronic computers.',
      why: 'Proved the unverified beta-lactam core of penicillin and revealed the intricate zinc-stabilized hexameric structure of insulin.',
      scienceChanged: 'Pioneered macromolecular structural biology, opening the era of rational drug design.',
      modernUse: 'X-ray crystallography and cryo-EM structural determination pipelines build upon Hodgkin’s foundational Fourier crystallography.'
    },
    discoveries: [
      { type: 'Structure Determination', title: '3D Structure of Penicillin (1945)', description: 'Proved the controversial four-membered beta-lactam ring core of penicillin antibiotics.' },
      { type: 'Structure Determination', title: 'Structure of Vitamin B12 (1955)', description: 'Mapped the octahedral cobalt coordination and corrin macrocyclic ring of cyanocobalamin.' },
      { type: 'Structure Determination', title: '3D Structure of Insulin (1969)', description: 'Solved the 51-amino acid two-chain peptide hormone structure after 35 years of research.' }
    ],
    equations: [
      { name: 'Bragg’s Law of X-ray Diffraction', formula: 'n\\lambda = 2d \\sin\\theta', description: 'Diffraction condition relating X-ray wavelength to interplanar crystal lattice spacing d.' }
    ],
    molecule: {
      name: 'Penicillin G (Benzylpenicillin)',
      formula: 'C16H18N2O4S',
      smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C',
      description: 'The transformative beta-lactam antibiotic whose 3D structure was solved by Dorothy Hodgkin in 1945.'
    },
    timeline: [
      { year: '1910', event: 'Born in Cairo, Egypt.' },
      { year: '1932', event: 'Graduated with first-class honors from Somerville College, Oxford.' },
      { year: '1937', event: 'Received Ph.D. from Cambridge under John Desmond Bernal.' },
      { year: '1945', event: 'Determined the 3D structure of penicillin, confirming the beta-lactam ring.' },
      { year: '1955', event: 'Determined the 3D structure of Vitamin B12.' },
      { year: '1964', event: 'Awarded Nobel Prize in Chemistry (only British female Nobel science laureate).' },
      { year: '1969', event: 'Decoded the complete 3D structure of insulin.' },
      { year: '1994', event: 'Died in Warwickshire, England at age 84.' }
    ],
    awards: ['Nobel Prize in Chemistry (1964)', 'Copley Medal (1976)', 'Order of Merit (1965)', 'Royal Medal (1956)', 'Lomonosov Gold Medal (1982)'],
    publications: ['The X-ray Crystallographic Investigation of the Structure of Penicillin (1949)', 'Structure of Vitamin B12 (1955)', 'Structure of Rhombohedral 2-Zinc Insulin (1969)'],
    collaborators: ['John Desmond Bernal', 'Max Perutz', 'Margaret Thatcher (student)', 'Guy Dodson'],
    references: ['NobelPrize.org Official Biography', 'Royal Society Biographical Memoirs', 'Somerville College Oxford Archives']
  },
  {
    id: 'franklin',
    name: 'Rosalind Franklin',
    fullName: 'Rosalind Elsie Franklin',
    years: '1920 – 1958',
    birthDate: 'July 25, 1920',
    birthPlace: 'Notting Hill, London, United Kingdom',
    deathDate: 'April 16, 1958',
    deathPlace: 'Chelsea, London, United Kingdom',
    nationality: 'British',
    field: 'Biochemistry',
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ["King's College London", 'Birkbeck College London', 'Laboratoire Central des Services Chimiques de l’État (Paris)', 'Cambridge University'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Rosalind_Franklin.jpg',
    nobel: 'Nobel Prize cannot be awarded posthumously. Widely recognized as co-discoverer of the DNA double helix.',
    isNobelLaureate: false,
    summary: 'Captured Photo 51—the critical X-ray diffraction photograph of B-DNA proving helical symmetry—and discovered the structural architecture of viruses and carbons.',
    biography: 'Rosalind Franklin was an English chemist and X-ray crystallographer whose research was central to the understanding of the molecular structures of DNA, RNA, viruses, coal, and graphite. Her iconic "Photo 51" obtained at King’s College London provided the definitive experimental proof that DNA is a double helix with phosphate backbones on the exterior, paving the way for Watson and Crick’s 1953 model.',
    story: {
      who: 'A rigorous British physical chemist and master of experimental X-ray diffraction.',
      problem: 'The physical structure of DNA—the carrier of genetic information—was completely unknown.',
      discovery: 'Discovered that DNA exists in two distinct forms (A and B), and captured Photo 51 proving the antiparallel double-helix structure.',
      how: 'By controlling environmental hydration of DNA fibers and capturing ultra-crisp X-ray diffraction patterns.',
      why: 'Showed the precise helical parameters: 34 Å repeat, 3.4 Å base pair rise, and exterior hydrophilic phosphate backbone.',
      scienceChanged: 'Catalyzed the modern genomic revolution and molecular biology.',
      modernUse: 'Franklin’s crystallographic techniques are used worldwide for analyzing viruses and nanomaterials.'
    },
    discoveries: [
      { type: 'Discovery', title: 'Photo 51 & B-DNA Helical Structure (1952)', description: 'Experimental X-ray diffraction image demonstrating helical symmetry of hydrated B-DNA.' },
      { type: 'Structural Discovery', title: 'Phosphate Backbone Exterior Geometry', description: 'Demonstrated that phosphate groups lie on the exterior rather than the interior of the DNA helix.' },
      { type: 'Virology', title: 'Tobacco Mosaic Virus 3D Architecture (1955)', description: 'Proved the hollow cylindrical RNA location inside the tobacco mosaic virus protein shell.' }
    ],
    equations: [
      { name: 'Helical Diffraction Transform (Cochran-Crick-Vand)', formula: 'F_n(R, \\psi, l/c) = \\sum_j J_n(2\\pi R r_j) e^{i(n(\\psi - \\phi_j + \\pi/2) + 2\\pi l z_j / c)}', description: 'Fourier transform equation describing the X-shaped diffraction pattern of a continuous helix.' }
    ],
    molecule: {
      name: 'Adenine-Thymine DNA Base Pair',
      formula: 'C10H13N7O2',
      smiles: 'CC1=CNC(=O)NC1=O.NC2=NC=NC3=C2N=CN3',
      description: 'The Watson-Crick hydrogen-bonded base pair arranged inside Franklin’s helical framework.'
    },
    timeline: [
      { year: '1920', event: 'Born in Notting Hill, London.' },
      { year: '1945', event: 'Earned Ph.D. in physical chemistry from Cambridge University.' },
      { year: '1947', event: 'Mastered X-ray diffraction at the Laboratoire Central in Paris.' },
      { year: '1952', event: 'Captured the legendary Photo 51 of B-DNA with Raymond Gosling.' },
      { year: '1953', event: 'Watson and Crick published the DNA structure utilizing Franklin’s data.' },
      { year: '1958', event: 'Died of ovarian cancer at age 37 in London.' }
    ],
    awards: ['Posthumous Louisa Gross Horwitz Prize (shared, 2008)', 'Fellow of the Royal Society of Chemistry (posthumous honor)', 'Rosalind Franklin Award (Royal Society)'],
    publications: ['Molecular Configuration in Sodium Thymonucleate (Nature, 1953)', 'Structure of Tobacco Mosaic Virus (Nature, 1955)'],
    collaborators: ['Raymond Gosling', 'John Desmond Bernal', 'Aaron Klug (Nobel laureate student)', 'Maurice Wilkins'],
    references: ['Royal Society Historical Archives', 'King’s College London Archives', 'Nature 1953 Original Papers']
  },
  {
    id: 'arrhenius',
    name: 'Svante Arrhenius',
    fullName: 'Svante August Arrhenius',
    years: '1859 – 1927',
    birthDate: 'February 19, 1859',
    birthPlace: 'Vik, Sweden',
    deathDate: 'October 2, 1927',
    deathPlace: 'Stockholm, Sweden',
    nationality: 'Swedish',
    field: 'Physical Chemistry',
    era: '18th–19th Century (Foundations)',
    institutions: ['Stockholm University', 'Uppsala University', 'Nobel Institute for Physical Chemistry'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Arrhenius2.jpg',
    nobel: 'Nobel Prize in Chemistry (1903) — First Swedish Nobel laureate.',
    isNobelLaureate: true,
    summary: 'Founded chemical kinetics and electrolytic dissociation theory (ions in solution), and formulated the Arrhenius equation and the greenhouse effect.',
    biography: 'Svante Arrhenius was a Swedish scientist who was one of the founders of the science of physical chemistry. He proposed that chemical compounds in electrolytic solution dissociate into electrical ions even in the absence of an electrical current. He formulated the Arrhenius equation relating reaction rate constants to temperature and activation energy, and was the first to quantify how atmospheric CO2 increases surface temperatures.',
    story: {
      who: 'A pioneering Swedish physical chemist who linked thermodynamics, electrical conductivity, and kinetics.',
      problem: 'Scientists could not explain why salt solutions conducted electricity and had anomalous freezing point depressions.',
      discovery: 'Discovered electrolytic dissociation into ions and the temperature dependence of reaction rates (activation energy).',
      how: 'By measuring the electrical conductivities and colligative properties of dilute electrolytic solutions.',
      why: 'Proved the existence of solvated cations and anions, establishing modern electrochemistry and acid-base theory.',
      scienceChanged: 'Founded physical chemistry alongside Ostwald and van \'t Hoff.',
      modernUse: 'The Arrhenius equation is used in every chemical kinetics calculation, reaction reactor design, and climate model.'
    },
    discoveries: [
      { type: 'Theory', title: 'Theory of Electrolytic Dissociation (1884)', description: 'Established that salts dissociate spontaneously into positively and negatively charged ions in water.' },
      { type: 'Kinetics', title: 'Arrhenius Equation for Reaction Rates (1889)', description: 'Formulated the mathematical equation connecting reaction rate constant $k$, temperature $T$, and activation energy $E_a$.' },
      { type: 'Atmospheric Physics', title: 'Greenhouse Gas Climate Forcing (1896)', description: 'First to calculate climate sensitivity showing that atmospheric carbon dioxide traps infrared radiation.' }
    ],
    equations: [
      { name: 'Arrhenius Equation', formula: 'k = A \\cdot e^{-\\frac{E_a}{R \\cdot T}}', description: 'Calculates the rate constant k of a chemical reaction as a function of activation energy Ea and temperature T.' }
    ],
    molecule: {
      name: 'Sodium Chloride Dissociation (NaCl)',
      formula: 'NaCl',
      smiles: '[Na+].[Cl-]',
      description: 'The prototypical electrolyte whose spontaneous aqueous ionic dissociation was explained by Arrhenius.'
    },
    timeline: [
      { year: '1859', event: 'Born near Uppsala, Sweden.' },
      { year: '1884', event: 'Submitted his doctoral thesis on electrolytic conductivity to Uppsala University.' },
      { year: '1889', event: 'Derived the Arrhenius equation for chemical reaction rates and activation energy.' },
      { year: '1896', event: 'Published the first global climate model quantifying CO2 greenhouse warming.' },
      { year: '1903', event: 'Awarded the Nobel Prize in Chemistry for his electrolytic dissociation theory.' },
      { year: '1927', event: 'Died in Stockholm at age 68.' }
    ],
    awards: ['Nobel Prize in Chemistry (1903)', 'Davy Medal (1902)', 'Faraday Lectureship Prize (1914)', 'Franklin Medal (1920)'],
    publications: ['Recherches sur la conductibilité galvanique des électrolytes (1884)', 'On the Influence of Carbonic Acid in the Air upon the Temperature of the Ground (1896)'],
    collaborators: ['Wilhelm Ostwald', 'Jacobus Henricus van \'t Hoff', 'Ludwig Boltzmann'],
    references: ['NobelPrize.org Official Biography', 'Royal Swedish Academy of Sciences Archives', 'NIST Physical Chemistry WebBook']
  },
  {
    id: 'zewail',
    name: 'Ahmed Zewail',
    fullName: 'Ahmed Hassan Zewail',
    years: '1946 – 2016',
    birthDate: 'February 26, 1946',
    birthPlace: 'Damanhur, Egypt',
    deathDate: 'August 2, 2016',
    deathPlace: 'Pasadena, California, United States',
    nationality: 'Egyptian / American',
    field: 'Analytical & Spectroscopy',
    era: 'Modern & Contemporary',
    institutions: ['California Institute of Technology (Caltech)', 'Alexandria University', 'University of Pennsylvania'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Ahmed_Zewail_2010.jpg',
    nobel: 'Nobel Prize in Chemistry (1999) — "Father of Femtochemistry".',
    isNobelLaureate: true,
    summary: 'Pioneered Femtochemistry, using ultrafast femtosecond (10⁻¹⁵ s) laser spectroscopy to record chemical bond breaking and formation in real time.',
    biography: 'Ahmed Zewail was an Egyptian-American chemist known as the "father of femtochemistry". He received the 1999 Nobel Prize in Chemistry for demonstrating that chemical reactions can be observed in real time on the femtosecond timescale ($10^{-15}$ seconds) using ultra-short laser flashes. His work captured the fleeting transition states of molecules during chemical transformations.',
    story: {
      who: 'An Egyptian-born Caltech chemical physicist who gave science a camera fast enough to film chemical reactions.',
      problem: 'Chemical reactions occur when atoms move across transition states in femtoseconds ($10^{-15}$ s), which was previously considered too fast to ever be observed.',
      discovery: 'Invented femtosecond laser spectroscopy, capturing transition-state intermediate geometries.',
      how: 'Used a pump-probe laser technique: an initial femtosecond laser pulse starts the reaction, and a second probe pulse takes a spectroscopic snapshot.',
      why: 'Transformed reaction dynamics from theoretical transition-state approximations into observable physical reality.',
      scienceChanged: 'Created the fields of femtochemistry and 4D ultrafast electron microscopy.',
      modernUse: 'Femtosecond spectroscopy is used globally to study photosynthesis, vision biochemistry, and catalytic surface dynamics.'
    },
    discoveries: [
      { type: 'Instrumentation & Method', title: 'Femtochemistry Ultrafast Laser Spectroscopy (1987)', description: 'Demonstrated real-time observation of the transition state during the dissociation of ICN and NaI.' },
      { type: 'Microscopy', title: '4D Ultrafast Electron Microscopy (2005)', description: 'Combined spatial atomic resolution of electron microscopy with femtosecond temporal resolution.' }
    ],
    equations: [
      { name: 'Femtosecond Wavepacket Time Evolution', formula: '\\Psi(\\mathbf{R}, t) = \\sum_n c_n e^{-i E_n t / \\hbar} \\phi_n(\\mathbf{R})', description: 'Describes coherent nuclear wavepacket motion across potential energy surfaces during bond breaking.' }
    ],
    molecule: {
      name: 'Sodium Iodide Transition State (Na...I)',
      formula: 'NaI',
      smiles: '[Na+].[I-]',
      description: 'The landmark molecular reaction system where Zewail filmed covalent-to-ionic transition oscillations.'
    },
    timeline: [
      { year: '1946', event: 'Born in Damanhur, Egypt.' },
      { year: '1974', event: 'Completed Ph.D. at the University of Pennsylvania under Robin Hochstrasser.' },
      { year: '1976', event: 'Joined the faculty at Caltech.' },
      { year: '1987', event: 'Published the first real-time femtosecond observation of bond dissociation (ICN).' },
      { year: '1999', event: 'Awarded the Nobel Prize in Chemistry for femtochemistry.' },
      { year: '2016', event: 'Died in Pasadena, California at age 70.' }
    ],
    awards: ['Nobel Prize in Chemistry (1999)', 'Wolf Prize in Chemistry (1998)', 'Priestley Medal (2011)', 'Franklin Medal (1998)', 'Order of the Nile (Egypt, 1999)'],
    publications: ['Femtosecond Laser Chemistry (Science, 1988)', 'Femtochemistry: Ultrafast Dynamics of the Chemical Bond (1994)'],
    collaborators: ['Richard Bernstein', 'Robin Hochstrasser', 'Ahmed Mokhtari'],
    references: ['NobelPrize.org Official Biography', 'Caltech Archives', 'Nature Obituary Archive (2016)']
  },
  {
    id: 'lewis',
    name: 'Gilbert N. Lewis',
    fullName: 'Gilbert Newton Lewis',
    years: '1875 – 1946',
    birthDate: 'October 23, 1875',
    birthPlace: 'Weymouth, Massachusetts, United States',
    deathDate: 'March 23, 1946',
    deathPlace: 'Berkeley, California, United States',
    nationality: 'American',
    field: 'Physical Chemistry',
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of California, Berkeley', 'Massachusetts Institute of Technology (MIT)', 'Harvard University'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Gilbert_N_Lewis.jpg',
    nobel: 'Nominated 41 times for the Nobel Prize in Chemistry (one of the most nominated scientists in history).',
    isNobelLaureate: false,
    summary: 'Discovered the covalent electron-pair bond, Lewis dot structures, Lewis acid-base electron-pair theory, thermodynamic chemical activity, and coined the word "photon".',
    biography: 'Gilbert Newton Lewis was an American physical chemist who revolutionized our understanding of chemical bonding. He introduced the concept of the covalent bond formed by shared electron pairs, invented Lewis dot structures, formulated the electron-pair definition of acids and bases (Lewis acids and bases), and developed modern chemical thermodynamics including chemical activity and fugacity.',
    story: {
      who: 'The intellectual architect of chemical bonding and Dean of Chemistry at UC Berkeley.',
      problem: 'Before 1916, chemists did not know what physical entity held non-ionic atoms together in molecules like $H_2$ or $CH_4$.',
      discovery: 'Proposed that the covalent bond consists of a shared pair of electrons, and formulated the Octet Rule.',
      how: 'By visualizing cubical atoms and paired valence electrons surrounding atomic kernels.',
      why: 'Provided the universal visual language of valence electrons and chemical structure diagrams.',
      scienceChanged: 'Gave chemistry the foundational Lewis dot notation and broadened acid-base definitions to all electron-pair transfers.',
      modernUse: 'Lewis structures are taught as the primary foundation of chemical valency in every chemistry curriculum worldwide.'
    },
    discoveries: [
      { type: 'Theory', title: 'Covalent Electron-Pair Bond (1916)', description: 'Established that molecules are bonded by pairs of shared valence electrons.' },
      { type: 'Acid-Base Theory', title: 'Lewis Acid-Base Definition (1923)', description: 'Defined acids as electron-pair acceptors and bases as electron-pair donors.' },
      { type: 'Thermodynamics', title: 'Chemical Activity and Fugacity', description: 'Formulated the rigorous mathematical framework of chemical potential in real non-ideal solutions.' }
    ],
    equations: [
      { name: 'Chemical Potential & Activity', formula: '\\mu_i = \\mu_i^\\circ + R \\cdot T \\cdot \\ln a_i', description: 'Defines chemical potential in terms of standard state potential and chemical activity a_i.' }
    ],
    molecule: {
      name: 'Water (H2O) & Lone Electron Pairs',
      formula: 'H2O',
      smiles: 'O',
      description: 'The canonical Lewis base showing two bonding electron pairs and two non-bonding lone pairs.'
    },
    timeline: [
      { year: '1875', event: 'Born in Weymouth, Massachusetts.' },
      { year: '1899', event: 'Earned Ph.D. in chemistry from Harvard University under T. W. Richards.' },
      { year: '1912', event: 'Appointed Dean of the College of Chemistry at UC Berkeley.' },
      { year: '1916', event: 'Published "The Atom and the Molecule", introducing the shared electron-pair covalent bond.' },
      { year: '1923', event: 'Published "Valence and the Structure of Atoms and Molecules" and "Thermodynamics".' },
      { year: '1926', event: 'Coined the term "photon" for the quantum unit of radiant light.' },
      { year: '1946', event: 'Died in his laboratory at UC Berkeley at age 70.' }
    ],
    awards: ['Davy Medal (1929)', 'Willard Gibbs Award (1924)', 'Nichols Medal (1921)', 'Richards Medal (1938)'],
    publications: ['The Atom and the Molecule (JACS, 1916)', 'Valence and the Structure of Atoms and Molecules (1923)', 'Thermodynamics and the Free Energy of Chemical Substances (1923)'],
    collaborators: ['Merle Randall', 'Irving Langmuir', 'Glenn T. Seaborg (student)', 'Melvin Calvin (student)'],
    references: ['UC Berkeley College of Chemistry History', 'National Academy of Sciences Memoirs', 'JACS 1916 Landmark Paper']
  },
  {
    id: 'doudna',
    name: 'Jennifer Doudna',
    fullName: 'Jennifer Anne Doudna',
    years: '1964 – Present',
    birthDate: 'February 19, 1964',
    birthPlace: 'Washington, D.C., United States',
    nationality: 'American',
    field: 'Biochemistry',
    era: 'Modern & Contemporary',
    institutions: ['University of California, Berkeley', 'Innovative Genomics Institute (IGI)', 'Howard Hughes Medical Institute (HHMI)'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Jennifer_Doudna_2020.jpg',
    nobel: 'Nobel Prize in Chemistry (2020) for the development of a method for genome editing (CRISPR-Cas9).',
    isNobelLaureate: true,
    summary: 'Pioneered CRISPR-Cas9 programmable genome editing technology, transforming genetic engineering, biotechnology, and molecular medicine.',
    biography: 'Jennifer Doudna is an American biochemist and structural biologist who co-discovered the programmable RNA-guided CRISPR-Cas9 genome editing system alongside Emmanuelle Charpentier. Their revolutionary discovery demonstrated that the bacterial Cas9 endonuclease can be programmed with a synthetic guide RNA to cleave DNA at any desired sequence, creating an ultra-precise tool for genetic medicine.',
    story: {
      who: 'An American biochemist and RNA structural biologist at UC Berkeley.',
      problem: 'Genetic modification of living cells was historically inefficient, imprecise, and prohibitively expensive.',
      discovery: 'Engineered the bacterial CRISPR-Cas9 immune defense mechanism into a programmable molecular scissor for precise DNA editing.',
      how: 'By purifying Cas9 protein and designing a single-guide RNA (sgRNA) that directs Cas9 to cut specific DNA target sites.',
      why: 'Enabled direct, precise correction of genetic defects in living organisms with single-base accuracy.',
      scienceChanged: 'Launched the genomic medicine revolution for curing inherited diseases and engineering climate-resilient crops.',
      modernUse: 'CRISPR-Cas9 is actively curing genetic diseases like sickle cell anemia and driving agricultural and diagnostic advancements.'
    },
    discoveries: [
      { type: 'Biotechnology', title: 'Programmable CRISPR-Cas9 Gene Editing (2012)', description: 'Engineered single-guide RNA directed Cas9 endonuclease to cut DNA targets with nucleotide precision.' },
      { type: 'Structural Biology', title: 'Ribozyme & RNA 3D Crystal Structures', description: 'Determined crystal structures of catalytic RNA ribozymes and RNA-protein complexes.' }
    ],
    equations: [
      { name: 'Michaelis-Menten Enzyme Kinetics', formula: 'v = \\frac{V_{max} [S]}{K_m + [S]}', description: 'Enzymatic kinetics model describing rate of substrate cleavage by catalytic Cas9 endonucleases.' }
    ],
    molecule: {
      name: 'Guide RNA - Cas9 DNA Cleavage Complex',
      formula: 'RNA-DNA Heteroduplex',
      smiles: 'P(=O)(O)OCC1OC(N)C(O)C1O',
      description: 'Synthetic guide RNA scaffold directing the Cas9 protein to targeted genomic loci.'
    },
    timeline: [
      { year: '1964', event: 'Born in Washington, D.C. and raised in Hilo, Hawaii.' },
      { year: '1989', event: 'Earned Ph.D. in biological chemistry from Harvard Medical School under Jack Szostak.' },
      { year: '2002', event: 'Joined the faculty at UC Berkeley.' },
      { year: '2012', event: 'Published the historic CRISPR-Cas9 genome editing paper in Science with Emmanuelle Charpentier.' },
      { year: '2020', event: 'Awarded the Nobel Prize in Chemistry (first all-female science Nobel team with Charpentier).' }
    ],
    awards: ['Nobel Prize in Chemistry (2020)', 'Breakthrough Prize in Life Sciences (2015)', 'Wolf Prize in Medicine (2020)', 'Kavli Prize in Nanoscience (2018)', 'Japan Prize (2017)'],
    publications: ['A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (Science, 2012)', 'A Crack in Creation: Gene Editing and the Unthinkable Power to Control Evolution (2017)'],
    collaborators: ['Emmanuelle Charpentier', 'Martin Jinek', 'Jack Szostak', 'Thomas Cech'],
    references: ['NobelPrize.org Official Biography', 'Innovative Genomics Institute Records', 'Science 2012 Landmark Paper']
  }
];
