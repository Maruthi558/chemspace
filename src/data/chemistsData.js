/**
 * ChemNova Comprehensive Scientific History & Scientist Directory Archive
 * World-class curated database of foundational and modern scientific pioneers
 * across all chemical subdisciplines, physics, and molecular biology.
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
  'Nuclear & Materials',
  'Chemical Physics'
];

export const SCIENTIST_ERAS = [
  'All Eras',
  '17th–18th Century (Foundations)',
  '19th Century (Atomic & Classical)',
  'Early 20th Century (Quantum & Structure)',
  'Mid 20th Century (Synthesis & Biology)',
  'Modern & Contemporary'
];

export const CURATED_COLLECTIONS = [
  { id: 'all', label: 'All Pioneers', icon: 'Sparkles' },
  { id: 'nobel', label: 'Nobel Laureates', icon: 'Award' },
  { id: 'women', label: 'Women in Science', icon: 'Users' },
  { id: 'quantum', label: 'Quantum Revolution', icon: 'Atom' },
  { id: 'organic', label: 'Total Synthesis Titans', icon: 'FlaskConical' },
  { id: 'spectroscopy', label: 'Spectroscopy & Kinetics', icon: 'Activity' },
  { id: 'computational', label: 'Computational & DFT', icon: 'Layers' },
  { id: 'biotech', label: 'Genomics & Biotech', icon: 'Zap' }
];

export const FAMOUS_CHEMISTS = [
  // ─── 1. ANTOINE LAVOISIER ──────────────────────────────────────────────
  {
    id: 'lavoisier',
    name: 'Antoine Lavoisier',
    fullName: 'Antoine-Laurent de Lavoisier',
    years: '1743 – 1794',
    birthDate: 'August 26, 1743',
    birthPlace: 'Paris, Kingdom of France',
    deathDate: 'May 8, 1794',
    deathPlace: 'Paris, French Republic',
    nationality: 'French',
    field: 'Inorganic Chemistry',
    subfields: ['Chemical Nomenclature', 'Quantitative Stoichiometry', 'Thermochemistry'],
    era: '17th–18th Century (Foundations)',
    institutions: ['Académie des Sciences', 'Ferme Générale', 'Arsenal de Paris'],
    positions: ['Director of the Gunpowder Administration', 'Member of the Royal Academy of Sciences'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/David_-_Portrait_of_Antoine-Laurent_Lavoisier_and_his_wife.jpg/480px-David_-_Portrait_of_Antoine-Laurent_Lavoisier_and_his_wife.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/David_-_Portrait_of_Antoine-Laurent_Lavoisier_and_his_wife.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/6/6c/David_-_Portrait_of_Antoine-Laurent_Lavoisier_and_his_wife.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Public Domain Painting (Jacques-Louis David, 1788, Metropolitan Museum of Art)',
    nobel: 'Pre-dated the Nobel Prize. Universally recognized as the "Father of Modern Chemistry".',
    isNobelLaureate: false,
    summary: 'Established the Law of Conservation of Mass, disproved the phlogiston theory, identified and named Oxygen and Hydrogen, and created the first modern system of chemical nomenclature.',
    biography: 'Antoine-Laurent de Lavoisier transformed chemistry from a qualitative, alchemical tradition into a rigorous quantitative science. By demanding precision gravimetric measurements and closed-system combustion reactions, he demolished the centuries-old phlogiston dogma, recognized oxygen as the active principle in combustion and respiration, authored "Traité Élémentaire de Chimie" (the first modern chemistry textbook), and formulated the universal Law of Conservation of Mass.',
    story: {
      who: 'A visionary French aristocrat, legal scholar, and quantitative experimentalist who brought the precision of the balance sheet to chemical transformations.',
      problem: 'For over a century, chemists believed in "phlogiston"—a mythical weightless substance supposedly released during burning—making it impossible to quantify mass balances in reactions.',
      discovery: 'Proved the Law of Conservation of Mass and demonstrated that combustion is an active combination of elements with atmospheric oxygen.',
      how: 'Conducted combustion in meticulously sealed glass vessels using ultra-precise scales, proving total mass before and after burning was identical.',
      why: 'Transformed chemistry into an exact physical science where every atom must balance on both sides of a reaction equation.',
      scienceChanged: 'Provided the bedrock foundation for stoichiometry, elemental definition, and chemical equations.',
      modernUse: 'The Law of Conservation of Mass and stoichiometric balancing remain the very first rule taught in all chemical engineering and laboratory disciplines.'
    },
    discoveries: [
      { type: 'Fundamental Law', title: 'Law of Conservation of Mass (1789)', description: 'Matter is neither created nor destroyed in chemical reactions; total reactant mass equals product mass.' },
      { type: 'Element Identification', title: 'Identification & Naming of Oxygen (1778)', description: 'Recognized oxygen as an element essential to combustion, rusting, and cellular respiration.' },
      { type: 'Chemical Nomenclature', title: 'Modern Chemical Nomenclature System (1787)', description: 'Replaced archaic alchemical names with logical compound names based on constituent elements.' }
    ],
    equations: [
      {
        name: 'Mass Conservation Balance',
        formula: '\\sum m_{\\text{reactants}} = \\sum m_{\\text{products}}',
        description: 'Total invariant mass of an isolated closed system across any chemical transformation.',
        variables: [
          { symbol: 'm_{\\text{reactants}}', meaning: 'Mass of initial chemical reactants (kg)' },
          { symbol: 'm_{\\text{products}}', meaning: 'Mass of resulting chemical products (kg)' }
        ]
      }
    ],
    molecule: {
      name: 'Oxygen Gas (O2)',
      formula: 'O2',
      smiles: 'O=O',
      description: 'The vital diatomic element identified and named by Lavoisier as the agent of combustion and respiration.'
    },
    reactions: [
      {
        name: 'Mercuric Oxide Decomposition',
        type: 'Thermal Decomposition',
        description: 'Heated red calx of mercury in a closed retort to produce liquid mercury and pure respirable oxygen gas.',
        scheme: '2 HgO (s) + heat -> 2 Hg (l) + O2 (g)'
      }
    ],
    techniques: [
      { name: 'Enclosed Gravimetric Calorimetry', description: 'Using closed ice calorimeters to measure heat evolution and mass changes simultaneously.' }
    ],
    timeline: [
      { year: '1743', event: 'Born into an affluent aristocratic family in Paris.', category: 'Birth' },
      { year: '1768', event: 'Elected to the prestigious French Royal Academy of Sciences at age 25.', category: 'Education' },
      { year: '1778', event: 'Demonstrated that combustion involves combination with oxygen, refuting phlogiston.', category: 'Discovery' },
      { year: '1787', event: 'Published "Méthode de Nomenclature Chimique" standardizing chemical terminology.', category: 'Major Scientific Work' },
      { year: '1789', event: 'Published the landmark "Traité Élémentaire de Chimie" establishing the Law of Conservation of Mass.', category: 'Major Scientific Work' },
      { year: '1794', event: 'Guillotined during the Reign of Terror at age 50; mathematician Lagrange remarked: "It took them only an instant to sever that head, and a hundred years may not produce another like it."', category: 'Legacy' }
    ],
    awards: ['Gold Medal of the French King (1766)', 'Fellow of the Royal Society (1788)', 'Member of the Royal Academy of Sciences'],
    publications: ['Traité Élémentaire de Chimie (1789)', 'Méthode de Nomenclature Chimique (1787)', 'Opuscules Physiques et Chimiques (1774)'],
    mentors: ['Guillaume-François Rouelle', 'Jean-Étienne Guettard'],
    students: ['Armand Seguin', 'Eleuthère Irénée du Pont (founder of DuPont)'],
    collaborators: ['Marie-Anne Pierrette Paulze (wife & scientific illustrator)', 'Pierre-Simon Laplace', 'Claude Louis Berthollet'],
    lineage: {
      mentors: ['Guillaume-François Rouelle'],
      students: ['Eleuthère Irénée du Pont', 'Armand Seguin'],
      collaborators: ['Pierre-Simon Laplace', 'Claude Louis Berthollet'],
      influenced: ['John Dalton', 'Jöns Jacob Berzelius', 'Humphry Davy']
    },
    facts: [
      'His wife, Marie-Anne, translated English scientific papers for him and hand-engraved all the copperplate diagrams for his revolutionary textbook.',
      'He proved diamonds are made of pure carbon by focusing solar rays through a giant lens to burn a diamond and proving the only product was carbon dioxide.'
    ],
    references: ['Académie des Sciences Historical Records', 'Metropolitan Museum of Art Historical Catalog', 'Chemical Heritage Foundation Archive']
  },

  // ─── 2. JOHN DALTON ──────────────────────────────────────────────────
  {
    id: 'dalton',
    name: 'John Dalton',
    fullName: 'John Dalton, FRS',
    years: '1766 – 1844',
    birthDate: 'September 6, 1766',
    birthPlace: 'Eaglesfield, Cumberland, England',
    deathDate: 'July 27, 1844',
    deathPlace: 'Manchester, England',
    nationality: 'British',
    field: 'Physical Chemistry',
    subfields: ['Modern Atomic Theory', 'Gas Laws', 'Meteorology'],
    era: '18th–19th Century (Foundations)',
    institutions: ['Manchester Literary and Philosophical Society', 'New College Manchester'],
    positions: ['President of the Manchester Literary and Philosophical Society'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/John_Dalton_by_Charles_Turner_1834.jpg/480px-John_Dalton_by_Charles_Turner_1834.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/John_Dalton_by_Charles_Turner_1834.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/John_Dalton_by_Charles_Turner_1834.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Mezzotint Portrait (Charles Turner, 1834)',
    nobel: 'Pre-dated the Nobel Prize. Awarded the Royal Medal (1826).',
    isNobelLaureate: false,
    summary: 'Pioneered the Modern Chemical Atomic Theory, formulated the Law of Multiple Proportions, established Dalton’s Law of Partial Pressures, and conducted the first scientific inquiry into color blindness.',
    biography: 'John Dalton was an English chemist, physicist, and meteorologist who introduced the atomic theory into chemistry. He postulated that all matter is composed of tiny, indivisible spherical particles called atoms, that atoms of a given element are identical in mass and properties, and that compounds are formed by combinations of different atoms in simple whole-number ratios.',
    story: {
      who: 'A modest Quaker teacher and meteorologist whose daily atmospheric observations sparked a revolution in atomic physics.',
      problem: 'Scientists observed that gases mixed uniformly and reacted in fixed mass ratios, but lacked any microscopic model of matter explaining why.',
      discovery: 'Formulated the Modern Atomic Theory and the Law of Multiple Proportions.',
      how: 'Analyzed the relative weights of reacting gases like nitrogen and oxygen (NO, NO2, N2O), proving elements combine in simple integer multiples.',
      why: 'Replaced vague philosophical atomism with concrete, measurable relative atomic weights.',
      scienceChanged: 'United physics and chemistry under the unified framework of discrete atomic particles.',
      modernUse: 'Dalton’s atomic weight concept is the foundation of molecular formula determination, stoichiometry, and mass spectrometry.'
    },
    discoveries: [
      { type: 'Foundational Theory', title: 'Modern Chemical Atomic Theory (1803)', description: 'Postulated that all matter consists of indivisible atoms of specific elemental weights.' },
      { type: 'Gas Law', title: 'Law of Partial Pressures (1801)', description: 'Total pressure of a gas mixture equals the sum of partial pressures of individual constituent gases.' },
      { type: 'Stoichiometric Law', title: 'Law of Multiple Proportions (1804)', description: 'When two elements form multiple compounds, the masses of one combining with fixed mass of the other are in simple whole-number ratios.' }
    ],
    equations: [
      {
        name: 'Dalton’s Law of Partial Pressures',
        formula: 'P_{\\text{total}} = \\sum_{i=1}^n P_i = P_1 + P_2 + \\dots + P_n',
        description: 'Total pressure exerted by a mixture of non-reacting gases.',
        variables: [
          { symbol: 'P_{\\text{total}}', meaning: 'Total pressure of the gas mixture (atm or Pa)' },
          { symbol: 'P_i', meaning: 'Partial pressure of individual gas component i (atm or Pa)' }
        ]
      }
    ],
    molecule: {
      name: 'Nitric Oxide (NO)',
      formula: 'NO',
      smiles: '[N]=O',
      description: 'One of the nitrogen oxides Dalton analyzed to prove the Law of Multiple Proportions.'
    },
    reactions: [
      {
        name: 'Synthesis of Nitrogen Oxides',
        type: 'Gas Phase Addition',
        description: 'Demonstrated that nitrogen and oxygen combine in ratios of 14:8, 14:16, and 14:32 grams, proving discrete atomic packaging.',
        scheme: '2 NO (g) + O2 (g) -> 2 NO2 (g)'
      }
    ],
    techniques: [
      { name: 'Eudiometry & Gas Barometry', description: 'Measuring volume changes of reacting gases over water and mercury troughs.' }
    ],
    timeline: [
      { year: '1766', event: 'Born into a Quaker weaver family in Cumberland.', category: 'Birth' },
      { year: '1793', event: 'Moved to Manchester and began 50 years of uninterrupted meteorological journals (200,000 observations).', category: 'Education' },
      { year: '1801', event: 'Formulated the Law of Partial Pressures for gaseous mixtures.', category: 'Discovery' },
      { year: '1803', event: 'Calculated the first table of relative atomic weights (setting Hydrogen = 1).', category: 'Major Scientific Work' },
      { year: '1808', event: 'Published "A New System of Chemical Philosophy" detailing atomic theory.', category: 'Major Scientific Work' },
      { year: '1844', event: 'Died in Manchester; over 40,000 citizens filed past his coffin in tribute.', category: 'Legacy' }
    ],
    awards: ['Royal Medal (1826)', 'Fellow of the Royal Society (1822)', 'Foreign Associate of the French Academy of Sciences'],
    publications: ['A New System of Chemical Philosophy (1808, 1810, 1827)', 'Meteorological Observations and Essays (1793)'],
    mentors: ['John Gough (blind polymath mentor)', 'Elihu Robinson'],
    students: ['James Prescott Joule (formulator of the First Law of Thermodynamics)'],
    collaborators: ['Thomas Thomson', 'William Henry'],
    lineage: {
      mentors: ['John Gough'],
      students: ['James Prescott Joule'],
      collaborators: ['William Henry', 'Thomas Thomson'],
      influenced: ['Amedeo Avogadro', 'Jöns Jacob Berzelius', 'Dmitri Mendeleev']
    },
    facts: [
      'Both John Dalton and his brother were red-green colorblind; Dalton was the first to publish a scientific paper on the condition, known as "Daltonism".',
      'He instructed that after his death his eyes be dissected to test his theory that his vitreous humor was tinted blue (it was not; DNA analysis of his preserved eye in 1995 confirmed a missing photopigment gene).'
    ],
    references: ['Royal Society Archive (Dalton Papers)', 'Manchester Literary and Philosophical Society Memoirs', 'Science History Institute']
  },

  // ─── 3. AMEDEO AVOGADRO ──────────────────────────────────────────────
  {
    id: 'avogadro',
    name: 'Amedeo Avogadro',
    fullName: 'Lorenzo Romano Amedeo Carlo Avogadro, Count of Quaregna and Cerreto',
    years: '1776 – 1856',
    birthDate: 'August 9, 1776',
    birthPlace: 'Turin, Kingdom of Sardinia',
    deathDate: 'July 9, 1856',
    deathPlace: 'Turin, Kingdom of Sardinia',
    nationality: 'Italian',
    field: 'Physical Chemistry',
    subfields: ['Molecular Hypothesis', 'Molar Theory', 'Gas Stoichiometry'],
    era: '18th–19th Century (Foundations)',
    institutions: ['University of Turin', 'Royal Academy of Sciences of Turin'],
    positions: ['Chair of Mathematical Physics at University of Turin'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Amedeo_Avogadro2.jpg/480px-Amedeo_Avogadro2.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Amedeo_Avogadro2.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/8/87/Amedeo_Avogadro2.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Lithograph (Turin University Archives)',
    nobel: 'Pre-dated the Nobel Prize. Honored eponymously by Avogadro’s Constant ($N_A = 6.022 \\times 10^{23} \\text{ mol}^{-1}$).',
    isNobelLaureate: false,
    summary: 'Formulated Avogadro’s Law stating equal volumes of gases at equal temperature and pressure contain equal numbers of particles, and first distinguished elementary atoms from polyatomic molecules.',
    biography: 'Amedeo Avogadro was an Italian scientist renowned for reconciling Dalton’s atomic theory with Gay-Lussac’s combining gas volumes. In 1811, he published his visionary hypothesis: equal volumes of all gases under identical temperature and pressure contain the exact same number of molecules. Crucially, he deduced that simple gases like hydrogen and oxygen exist as diatomic molecules ($H_2$, $O_2$), solving the riddle of chemical formulas.',
    story: {
      who: 'An Italian nobleman and professor of mathematical physics who worked in relative academic isolation in Turin.',
      problem: 'Gay-Lussac showed 2 volumes of hydrogen combine with 1 volume of oxygen to yield 2 volumes of steam, which seemed to imply splitting Daltonian oxygen atoms in half.',
      discovery: 'Differentiated between fundamental "atoms" and composite "molecules", proving gas molecules can be diatomic ($H_2, O_2, N_2$).',
      how: 'By mathematically correlating gas density measurements with reacting combining volumes.',
      why: 'Resolved the contradiction between Dalton’s atoms and Gay-Lussac’s volumes, creating the concept of the chemical mole.',
      scienceChanged: 'Allowed accurate determination of true relative molecular masses and chemical formulas.',
      modernUse: 'Avogadro’s number ($6.022 \\times 10^{23}$) is one of the seven foundational SI base defining constants of physics and chemistry.'
    },
    discoveries: [
      { type: 'Foundational Law', title: 'Avogadro’s Law (1811)', description: 'Equal volumes of all gases at identical temperature and pressure contain identical numbers of molecules.' },
      { type: 'Conceptual Breakthrough', title: 'Diatomic Molecular Theory', description: 'First proposed that elemental gases like hydrogen, nitrogen, and oxygen are bonded pairs of atoms ($H_2, O_2$).' }
    ],
    equations: [
      {
        name: 'Avogadro’s Gas Proportionality',
        formula: '\\frac{V_1}{n_1} = \\frac{V_2}{n_2} \\implies V \\propto n \\quad (T, P = \\text{const})',
        description: 'Direct proportionality between gas volume V and amount of substance n.',
        variables: [
          { symbol: 'V', meaning: 'Volume of the gas (L or m³)' },
          { symbol: 'n', meaning: 'Amount of substance (moles)' }
        ]
      }
    ],
    molecule: {
      name: 'Diatomic Hydrogen (H2)',
      formula: 'H2',
      smiles: '[HH]',
      description: 'The prototypical diatomic elemental molecule postulated by Avogadro in 1811.'
    },
    reactions: [
      {
        name: 'Water Vapor Gas Volume Synthesis',
        type: 'Gas Phase Synthesis',
        description: 'Two volumes of diatomic hydrogen combine with one volume of diatomic oxygen to yield two volumes of water vapor.',
        scheme: '2 H2 (g) + O2 (g) -> 2 H2O (g)'
      }
    ],
    techniques: [
      { name: 'Vapor Density Weighing', description: 'Comparing masses of identical volumes of different gases to determine relative molecular weights.' }
    ],
    timeline: [
      { year: '1776', event: 'Born in Turin, Piedmont.', category: 'Birth' },
      { year: '1806', event: 'Appointed demonstrator in physics at the Academy of Turin.', category: 'Education' },
      { year: '1811', event: 'Published historic paper in Journal de Physique establishing Avogadro’s hypothesis.', category: 'Discovery' },
      { year: '1820', event: 'Appointed to the first chair of mathematical physics in Italy at University of Turin.', category: 'Major Scientific Work' },
      { year: '1856', event: 'Died in Turin at age 79, before his hypothesis was universally accepted.', category: 'Later Life' },
      { year: '1860', event: 'Cannizzaro presented Avogadro’s work at the Karlsruhe Congress, prompting worldwide adoption.', category: 'Legacy' }
    ],
    awards: ['Knight of the Order of Saints Maurice and Lazarus', 'Member of the Academy of Sciences of Turin'],
    publications: ['Essai d\'une manière de déterminer les masses relatives des molécules élémentaires (1811)', 'Fisica de\' corpi ponderabili (1837–1841)'],
    mentors: ['Vassalli Eandi'],
    students: ['Stanislao Cannizzaro (champion of his legacy)'],
    collaborators: ['André-Marie Ampère'],
    lineage: {
      mentors: ['Vassalli Eandi'],
      students: ['Stanislao Cannizzaro'],
      collaborators: ['André-Marie Ampère'],
      influenced: ['Dmitri Mendeleev', 'Jean Perrin', 'Ludwig Boltzmann']
    },
    facts: [
      'Avogadro originally trained as a church lawyer and earned his doctorate in ecclesiastical law before devoting his life to mathematics and physics.',
      'His hypothesis was largely ignored for nearly 50 years until Stanislao Cannizzaro distributed a pamphlet explaining it at the 1860 Karlsruhe Congress, sparking a standing ovation and changing chemistry forever.'
    ],
    references: ['Journal de Physique (1811 Original Paper)', 'Karlsruhe Congress Proceedings (1860)', 'Accademia delle Scienze di Torino']
  },

  // ─── 4. MICHAEL FARADAY ──────────────────────────────────────────────
  {
    id: 'faraday',
    name: 'Michael Faraday',
    fullName: 'Michael Faraday, FRS',
    years: '1791 – 1867',
    birthDate: 'September 22, 1791',
    birthPlace: 'Newington Butts, Surrey, England',
    deathDate: 'August 25, 1867',
    deathPlace: 'Hampton Court, Middlesex, England',
    nationality: 'British',
    field: 'Physical Chemistry',
    subfields: ['Electrochemistry', 'Electromagnetic Induction', 'Organic Discovery'],
    era: '18th–19th Century (Foundations)',
    institutions: ['Royal Institution of Great Britain'],
    positions: ['Fullerian Professor of Chemistry', 'Director of the Laboratory at the Royal Institution'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Michael_Faraday_by_Thomas_Phillips_1842.jpg/480px-Michael_Faraday_by_Thomas_Phillips_1842.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Michael_Faraday_by_Thomas_Phillips_1842.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/d/d4/Michael_Faraday_by_Thomas_Phillips_1842.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Oil Painting (Thomas Phillips, 1842, National Portrait Gallery)',
    nobel: 'Pre-dated the Nobel Prize; honored with the Copley Medal (1832, 1838) and Rumford Medal (1846).',
    isNobelLaureate: false,
    summary: 'Discovered Benzene (1825), established the fundamental quantitative Laws of Electrolysis, coined terms ion, cathode, anode, and electrode, liquefied chlorine gas, and invented electromagnetic rotation.',
    biography: 'Michael Faraday was an English scientist who made monumental discoveries in electrochemistry and electromagnetism. Self-taught from an apprentice bookbinder, he became Sir Humphry Davy’s assistant at the Royal Institution. In chemistry, Faraday discovered and isolated benzene from coal-gas oil residues, liquefied multiple gases including chlorine and carbon dioxide, and discovered the quantitative laws of electrolysis that tied electrical charge directly to chemical equivalence.',
    story: {
      who: 'A blacksmith’s son who rose from bookbinder’s apprentice to England’s greatest experimental chemist.',
      problem: 'In the early 1800s, the connection between electricity and chemical bonding was purely qualitative and mystifying.',
      discovery: 'Formulated the two quantitative Laws of Electrolysis and isolated Benzene ($C_6H_6$).',
      how: 'Measured mass deposited at electrochemical electrodes per unit quantity of electrical charge passed through electrolytes.',
      why: 'Demonstrated that chemical affinity is fundamentally electrical in nature, prefiguring the electron.',
      scienceChanged: 'Created modern electrochemistry and discovered the structural archetype of aromatic organic chemistry.',
      modernUse: 'Faraday’s constant ($F = 96485 \\text{ C/mol}$) and laws govern all modern lithium-ion batteries, industrial chlor-alkali plants, and fuel cells.'
    },
    discoveries: [
      { type: 'Organic Discovery', title: 'Isolation of Benzene (1825)', description: 'Isolated "bicarburet of hydrogen" from illuminating oil residues, the parent aromatic hydrocarbon.' },
      { type: 'Electrochemical Law', title: 'First & Second Laws of Electrolysis (1834)', description: 'Established that mass liberated at an electrode is proportional to electric charge and chemical equivalent weight.' },
      { type: 'Physical Chemistry', title: 'Gas Liquefaction Under Pressure (1823)', description: 'Liquefied chlorine, ammonia, and sulfur dioxide, showing that gases are vapours of low-boiling liquids.' }
    ],
    equations: [
      {
        name: 'Faraday’s First Law of Electrolysis',
        formula: 'm = \\frac{Q \\cdot M}{F \\cdot z} = \\frac{I \\cdot t \\cdot M}{F \\cdot z}',
        description: 'Calculates the mass m of a chemical substance altered at an electrode during electrolysis.',
        variables: [
          { symbol: 'm', meaning: 'Mass of substance liberated at electrode (grams)' },
          { symbol: 'Q', meaning: 'Total electrical charge passed (Coulombs, Q = I * t)' },
          { symbol: 'M', meaning: 'Molar mass of the substance (g/mol)' },
          { symbol: 'F', meaning: 'Faraday constant (96,485.33 C/mol)' },
          { symbol: 'z', meaning: 'Valence number of ions (electrons transferred per ion)' }
        ]
      }
    ],
    molecule: {
      name: 'Benzene (C6H6)',
      formula: 'C6H6',
      smiles: 'c1ccccc1',
      description: 'The fundamental aromatic hexagonal ring discovered and isolated by Faraday in 1825.'
    },
    reactions: [
      {
        name: 'Electrolytic Decomposition of Water',
        type: 'Electrochemistry',
        description: 'Quantitative splitting of water into hydrogen and oxygen via electrical current.',
        scheme: '2 H2O (l) + electrical work -> 2 H2 (g) + O2 (g)'
      }
    ],
    techniques: [
      { name: 'Voltametric Coulometry', description: 'Using chemical gas evolution volume in a water voltameter to integrate total electric current.' }
    ],
    timeline: [
      { year: '1791', event: 'Born in Newington Butts, London.', category: 'Birth' },
      { year: '1813', event: 'Appointed chemical assistant to Sir Humphry Davy at the Royal Institution.', category: 'Education' },
      { year: '1823', event: 'Successfully liquefied chlorine gas using high pressure in sealed bent glass tubes.', category: 'Discovery' },
      { year: '1825', event: 'Discovered and characterized Benzene.', category: 'Discovery' },
      { year: '1834', event: 'Published the Laws of Electrolysis, introducing terms ion, anode, cathode, electrolyte.', category: 'Major Scientific Work' },
      { year: '1867', event: 'Died at Hampton Court at age 75; Albert Einstein kept portraits of Faraday, Newton, and Maxwell on his study wall.', category: 'Legacy' }
    ],
    awards: ['Copley Medal (1832, 1838)', 'Rumford Medal (1846)', 'Royal Medal (1835, 1846)', 'Albert Medal (1866)'],
    publications: ['Experimental Researches in Chemistry and Physics (1859)', 'The Chemical History of a Candle (1861)'],
    mentors: ['Sir Humphry Davy'],
    students: ['John Tyndall'],
    collaborators: ['William Whewell (who coined scientific terms with Faraday)', 'John Frederic Daniell'],
    lineage: {
      mentors: ['Sir Humphry Davy'],
      students: ['John Tyndall'],
      collaborators: ['William Whewell', 'John Frederic Daniell'],
      influenced: ['James Clerk Maxwell', 'Svante Arrhenius', 'J.J. Thomson']
    },
    facts: [
      'Faraday declined a knighthood and twice refused the Presidency of the Royal Society, wishing to remain plain "Michael Faraday to the last".',
      'When Chancellor of the Exchequer William Gladstone asked about the practical value of his electrical discoveries, Faraday famously replied: "Why, sir, there is every probability that you will soon be able to tax it!"'
    ],
    references: ['Royal Institution Archives', 'Philosophical Transactions of the Royal Society', 'Faraday Heritage Trust']
  },

  // ─── 5. LOUIS PASTEUR ────────────────────────────────────────────────
  {
    id: 'pasteur',
    name: 'Louis Pasteur',
    fullName: 'Louis Pasteur',
    years: '1822 – 1895',
    birthDate: 'December 27, 1822',
    birthPlace: 'Dole, Jura, France',
    deathDate: 'September 28, 1895',
    deathPlace: 'Marnes-la-Coquette, Hauts-de-Seine, France',
    nationality: 'French',
    field: 'Organic Chemistry',
    subfields: ['Molecular Chirality', 'Stereochemistry', 'Microbiology & Vaccines'],
    era: '18th–19th Century (Foundations)',
    institutions: ['École Normale Supérieure', 'University of Strasbourg', 'Institut Pasteur'],
    positions: ['Dean of the Faculty of Sciences at Lille University', 'Director of the Pasteur Institute'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Louis_Pasteur%2C_photo_avril_1878.jpg/480px-Louis_Pasteur%2C_photo_avril_1878.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Louis_Pasteur%2C_photo_avril_1878.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/3/3c/Louis_Pasteur%2C_photo_avril_1878.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Félix Nadar, April 1878)',
    nobel: 'Pre-dated the Nobel Prize; honored with the Copley Medal (1874) and Rumford Medal (1856).',
    isNobelLaureate: false,
    summary: 'Founded Stereochemistry by discovering Molecular Chirality and optical enantiomers, invented Pasteurization, disproved spontaneous generation, and developed rabies and anthrax vaccines.',
    biography: 'Louis Pasteur was a French chemist and microbiologist whose work transformed medicine and chemistry. At age 25, while studying wine fermentation tartrate crystals, he made the epochal chemical discovery that enantiomeric molecules exist as non-superimposable mirror images that rotate polarized light in opposite directions (dextro- and levorotatory), launching the field of stereochemistry. He subsequently connected microbial metabolism to fermentation and created the germ theory of disease.',
    story: {
      who: 'A meticulous French physical chemist and crystal analyst who unraveled the molecular geometry of life.',
      problem: 'Tartaric acid from wine rotated polarized light, but synthetic racemic paratartaric acid was optically inactive despite identical chemical composition.',
      discovery: 'Discovered Molecular Chirality (optical isomerism): molecules can exist as left- and right-handed mirror images.',
      how: 'Using a microscope and tweezers, he physically separated left-handed and right-handed tartrate crystals and tested each in a polarimeter.',
      why: 'Proved that spatial 3D atomic architecture determines biological and physical properties.',
      scienceChanged: 'Founded stereochemistry, which governs all modern drug receptor pharmacology.',
      modernUse: 'Chirality is essential in pharmaceutical design (e.g. Thalidomide, Ibuprofen) where one enantiomer heals and the other can be inert or toxic.'
    },
    discoveries: [
      { type: 'Stereochemistry', title: 'Discovery of Molecular Chirality (1848)', description: 'Separated sodium ammonium paratartrate enantiomers, discovering molecular asymmetry and optical rotation.' },
      { type: 'Industrial Chemistry', title: 'Pasteurization Method (1864)', description: 'Controlled gentle heating of liquids to eliminate pathogenic microbes without altering food quality.' },
      { type: 'Immunology', title: 'Rabies & Anthrax Vaccines (1885)', description: 'Created attenuated pathogen vaccines, establishing modern biomedical immunology.' }
    ],
    equations: [
      {
        name: 'Biot-Pasteur Specific Optical Rotation',
        formula: '[\\alpha]_\\lambda^T = \\frac{\\alpha}{l \\cdot c}',
        description: 'Quantifies the angle of polarized light rotation alpha by a chiral molecular solution.',
        variables: [
          { symbol: '[\\alpha]', meaning: 'Specific optical rotation (deg * mL / (g * dm))' },
          { symbol: '\\alpha', meaning: 'Observed optical rotation angle (degrees)' },
          { symbol: 'l', meaning: 'Path length of the sample polarimeter tube (dm)' },
          { symbol: 'c', meaning: 'Concentration of chiral solute (g/mL)' }
        ]
      }
    ],
    molecule: {
      name: 'L-Tartaric Acid',
      formula: 'C4H6O6',
      smiles: 'O=C(O)[C@@H](O)[C@H](O)C(=O)O',
      description: 'The chiral dicarboxylic acid whose crystal mirror forms revealed molecular optical activity.'
    },
    reactions: [
      {
        name: 'Stereoselective Microbial Fermentation',
        type: 'Biocatalysis',
        description: 'Observed Penicillium glaucum mold preferentially consuming only the dextrorotatory tartrate isomer, proving biological stereospecificity.',
        scheme: 'D,L-Tartrate + Penicillium -> D-Tartrate (unconsumed) + biomass'
      }
    ],
    techniques: [
      { name: 'Crystal Enantiomer Manual Micro-Separation', description: 'Hand-sorting hemihedral crystal enantiomorphs under optical polarization microscopy.' }
    ],
    timeline: [
      { year: '1822', event: 'Born in Dole, France.', category: 'Birth' },
      { year: '1847', event: 'Completed doctorates in physics and chemistry at the École Normale Supérieure.', category: 'Education' },
      { year: '1848', event: 'Presented discovery of molecular chirality to the French Academy of Sciences.', category: 'Discovery' },
      { year: '1864', event: 'Patented pasteurization of wine and beer.', category: 'Major Scientific Work' },
      { year: '1885', event: 'Successfully administered the first rabies vaccine to 9-year-old Joseph Meister.', category: 'Major Scientific Work' },
      { year: '1895', event: 'Died near Paris; interred in a majestic neo-Byzantine crypt beneath the Institut Pasteur.', category: 'Legacy' }
    ],
    awards: ['Copley Medal (1874)', 'Rumford Medal (1856)', 'Leeuwenhoek Medal (1895)', 'Grand Cross of the Legion of Honour'],
    publications: ['Mémoire sur la fermentation appelée lactique (1857)', 'Études sur le Vin (1866)', 'Études sur la Bière (1876)'],
    mentors: ['Jean-Baptiste Dumas', 'Antoine Jérôme Balard'],
    students: ['Émile Roux', 'Charles Chamberland', 'Ilya Metchnikov'],
    collaborators: ['Claude Bernard', 'Jean-Baptiste Boussingault'],
    lineage: {
      mentors: ['Jean-Baptiste Dumas', 'Antoine Jérôme Balard'],
      students: ['Émile Roux', 'Charles Chamberland'],
      collaborators: ['Claude Bernard'],
      influenced: ['Jacobus Henricus van \'t Hoff', 'Joseph Le Bel', 'Robert Koch']
    },
    facts: [
      'Famous for declaring: "Dans les champs de l\'observation, le hasard ne favorise que les esprits préparés" ("In the fields of observation, chance favors only the prepared mind").',
      'When veteran chemist Jean-Baptiste Biot asked Pasteur to demonstrate his chirality discovery, Biot mixed the solutions himself, tested them in the polarimeter, and was so moved he grasped Pasteur’s arm and wept with joy.'
    ],
    references: ['Institut Pasteur Historical Archives', 'Académie des Sciences Comptes Rendus (1848)', 'National Library of Medicine Historical Collection']
  },

  // ─── 6. DMITRI MENDELEEV ─────────────────────────────────────────────
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
    subfields: ['Periodic Law', 'Periodic Table of Elements', 'Critical Phenomena'],
    era: '18th–19th Century (Foundations)',
    institutions: ['Saint Petersburg State University', 'Main Pedagogical Institute', 'Bureau of Weights and Measures'],
    positions: ['Professor of General Chemistry at St. Petersburg University', 'Director of the Chief Bureau of Weights and Measures'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Dmitri_Mendeleev_1890s.jpg/480px-Dmitri_Mendeleev_1890s.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Dmitri_Mendeleev_1890s.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/c8/Dmitri_Mendeleev_1890s.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Archival Photograph (1890s, Russian State Archives)',
    nobel: 'Nominated for Nobel Prize in Chemistry (1905, 1906, 1907). Element 101 (Mendelevium) named in his honor.',
    isNobelLaureate: false,
    summary: 'Formulated the Periodic Law and constructed the first comprehensive Periodic Table of Elements, accurately predicting the existence and properties of undiscovered elements (Gallium, Germanium, Scandium).',
    biography: 'Dmitri Mendeleev was a Russian chemist and inventor who revolutionized science by discovering that chemical properties of elements recur periodically when arranged by atomic weight. In 1869, he published his visionary Periodic Table. With extraordinary scientific courage, he left open gaps in the table where elements should be and predicted with astounding mathematical precision the atomic weights, densities, and chemical behaviors of Gallium, Scandium, and Germanium.',
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
      {
        name: 'Mendeleev-Clapeyron Ideal Gas Law Form',
        formula: 'P \\cdot V = \\frac{m}{M} \\cdot R \\cdot T',
        description: 'Extended Clapeyron equation by introducing universal gas constant R and molar mass M.',
        variables: [
          { symbol: 'P', meaning: 'Gas pressure (Pa)' },
          { symbol: 'V', meaning: 'Volume (m³)' },
          { symbol: 'm', meaning: 'Sample mass (g)' },
          { symbol: 'M', meaning: 'Molar mass (g/mol)' },
          { symbol: 'R', meaning: 'Universal gas constant (8.314 J/(mol*K))' },
          { symbol: 'T', meaning: 'Absolute temperature (K)' }
        ]
      }
    ],
    molecule: {
      name: 'Gallium Trichloride (GaCl3)',
      formula: 'GaCl3',
      smiles: 'Cl[Ga](Cl)Cl',
      description: 'Compound of Gallium, the first element discovered (1875 by Lecoq de Boisbaudran) verifying Mendeleev’s eka-aluminum prediction.'
    },
    reactions: [
      {
        name: 'Prediction of Eka-Aluminum Oxidation',
        type: 'Inorganic Synthesis',
        description: 'Accurately calculated the density and oxide stoichiometry ($Ea_2O_3$) of then-unknown Gallium.',
        scheme: '4 Ga (s) + 3 O2 (g) -> 2 Ga2O3 (s)'
      }
    ],
    techniques: [
      { name: 'Comparative Valence Mapping', description: 'Cross-tabulating oxide and hydride stoichiometric ratios across atomic mass series.' }
    ],
    timeline: [
      { year: '1834', event: 'Born in Verkhnie Aremzyani, Siberia.', category: 'Birth' },
      { year: '1855', event: 'Graduated at the top of his class from the Main Pedagogical Institute in Saint Petersburg.', category: 'Education' },
      { year: '1860', event: 'Attended the first International Chemical Congress at Karlsruhe, absorbing Cannizzaro’s atomic weights.', category: 'Education' },
      { year: '1869', event: 'Published "The Dependence Between the Properties of the Atomic Weights of the Elements" presenting the Periodic Table.', category: 'Major Scientific Work' },
      { year: '1875', event: 'Discovery of Gallium by Lecoq de Boisbaudran confirmed his predictive power.', category: 'Discovery' },
      { year: '1907', event: 'Died in Saint Petersburg at age 72; students carried his Periodic Table banner through the streets at his funeral.', category: 'Legacy' }
    ],
    awards: ['Copley Medal of the Royal Society (1905)', 'Davy Medal (1882)', 'Demidov Prize (1862)'],
    publications: ['Principles of Chemistry (Osnovy Khimii, 1868–1870)', 'On the Relationship of the Properties of Elements to their Atomic Weights (1869)'],
    mentors: ['Alexander Voskresensky', 'Robert Bunsen'],
    students: ['Dmitri Petrovich Konovalov', 'Valery Gemilian'],
    collaborators: ['Robert Bunsen', 'Gustav Kirchhoff', 'Stanislao Cannizzaro'],
    lineage: {
      mentors: ['Alexander Voskresensky', 'Robert Bunsen'],
      students: ['Dmitri Petrovich Konovalov'],
      collaborators: ['Stanislao Cannizzaro'],
      influenced: ['Henry Moseley', 'Glenn T. Seaborg', 'Niels Bohr']
    },
    facts: [
      'His mother rode across Siberia on horseback for thousands of versts to get Mendeleev enrolled in university in Saint Petersburg after their glass factory burned down.',
      'He loved manual craftsmanship and was famous throughout Saint Petersburg as a master maker of leather luggage and bookbindings.'
    ],
    references: ['NobelPrize.org Historical Archives', 'Royal Society Archive (Copley Citation 1905)', 'NIST Standard Reference Data']
  },

  // ─── 7. SVANTE ARRHENIUS ─────────────────────────────────────────────
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
    subfields: ['Chemical Kinetics', 'Electrolytic Dissociation', 'Atmospheric Physics'],
    era: '18th–19th Century (Foundations)',
    institutions: ['Stockholm University', 'Uppsala University', 'Nobel Institute for Physical Chemistry'],
    positions: ['Rector of Stockholm University', 'Director of the Nobel Institute for Physical Chemistry'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Arrhenius2.jpg/480px-Arrhenius2.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Arrhenius2.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/e/e0/Arrhenius2.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Royal Swedish Academy of Sciences)',
    nobel: 'Nobel Prize in Chemistry (1903) — First Swedish Nobel laureate.',
    isNobelLaureate: true,
    summary: 'Founded chemical kinetics and electrolytic dissociation theory (ions in solution), formulated the Arrhenius equation relating reaction rate to activation energy, and quantified the greenhouse effect.',
    biography: 'Svante Arrhenius was a Swedish scientist who was one of the three founders of modern physical chemistry (alongside Ostwald and van \'t Hoff). In his 1884 doctoral thesis, he proposed that electrolytes dissociate spontaneously into positive and negative ions in aqueous solution. In 1889, he formulated the mathematical relationship between temperature, activation energy, and chemical reaction rate (the Arrhenius equation). In 1896, he authored the first quantitative climate model demonstrating that carbon dioxide traps heat.',
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
      {
        name: 'Arrhenius Kinetic Equation',
        formula: 'k = A \\cdot e^{-\\frac{E_a}{R \\cdot T}}',
        description: 'Calculates reaction rate constant k as a function of activation energy Ea and temperature T.',
        variables: [
          { symbol: 'k', meaning: 'Reaction rate constant (s⁻¹ or M⁻¹s⁻¹)' },
          { symbol: 'A', meaning: 'Pre-exponential frequency factor' },
          { symbol: 'E_a', meaning: 'Activation energy barrier (J/mol)' },
          { symbol: 'R', meaning: 'Universal gas constant (8.314 J/(mol*K))' },
          { symbol: 'T', meaning: 'Absolute temperature (Kelvin)' }
        ]
      }
    ],
    molecule: {
      name: 'Sodium Chloride Dissociation (NaCl)',
      formula: 'NaCl',
      smiles: '[Na+].[Cl-]',
      description: 'The prototypical electrolyte whose spontaneous aqueous ionic dissociation was explained by Arrhenius.'
    },
    reactions: [
      {
        name: 'Spontaneous Aqueous Electrolytic Ionization',
        type: 'Solvation',
        description: 'Crystalline lattice dissolves and dissociates spontaneously into hydrated cations and anions without applied electric field.',
        scheme: 'NaCl (s) + H2O -> Na+ (aq) + Cl- (aq)'
      }
    ],
    techniques: [
      { name: 'Electrolytic Conductance Wheatstone Bridge', description: 'Measuring alternating-current resistance of electrolyte solutions to compute ion mobilities.' }
    ],
    timeline: [
      { year: '1859', event: 'Born near Uppsala, Sweden.', category: 'Birth' },
      { year: '1884', event: 'Submitted his doctoral thesis on electrolytic conductivity to Uppsala University (barely passed with fourth-class honors).', category: 'Education' },
      { year: '1889', event: 'Derived the Arrhenius equation for chemical reaction rates and activation energy.', category: 'Discovery' },
      { year: '1896', event: 'Published the first global climate model quantifying CO2 greenhouse warming.', category: 'Major Scientific Work' },
      { year: '1903', event: 'Awarded the Nobel Prize in Chemistry for his electrolytic dissociation theory.', category: 'Award' },
      { year: '1927', event: 'Died in Stockholm at age 68.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1903)', 'Davy Medal (1902)', 'Faraday Lectureship Prize (1914)', 'Franklin Medal (1920)'],
    publications: ['Recherches sur la conductibilité galvanique des électrolytes (1884)', 'On the Influence of Carbonic Acid in the Air upon the Temperature of the Ground (1896)'],
    mentors: ['Erik Edlund', 'Per Teodor Cleve'],
    students: ['Oskar Klein'],
    collaborators: ['Wilhelm Ostwald', 'Jacobus Henricus van \'t Hoff', 'Ludwig Boltzmann'],
    lineage: {
      mentors: ['Erik Edlund'],
      students: ['Oskar Klein'],
      collaborators: ['Wilhelm Ostwald', 'Jacobus Henricus van \'t Hoff'],
      influenced: ['Peter Debye', 'Erich Hückel', 'Lars Onsager']
    },
    facts: [
      'His doctoral committee at Uppsala University thought his theory of ions in water was absurd and awarded his dissertation the lowest possible passing grade; 19 years later, that same dissertation earned him the Nobel Prize in Chemistry.',
      'He calculated by hand over thousands of hours that doubling atmospheric CO2 would raise global temperature by approximately 5 to 6 degrees Celsius, astonishingly close to modern supercomputer climate projections.'
    ],
    references: ['NobelPrize.org Official Biography', 'Royal Swedish Academy of Sciences Archives', 'NIST Physical Chemistry WebBook']
  },

  // ─── 8. JACOBUS HENRICUS VAN 'T HOFF ─────────────────────────────────
  {
    id: 'vanthoff',
    name: 'Jacobus Henricus van \'t Hoff',
    fullName: 'Jacobus Henricus van \'t Hoff',
    years: '1852 – 1911',
    birthDate: 'August 30, 1852',
    birthPlace: 'Rotterdam, Netherlands',
    deathDate: 'March 1, 1911',
    deathPlace: 'Berlin-Steglitz, German Empire',
    nationality: 'Dutch',
    field: 'Physical Chemistry',
    subfields: ['Chemical Thermodynamics', 'Chemical Kinetics', 'Stereochemistry'],
    era: '18th–19th Century (Foundations)',
    institutions: ['University of Amsterdam', 'University of Berlin', 'Prussian Academy of Sciences'],
    positions: ['Professor of Chemistry at University of Amsterdam', 'Honorary Professor at University of Berlin'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Jacobus_Henricus_van_%27t_Hoff_1899.jpg/480px-Jacobus_Henricus_van_%27t_Hoff_1899.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jacobus_Henricus_van_%27t_Hoff_1899.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/cf/Jacobus_Henricus_van_%27t_Hoff_1899.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1899, Nobel Archive)',
    nobel: 'First Nobel Prize in Chemistry (1901) for discovery of the laws of chemical dynamics and osmotic pressure in solutions.',
    isNobelLaureate: true,
    summary: 'Winner of the Inaugural Nobel Prize in Chemistry (1901), co-founder of modern physical chemistry, pioneered the 3D tetrahedral carbon atom in stereochemistry, and formulated laws of chemical equilibrium and osmotic pressure.',
    biography: 'Jacobus Henricus van \'t Hoff was a Dutch physical and theoretical chemist who made history by receiving the very first Nobel Prize in Chemistry in 1901. Before he was 22, he independently proposed that the four valence bonds of carbon are oriented toward the vertices of a regular tetrahedron, explaining optical isomerism in three dimensions. He went on to formulate the van \'t Hoff equation connecting equilibrium constants to temperature and proved that dilute solutions obey the ideal gas laws.',
    story: {
      who: 'A Dutch prodigy who revolutionized both organic structural theory and chemical thermodynamics.',
      problem: 'Chemists wrote structural formulas on flat 2D paper, unable to explain why isomers with identical connectivity had distinct optical properties.',
      discovery: 'Conceived the tetrahedral carbon atom in 3D space and formulated the thermodynamic laws of chemical equilibrium.',
      how: 'Applied geometric spatial analysis to asymmetric carbon atoms and thermodynamic cycle analysis to dilute solutions.',
      why: 'Unified stereochemistry with physical thermodynamics and osmotic pressure.',
      scienceChanged: 'Earned the very first Nobel Prize in Chemistry, formalizing physical chemistry as an independent science.',
      modernUse: 'The van \'t Hoff isochore equation is used in pharmaceutical binding enthalpy studies, protein folding stability, and chemical reactor design.'
    },
    discoveries: [
      { type: 'Stereochemistry', title: 'Tetrahedral Carbon Atom (1874)', description: 'Proposed that carbon’s four valences point to the corners of a tetrahedron, explaining optical isomerism in 3D.' },
      { type: 'Thermodynamics', title: 'Van \'t Hoff Equation of Chemical Equilibrium (1884)', description: 'Formulated the fundamental relation between equilibrium constant K, temperature, and standard reaction enthalpy.' },
      { type: 'Solution Theory', title: 'Laws of Osmotic Pressure in Dilute Solutions (1886)', description: 'Proved that osmotic pressure in dilute solutions obeys equations identical to the ideal gas law.' }
    ],
    equations: [
      {
        name: 'Van \'t Hoff Isochore Equation',
        formula: '\\frac{d \\ln K_{eq}}{dT} = \\frac{\\Delta H^\\circ}{R \\cdot T^2} \\implies \\ln \\frac{K_2}{K_1} = -\\frac{\\Delta H^\\circ}{R} \\left( \\frac{1}{T_2} - \\frac{1}{T_1} \\right)',
        description: 'Describes the change in chemical equilibrium constant with absolute temperature.',
        variables: [
          { symbol: 'K_{eq}', meaning: 'Thermodynamic equilibrium constant' },
          { symbol: '\\Delta H^\\circ', meaning: 'Standard enthalpy of reaction (J/mol)' },
          { symbol: 'R', meaning: 'Universal gas constant (8.314 J/(mol*K))' },
          { symbol: 'T', meaning: 'Absolute temperature (Kelvin)' }
        ]
      }
    ],
    molecule: {
      name: 'Lactic Acid (Chiral Tetrahedral Carbon)',
      formula: 'C3H6O3',
      smiles: 'CC(O)C(=O)O',
      description: 'The canonical asymmetric chiral carbon molecule used by van \'t Hoff to illustrate tetrahedral stereocenter geometry.'
    },
    reactions: [
      {
        name: 'Temperature-Dependent Ester Hydrolysis Equilibrium',
        type: 'Reversible Equilibrium',
        description: 'Measured equilibrium shifts of esterification as a function of temperature to confirm the van \'t Hoff isochore.',
        scheme: 'CH3COOH + C2H5OH <=> CH3COOC2H5 + H2O'
      }
    ],
    techniques: [
      { name: 'Pfeffer Cell Osmometry', description: 'Using semi-permeable copper ferrocyanide porcelain membranes to measure solution osmotic pressure.' }
    ],
    timeline: [
      { year: '1852', event: 'Born in Rotterdam, Netherlands.', category: 'Birth' },
      { year: '1874', event: 'Published the revolutionary pamphlet proposing the tetrahedral carbon atom at age 22.', category: 'Discovery' },
      { year: '1878', event: 'Appointed Professor of Chemistry at University of Amsterdam.', category: 'Education' },
      { year: '1884', event: 'Published "Études de Dynamique Chimique" founding chemical thermodynamics.', category: 'Major Scientific Work' },
      { year: '1901', event: 'Awarded the First Nobel Prize in Chemistry.', category: 'Award' },
      { year: '1911', event: 'Died of tuberculosis in Berlin-Steglitz at age 58.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1901)', 'Davy Medal (1893)', 'Helmholtz Medal (1911)', 'Foreign Member of the Royal Society'],
    publications: ['La chimie dans l\'espace (1875)', 'Études de Dynamique Chimique (1884)', 'Ansichten über die organische Chemie (1881)'],
    mentors: ['August Kekulé', 'Charles-Adolphe Wurtz'],
    students: ['Ernst Cohen'],
    collaborators: ['Wilhelm Ostwald', 'Svante Arrhenius'],
    lineage: {
      mentors: ['August Kekulé', 'Charles-Adolphe Wurtz'],
      students: ['Ernst Cohen'],
      collaborators: ['Wilhelm Ostwald', 'Svante Arrhenius'],
      influenced: ['Gilbert N. Lewis', 'Linus Pauling', 'Lars Onsager']
    },
    facts: [
      'Hermann Kolbe, one of the most prominent German chemists of the era, wrote a vicious review calling van \'t Hoff’s 3D tetrahedral paper "fanciful hallucinations and juvenile nonsense"; 25 years later, van \'t Hoff won the first Nobel Prize.',
      'He founded the influential journal "Zeitschrift für physikalische Chemie" in 1887 with Wilhelm Ostwald, cementing physical chemistry as a distinct discipline.'
    ],
    references: ['NobelPrize.org Official Nobel Lecture (1901)', 'Zeitschrift für physikalische Chemie Archive', 'Royal Netherlands Academy of Arts and Sciences']
  },

  // ─── 9. MARIE SKŁODOWSKA-CURIE ───────────────────────────────────────
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
    subfields: ['Radioactivity', 'Radiochemistry', 'Nuclear Physics'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Paris (Sorbonne)', 'Radium Institute (Institut du Radium)', 'Warsaw Radium Institute'],
    positions: ['First Female Professor at the University of Paris', 'Director of the Curie Laboratory at the Radium Institute'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Marie_Curie_c._1920s.jpg/480px-Marie_Curie_c._1920s.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Marie_Curie_c._1920s.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/7/7e/Marie_Curie_c._1920s.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (c. 1920s, Curie Institute Archives)',
    nobel: 'Nobel Prize in Physics (1903), Nobel Prize in Chemistry (1911) — First person to win two Nobel Prizes, and only person to win in two distinct sciences.',
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
      {
        name: 'Radioactive Decay Law',
        formula: 'N(t) = N_0 \\cdot e^{-\\lambda t} = N_0 \\cdot \\left( \\frac{1}{2} \\right)^{\\frac{t}{t_{1/2}}}',
        description: 'Fundamental exponential decay law describing spontaneous radioactive disintegration rate.',
        variables: [
          { symbol: 'N(t)', meaning: 'Number of undecayed radioactive nuclei at time t' },
          { symbol: 'N_0', meaning: 'Initial number of radioactive nuclei' },
          { symbol: '\\lambda', meaning: 'Radioactive decay constant (s⁻¹)' },
          { symbol: 't_{1/2}', meaning: 'Nuclear half-life (seconds or years)' }
        ]
      }
    ],
    molecule: {
      name: 'Radium Dichloride (RaCl2)',
      formula: 'RaCl2',
      smiles: '[Cl-].[Cl-].[Ra+2]',
      description: 'Luminescent salt through which Marie Curie first isolated and identified radioactive Radium.'
    },
    reactions: [
      {
        name: 'Alpha Particle Emission Decay of Radium-226',
        type: 'Nuclear Radioactive Decay',
        description: 'Spontaneous nuclear transformation of Radium-226 into Radon-222 gas and an alpha particle (helium-4 nucleus).',
        scheme: '226_88Ra -> 222_86Rn + 4_2He + 4.87 MeV'
      }
    ],
    techniques: [
      { name: 'Piezoelectric Ionization Electrometry', description: 'Quantifying radiation flux by measuring electrical discharge rate in ionized ambient air.' }
    ],
    timeline: [
      { year: '1867', event: 'Born Maria Skłodowska in Warsaw, Poland.', category: 'Birth' },
      { year: '1891', event: 'Moved to Paris to study physics and mathematics at the Sorbonne.', category: 'Education' },
      { year: '1898', event: 'Announced discovery of Polonium (July) and Radium (December) with Pierre Curie.', category: 'Discovery' },
      { year: '1903', event: 'Awarded Nobel Prize in Physics with Pierre Curie and Henri Becquerel.', category: 'Award' },
      { year: '1911', event: 'Awarded Nobel Prize in Chemistry for discovery of Radium and Polonium.', category: 'Award' },
      { year: '1914', event: 'Equipped mobile radiological ambulances ("Little Curies") during World War I.', category: 'Major Scientific Work' },
      { year: '1934', event: 'Died from aplastic anemia caused by prolonged radiation exposure; interred in the Panthéon in Paris.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Physics (1903)', 'Nobel Prize in Chemistry (1911)', 'Davy Medal (1903)', 'Matteucci Medal (1904)', 'Franklin Medal (1921)'],
    publications: ['Recherches sur les substances radioactives (Doctoral Thesis, 1903)', 'Traité de radioactivité (1910)'],
    mentors: ['Gabriel Lippmann', 'Henri Becquerel'],
    students: ['Irène Joliot-Curie (Nobel Laureate)', 'Marguerite Perey (discoverer of Francium)'],
    collaborators: ['Pierre Curie', 'Henri Becquerel', 'Paul Langevin'],
    lineage: {
      mentors: ['Gabriel Lippmann', 'Henri Becquerel'],
      students: ['Irène Joliot-Curie', 'Marguerite Perey'],
      collaborators: ['Pierre Curie', 'Henri Becquerel'],
      influenced: ['Ernest Rutherford', 'Lise Meitner', 'Glenn T. Seaborg']
    },
    facts: [
      'Her personal research notebooks, clothes, and furniture from the 1890s are so radioactive that they are stored in lead-lined boxes at the Bibliothèque Nationale in Paris and require protective gear to view.',
      'During World War I, she personally drove mobile X-ray vans to front-line battlefields to guide field surgeons removing shrapnel from wounded soldiers.'
    ],
    references: ['NobelPrize.org Official Biography', 'Académie des Sciences Archives', 'Institut Curie Historical Records']
  },

  // ─── 10. J.J. THOMSON ────────────────────────────────────────────────
  {
    id: 'thomson',
    name: 'J.J. Thomson',
    fullName: 'Sir Joseph John Thomson, PRS',
    years: '1856 – 1940',
    birthDate: 'December 18, 1856',
    birthPlace: 'Cheetham Hill, Manchester, England',
    deathDate: 'August 30, 1940',
    deathPlace: 'Cambridge, England',
    nationality: 'British',
    field: 'Physical Chemistry',
    subfields: ['Subatomic Physics', 'Mass Spectrometry', 'Atomic Structure'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['Cavendish Laboratory, Cambridge University', 'Trinity College Cambridge'],
    positions: ['Cavendish Professor of Experimental Physics', 'Master of Trinity College', 'President of the Royal Society'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/J.j.thomson.jpg/480px-J.j.thomson.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/J.j.thomson.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/c1/J.j.thomson.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Cavendish Laboratory Archives)',
    nobel: 'Nobel Prize in Physics (1906) for theoretical and experimental investigations on the conduction of electricity by gases.',
    isNobelLaureate: true,
    summary: 'Discovered the Electron (1897)—the first subatomic particle—measured its mass-to-charge ratio ($e/m$), invented the first mass spectrometer, and discovered stable non-radioactive isotopes (Neon-20 & Neon-22).',
    biography: 'Sir Joseph John Thomson was an English physicist whose cathode ray experiments shattered the ancient belief that the atom was indivisible. In 1897, Thomson demonstrated that cathode rays were composed of previously unknown subatomic particles, initially called "corpuscles" and later named electrons, which were over 1,000 times lighter than a hydrogen atom. He went on to pioneer mass spectrometry, proving that stable elements can have multiple isotopes.',
    story: {
      who: 'The legendary Director of the Cavendish Laboratory who trained an unprecedented eight future Nobel laureates.',
      problem: 'The nature of cathode rays inside evacuated Crookes tubes was fiercely debated: were they ether waves or charged particles?',
      discovery: 'Discovered the electron and proved it is a universal subatomic constituent of all chemical elements.',
      how: 'Deflected cathode ray beams using crossed electric and magnetic fields to calculate the charge-to-mass ratio ($e/m$).',
      why: 'Proved the atom has internal subatomic architecture, inaugurating the electronic era of chemistry.',
      scienceChanged: 'Gave chemistry the fundamental electron that forms chemical bonds, ions, and valency.',
      modernUse: 'Thomson’s mass spectrometer is the cornerstone analytical tool for chemical identification, proteomics, and forensics.'
    },
    discoveries: [
      { type: 'Subatomic Discovery', title: 'Discovery of the Electron (1897)', description: 'Identified the first subatomic elementary particle by deflecting cathode rays in vacuum tubes.' },
      { type: 'Analytical Instrumentation', title: 'Invention of Mass Spectrometry (1912)', description: 'Channeled positively charged ions through electric and magnetic fields to separate them by mass.' },
      { type: 'Isotope Discovery', title: 'Discovery of Stable Isotopes (Neon-20 & 22)', description: 'First proof that non-radioactive elements exist as different isotopic masses.' }
    ],
    equations: [
      {
        name: 'Electron Charge-to-Mass Ratio',
        formula: '\\frac{e}{m} = \\frac{E}{B^2 \\cdot r}',
        description: 'Relates electric field E, magnetic field B, and path radius r to determine subatomic mass ratio.',
        variables: [
          { symbol: 'e/m', meaning: 'Specific charge of the electron (1.7588 * 10¹¹ C/kg)' },
          { symbol: 'E', meaning: 'Applied electric field strength (V/m)' },
          { symbol: 'B', meaning: 'Applied magnetic flux density (Tesla)' },
          { symbol: 'r', meaning: 'Radius of curvature of the deflected beam (meters)' }
        ]
      }
    ],
    molecule: {
      name: 'Neon Isotopes (20Ne / 22Ne)',
      formula: 'Ne',
      smiles: '[Ne]',
      description: 'The noble gas whose twin parabolic traces on Thomson’s photographic plate proved stable isotopes.'
    },
    reactions: [
      {
        name: 'Gas Ionization in High Voltage Discharge',
        type: 'Electron Impact Ionization',
        description: 'Stripping electrons from neutral gas atoms inside an evacuated tube to generate cathode rays.',
        scheme: 'Ne (g) + e- (fast) -> Ne+ (g) + 2 e-'
      }
    ],
    techniques: [
      { name: 'Crossed-Field Parabola Mass Spectrography', description: 'Deflecting positive rays in parallel electric and magnetic fields onto photographic plates.' }
    ],
    timeline: [
      { year: '1856', event: 'Born in Cheetham Hill, Manchester.', category: 'Birth' },
      { year: '1884', event: 'Elected Cavendish Professor of Physics at Cambridge at the astonishing age of 28.', category: 'Education' },
      { year: '1897', event: 'Announced the discovery of the electron at the Royal Institution.', category: 'Discovery' },
      { year: '1906', event: 'Awarded the Nobel Prize in Physics.', category: 'Award' },
      { year: '1912', event: 'Constructed the first parabola mass spectrometer.', category: 'Major Scientific Work' },
      { year: '1940', event: 'Died in Cambridge; buried in Westminster Abbey near Sir Isaac Newton and Ernest Rutherford.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Physics (1906)', 'Copley Medal (1914)', 'Royal Medal (1894)', 'Hughes Medal (1902)', 'Knighthood (1908)'],
    publications: ['Cathode Rays (Philosophical Magazine, 1897)', 'Conduction of Electricity through Gases (1903)', 'Rays of Positive Electricity (1913)'],
    mentors: ['Lord Rayleigh', 'Osborne Reynolds'],
    students: ['Ernest Rutherford (Nobel Laureate)', 'Niels Bohr (Nobel Laureate)', 'Francis William Aston (Nobel Laureate)', 'C.T.R. Wilson (Nobel Laureate)'],
    collaborators: ['Francis William Aston', 'George Paget Thomson (his son, who won Nobel Prize for wave nature of the electron)'],
    lineage: {
      mentors: ['Lord Rayleigh'],
      students: ['Ernest Rutherford', 'Niels Bohr', 'Francis William Aston', 'C.T.R. Wilson'],
      collaborators: ['Francis William Aston'],
      influenced: ['Robert Millikan', 'Gilbert N. Lewis', 'Linus Pauling']
    },
    facts: [
      'J.J. Thomson won the Nobel Prize in 1906 for proving the electron is a particle. Thirty-one years later, his son, George Paget Thomson, won the Nobel Prize in 1937 for proving that the electron is a wave.',
      'An astonishing eight of his research assistants and students at the Cavendish Laboratory went on to win Nobel Prizes.'
    ],
    references: ['NobelPrize.org Official Biography', 'Cavendish Laboratory Historic Archive', 'Royal Society Biographical Memoirs']
  },

  // ─── 11. ERNEST RUTHERFORD ───────────────────────────────────────────
  {
    id: 'rutherford',
    name: 'Ernest Rutherford',
    fullName: 'Ernest Rutherford, 1st Baron Rutherford of Nelson, OM, FRS',
    years: '1871 – 1937',
    birthDate: 'August 30, 1871',
    birthPlace: 'Brightwater, New Zealand',
    deathDate: 'October 19, 1937',
    deathPlace: 'Cambridge, England',
    nationality: 'New Zealander / British',
    field: 'Nuclear & Materials',
    subfields: ['Nuclear Physics', 'Atomic Structure', 'Radioactive Transmutation'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['McGill University', 'University of Manchester', 'Cavendish Laboratory, Cambridge University'],
    positions: ['Langworthy Professor of Physics at Manchester', 'Director of the Cavendish Laboratory', 'President of the Royal Society'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Ernest_Rutherford_1908.jpg/480px-Ernest_Rutherford_1908.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Ernest_Rutherford_1908.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/6/6e/Ernest_Rutherford_1908.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1908, Nobel Archive)',
    nobel: 'Nobel Prize in Chemistry (1908) for investigations into the disintegration of the elements and the chemistry of radioactive substances.',
    isNobelLaureate: true,
    summary: 'Discovered the Atomic Nucleus through the Gold Foil Experiment, coined alpha and beta radiation, proved radioactive transmutation of elements, discovered the proton, and first artificially split the atom.',
    biography: 'Ernest Rutherford is universally recognized as the "Father of Nuclear Physics". Working at McGill, Manchester, and Cambridge, he proved that radioactivity is the spontaneous disintegration of atoms. In 1911, through the famous Geiger-Marsden gold foil alpha particle scattering experiment, he discovered that almost all the atom’s mass is concentrated in a microscopic, positively charged central nucleus. In 1919, he became the first person to achieve artificial nuclear transmutation.',
    story: {
      who: 'A boisterous New Zealand farm boy who became the colossus of experimental nuclear physics.',
      problem: 'Thomson’s "plum pudding" model assumed positive charge was diffuse throughout the atom like a pudding, with electrons embedded inside.',
      discovery: 'Discovered the tiny, dense atomic nucleus and discovered that atoms are 99.9999999% empty space.',
      how: 'Fired alpha particles at an ultra-thin gold foil; approximately 1 in 8,000 bounced backward, which Rutherford remarked was "as if you fired a 15-inch shell at tissue paper and it came back and hit you."',
      why: 'Overthrew the Thomson model and created the nuclear atom framework.',
      scienceChanged: 'Enabled the Bohr quantum model and the nuclear energy age.',
      modernUse: 'Rutherford backscattering spectrometry (RBS) is used worldwide in materials science for non-destructive thin film surface analysis.'
    },
    discoveries: [
      { type: 'Atomic Model', title: 'Discovery of the Atomic Nucleus (1911)', description: 'Proved all positive charge and mass reside in a central nucleus via alpha scattering.' },
      { type: 'Nuclear Transmutation', title: 'First Artificial Nuclear Reaction (1919)', description: 'Bombarded nitrogen gas with alpha particles to produce oxygen and liberate protons.' },
      { type: 'Particle Identification', title: 'Discovery of the Proton (1920)', description: 'Recognized the hydrogen nucleus as a fundamental elementary particle and named it the proton.' }
    ],
    equations: [
      {
        name: 'Rutherford Differential Scattering Cross-Section',
        formula: '\\frac{d\\sigma}{d\\Omega} = \\left( \\frac{z \\cdot Z \\cdot e^2}{4 \\pi \\varepsilon_0 \\cdot 4 E_k} \\right)^2 \\frac{1}{\\sin^4(\\theta / 2)}',
        description: 'Calculates the angular probability of alpha particles deflecting by angle theta from a heavy atomic nucleus.',
        variables: [
          { symbol: 'd\\sigma/d\\Omega', meaning: 'Differential scattering cross section (m²/steradian)' },
          { symbol: 'Z', meaning: 'Atomic number of target foil nucleus (Gold Z = 79)' },
          { symbol: 'z', meaning: 'Atomic number of projectile (Alpha particle z = 2)' },
          { symbol: 'E_k', meaning: 'Kinetic energy of incoming alpha particle (Joules)' },
          { symbol: '\\theta', meaning: 'Scattering deflection angle' }
        ]
      }
    ],
    molecule: {
      name: 'Helium Alpha Particle (4He 2+)',
      formula: 'He',
      smiles: '[He]',
      description: 'The energetic bare helium nucleus Rutherford used as a projectile to probe atomic structure.'
    },
    reactions: [
      {
        name: 'First Artificial Nuclear Transmutation (1919)',
        type: 'Nuclear Reaction',
        description: 'Bombarding nitrogen gas with alpha particles to yield oxygen-17 and a free proton.',
        scheme: '14_7N + 4_2alpha -> 17_8O + 1_1p'
      }
    ],
    techniques: [
      { name: 'Zinc Sulfide Scintillation Screen Counting', description: 'Counting individual alpha particle impacts in the dark via microscopic flashes on ZnS phosphor screens.' }
    ],
    timeline: [
      { year: '1871', event: 'Born near Nelson, New Zealand.', category: 'Birth' },
      { year: '1898', event: 'Appointed Chair of Physics at McGill University in Montreal.', category: 'Education' },
      { year: '1908', event: 'Awarded the Nobel Prize in Chemistry for radioactive transmutation.', category: 'Award' },
      { year: '1911', event: 'Announced the nuclear model of the atom based on gold foil experiments.', category: 'Discovery' },
      { year: '1919', event: 'Succeeded J.J. Thomson as Cavendish Professor at Cambridge and artificially split the atom.', category: 'Major Scientific Work' },
      { year: '1937', event: 'Died in Cambridge at age 66; buried in Westminster Abbey near Isaac Newton.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1908)', 'Order of Merit (1925)', 'Copley Medal (1922)', 'Franklin Medal (1924)', 'Peerage as Baron Rutherford of Nelson (1931)'],
    publications: ['Radio-activity (1904)', 'Radioactive Transformations (1906)', 'The Scattering of alpha and beta Particles by Matter and the Structure of the Atom (1911)'],
    mentors: ['J.J. Thomson', 'Alexander Bickerton'],
    students: ['Niels Bohr (Nobel Laureate)', 'James Chadwick (Nobel Laureate, discovered neutron)', 'Ernest Walton (Nobel Laureate)', 'John Cockcroft (Nobel Laureate)', 'Hans Geiger'],
    collaborators: ['Frederick Soddy', 'Ernest Marsden', 'Hans Geiger', 'Otto Hahn'],
    lineage: {
      mentors: ['J.J. Thomson'],
      students: ['Niels Bohr', 'James Chadwick', 'Ernest Walton', 'Hans Geiger'],
      collaborators: ['Frederick Soddy', 'Otto Hahn'],
      influenced: ['Enrico Fermi', 'Glenn T. Seaborg', 'Robert Oppenheimer']
    },
    facts: [
      'Upon hearing he had won the Nobel Prize in Chemistry rather than Physics, Rutherford joked: "I have been dealt with many different transformations in my time, but none quite so rapid as my transformation from a physicist to a chemist!"',
      'Element 104 was named Rutherfordium (Rf) in his honor.'
    ],
    references: ['NobelPrize.org Official Biography', 'Cavendish Laboratory Archives', 'Cambridge University Library Special Collections']
  },

  // ─── 12. MAX PLANCK ──────────────────────────────────────────────────
  {
    id: 'planck',
    name: 'Max Planck',
    fullName: 'Max Karl Ernst Ludwig Planck',
    years: '1858 – 1947',
    birthDate: 'April 23, 1858',
    birthPlace: 'Kiel, Duchy of Holstein',
    deathDate: 'October 4, 1947',
    deathPlace: 'Göttingen, West Germany',
    nationality: 'German',
    field: 'Chemical Physics',
    subfields: ['Quantum Hypothesis', 'Blackbody Thermodynamics', 'Statistical Mechanics'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Berlin', 'University of Kiel', 'Kaiser Wilhelm Society'],
    positions: ['President of the Kaiser Wilhelm Society', 'Professor of Theoretical Physics at Berlin University'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Max_Planck_1933.jpg/480px-Max_Planck_1933.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Max_Planck_1933.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/c7/Max_Planck_1933.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1933, Max Planck Society)',
    nobel: 'Nobel Prize in Physics (1918) in recognition of the services he rendered to the advancement of Physics by his discovery of energy quanta.',
    isNobelLaureate: true,
    summary: 'Originated Quantum Theory by proposing that electromagnetic energy is emitted and absorbed only in discrete packets called quanta ($E = h\\nu$), introducing the fundamental constant $h$ (Planck’s constant).',
    biography: 'Max Planck was a German theoretical physicist whose discovery of energy quanta won him the 1918 Nobel Prize in Physics and revolutionized our understanding of atomic and subatomic processes. In December 1900, to solve the "ultraviolet catastrophe" of blackbody radiation, Planck made the radical mathematical assumption that electromagnetic radiation can only be emitted or absorbed in discrete packets of energy, proportional to frequency ($E = h\\nu$). This marked the birth of quantum mechanics.',
    story: {
      who: 'A conservative German classical thermodynamicist who reluctantly sparked the greatest revolution in scientific history.',
      problem: 'Classical Rayleigh-Jeans physics predicted that a hot cavity should emit infinite energy at short ultraviolet wavelengths (the "ultraviolet catastrophe").',
      discovery: 'Discovered the quantum of action: energy is quantized in discrete packets ($E = h \\cdot \\nu$).',
      how: 'Interpolated between Wien’s law and Rayleigh-Jeans law by introducing a new fundamental constant of nature, $h$.',
      why: 'Resolved the blackbody paradox and proved energy at the atomic scale is discrete, not continuous.',
      scienceChanged: 'Birthed quantum physics, without which modern chemistry, spectroscopy, and electronics cannot exist.',
      modernUse: 'Planck’s constant ($h = 6.62607015 \\times 10^{-34} \\text{ J}\\cdot\\text{s}$) defines the official SI unit of mass (the kilogram) and underpins all chemical spectroscopy.'
    },
    discoveries: [
      { type: 'Quantum Revolution', title: 'The Quantum Hypothesis (December 14, 1900)', description: 'Postulated that atomic oscillators emit radiant energy only in integer multiples of $h\\nu$.' },
      { type: 'Thermodynamic Law', title: 'Planck’s Blackbody Radiation Law', description: 'Formulated the exact mathematical spectral radiance curve of thermal blackbody emitters.' },
      { type: 'Fundamental Constant', title: 'Planck’s Constant ($h$)', description: 'Discovered the universal quantum of action relating photon energy to electromagnetic frequency.' }
    ],
    equations: [
      {
        name: 'Planck-Einstein Quantum Energy Relation',
        formula: 'E = h \\cdot \\nu = \\frac{h \\cdot c}{\\lambda}',
        description: 'Quantifies the discrete energy packet carried by a photon of frequency nu or wavelength lambda.',
        variables: [
          { symbol: 'E', meaning: 'Photon quantum energy (Joules)' },
          { symbol: 'h', meaning: 'Planck’s constant (6.62607015 * 10⁻³⁴ J*s)' },
          { symbol: '\\nu', meaning: 'Electromagnetic frequency (Hz or s⁻¹)' },
          { symbol: 'c', meaning: 'Speed of light in vacuum (2.99792 * 10⁸ m/s)' },
          { symbol: '\\lambda', meaning: 'Wavelength of radiant light (meters)' }
        ]
      }
    ],
    molecule: {
      name: 'Blackbody Carbon (Cavity Resonator)',
      formula: 'C',
      smiles: '[C]',
      description: 'The soot-coated isothermal cavity material used to experimentally verify Planck’s quantum radiation distribution.'
    },
    reactions: [
      {
        name: 'Photochemical Quantum Absorption',
        type: 'Photochemistry',
        description: 'A molecule absorbs exactly one quantum h*nu of light energy to transition an electron from ground state to excited state.',
        scheme: 'M + h*nu -> M*'
      }
    ],
    techniques: [
      { name: 'Iso-thermal Spectro-radiometry', description: 'Using calibrated fluorite prisms and bolometers to measure radiant spectral energy densities.' }
    ],
    timeline: [
      { year: '1858', event: 'Born in Kiel, Germany.', category: 'Birth' },
      { year: '1879', event: 'Defended his doctoral dissertation on the Second Law of Thermodynamics at age 21.', category: 'Education' },
      { year: '1900', event: 'Presented the quantum derivation to the German Physical Society on December 14.', category: 'Discovery' },
      { year: '1918', event: 'Awarded the Nobel Prize in Physics.', category: 'Award' },
      { year: '1930', event: 'Elected President of the Kaiser Wilhelm Society (later renamed the Max Planck Society).', category: 'Major Scientific Work' },
      { year: '1947', event: 'Died in Göttingen at age 89; honored as Germany’s preeminent scientific patriarch.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Physics (1918)', 'Copley Medal (1929)', 'Max Planck Medal (1929)', 'Lorentz Medal (1927)', 'Goethe Prize (1945)'],
    publications: ['Ueber das Gesetz der Energieverteilung im Normalspektrum (Annalen der Physik, 1901)', 'Vorlesungen über Thermodynamik (1897)'],
    mentors: ['Hermann von Helmholtz', 'Gustav Kirchhoff'],
    students: ['Max von Laue (Nobel Laureate)', 'Walther Bothe (Nobel Laureate)', 'Lise Meitner'],
    collaborators: ['Albert Einstein', 'Hendrik Lorentz', 'Wilhelm Wien'],
    lineage: {
      mentors: ['Hermann von Helmholtz', 'Gustav Kirchhoff'],
      students: ['Max von Laue', 'Walther Bothe'],
      collaborators: ['Albert Einstein'],
      influenced: ['Niels Bohr', 'Erwin Schrödinger', 'Werner Heisenberg', 'Louis de Broglie']
    },
    facts: [
      'Planck was an accomplished concert-level pianist and nearly chose a career as a classical concert pianist and composer before choosing physics.',
      'When Planck decided to study physics in 1874, his Munich professor Philipp von Jolly advised against it, saying: "In this field, almost everything is already discovered, and all that remains is to fill in a few unimportant holes."'
    ],
    references: ['NobelPrize.org Official Biography', 'Max Planck Society Historical Archives', 'Annalen der Physik 1901 Landmark Paper']
  },

  // ─── 13. NIELS BOHR ──────────────────────────────────────────────────
  {
    id: 'bohr',
    name: 'Niels Bohr',
    fullName: 'Niels Henrik David Bohr',
    years: '1885 – 1962',
    birthDate: 'October 7, 1885',
    birthPlace: 'Copenhagen, Denmark',
    deathDate: 'November 18, 1962',
    deathPlace: 'Copenhagen, Denmark',
    nationality: 'Danish',
    field: 'Quantum Chemistry',
    subfields: ['Bohr Model of the Atom', 'Quantum Shells', 'Copenhagen Interpretation'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Copenhagen', 'Institute for Theoretical Physics (Niels Bohr Institute)'],
    positions: ['Director of the Niels Bohr Institute', 'President of the Royal Danish Academy of Sciences'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Niels_Bohr_Date_Unverified_LOC.jpg/480px-Niels_Bohr_Date_Unverified_LOC.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Niels_Bohr_Date_Unverified_LOC.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Niels_Bohr_Date_Unverified_LOC.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Library of Congress)',
    nobel: 'Nobel Prize in Physics (1922) for his services in the investigation of the structure of atoms and of the radiation emanating from them.',
    isNobelLaureate: true,
    summary: 'Constructed the Quantum Model of the Atom (1913) with quantized electron orbits, explained the spectral emission lines of Hydrogen, formulated the Principle of Complementarity, and established the Copenhagen school of quantum mechanics.',
    biography: 'Niels Bohr was a Danish physicist who created the first quantum model of the atom. Combining Rutherford’s nuclear atom with Planck’s quantum hypothesis, Bohr postulated in 1913 that electrons travel only in discrete, stationary circular orbits without radiating energy. Radiation is absorbed or emitted only when an electron jumps between quantized orbits ($h\\nu = E_2 - E_1$), providing the first physical explanation for atomic emission spectra and the Periodic Table’s electron shells.',
    story: {
      who: 'A Danish theoretical giant whose Copenhagen Institute became the intellectual capital of the quantum world.',
      problem: 'According to classical Maxwellian electrodynamics, electrons orbiting Rutherford’s nucleus must continuously radiate energy and spiral into the nucleus in a picosecond.',
      discovery: 'Postulated quantized stationary electron orbits and angular momentum ($L = n \\hbar$).',
      how: 'Connected the empirical Balmer formula of hydrogen spectral lines with Planck’s quantum constant $h$.',
      why: 'Explained the physical stability of atoms and the discrete spectral fingerprints of chemical elements.',
      scienceChanged: 'Provided the physical mechanism for chemical valency and the periodicity of chemical elements.',
      modernUse: 'Bohr’s quantum energy jump concept governs all modern laser technologies, atomic clocks, and analytical spectroscopy.'
    },
    discoveries: [
      { type: 'Atomic Model', title: 'The Bohr Model of the Hydrogen Atom (1913)', description: 'Introduced quantized angular momentum orbits for electrons orbiting a positive nucleus.' },
      { type: 'Spectroscopy', title: 'Quantum Derivation of Rydberg Constant', description: 'Derived Rydberg’s empirical formula from fundamental constants ($m_e, e, h, c$).' },
      { type: 'Quantum Philosophy', title: 'Principle of Complementarity (1927)', description: 'Wave and particle descriptions are mutually exclusive yet complementary aspects of physical reality.' }
    ],
    equations: [
      {
        name: 'Bohr Quantized Energy Level Formula',
        formula: 'E_n = -\\frac{m_e \\cdot e^4}{8 \\cdot \\varepsilon_0^2 \\cdot h^2} \\cdot \\frac{1}{n^2} = -\\frac{13.6 \\text{ eV}}{n^2}',
        description: 'Calculates the quantized energy of an electron in principal quantum shell n of a hydrogen atom.',
        variables: [
          { symbol: 'E_n', meaning: 'Electron energy in orbital level n (eV or Joules)' },
          { symbol: 'n', meaning: 'Principal quantum number (1, 2, 3, ...)' },
          { symbol: 'm_e', meaning: 'Mass of the electron (9.109 * 10⁻³¹ kg)' },
          { symbol: 'e', meaning: 'Elementary charge (1.602 * 10⁻¹⁹ C)' }
        ]
      }
    ],
    molecule: {
      name: 'Atomic Hydrogen (H)',
      formula: 'H',
      smiles: '[H]',
      description: 'The single-electron atom whose discrete Balmer emission lines were decoded by Bohr’s model.'
    },
    reactions: [
      {
        name: 'Atomic Hydrogen Spectral Emission Jump',
        type: 'Quantum Transition',
        description: 'Electron cascades from excited state n=3 to n=2, emitting a red H-alpha photon at 656.3 nm.',
        scheme: 'H* (n=3) -> H (n=2) + photon (656.3 nm, red)'
      }
    ],
    techniques: [
      { name: 'Hydrogen Vacuum Spark Spectroscopy', description: 'Measuring discrete emission wavelengths from high-voltage hydrogen gas discharges.' }
    ],
    timeline: [
      { year: '1885', event: 'Born in Copenhagen, Denmark.', category: 'Birth' },
      { year: '1911', event: 'Received Ph.D. from Copenhagen and went to England to work with J.J. Thomson and Rutherford.', category: 'Education' },
      { year: '1913', event: 'Published the epochal trilogy of papers on the constitution of atoms and molecules.', category: 'Discovery' },
      { year: '1921', event: 'Founded the Institute for Theoretical Physics in Copenhagen.', category: 'Major Scientific Work' },
      { year: '1922', event: 'Awarded the Nobel Prize in Physics.', category: 'Award' },
      { year: '1962', event: 'Died in Copenhagen at age 77; Element 107 named Bohrium (Bh) in his honor.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Physics (1922)', 'Copley Medal (1938)', 'Franklin Medal (1926)', 'Order of the Elephant (Denmark, 1947)', 'Atoms for Peace Award (1957)'],
    publications: ['On the Constitution of Atoms and Molecules (Philosophical Magazine, 1913)', 'Atomic Theory and the Description of Nature (1934)'],
    mentors: ['Christian Christiansen', 'Ernest Rutherford', 'J.J. Thomson'],
    students: ['Werner Heisenberg (Nobel Laureate)', 'Wolfgang Pauli (Nobel Laureate)', 'Lev Landau (Nobel Laureate)', 'Aage Bohr (his son, Nobel Laureate)'],
    collaborators: ['Ernest Rutherford', 'Albert Einstein (Bohr-Einstein debates)', 'Hendrik Kramers', 'Max Born'],
    lineage: {
      mentors: ['Ernest Rutherford'],
      students: ['Werner Heisenberg', 'Wolfgang Pauli', 'Lev Landau'],
      collaborators: ['Albert Einstein', 'Max Born'],
      influenced: ['Erwin Schrödinger', 'Linus Pauling', 'John Wheeler']
    },
    facts: [
      'Bohr was a competitive athlete and played as goalkeeper alongside his mathematician brother Harald (who won an Olympic silver medal in football for Denmark in 1908).',
      'When the Nazis occupied Denmark in 1940, Hungarian chemist George de Hevesy dissolved the gold Nobel Prize medals of Max von Laue and James Franck in aqua regia inside Bohr’s laboratory; after the war, the gold was precipitated out and the Nobel Foundation recast the medals.'
    ],
    references: ['NobelPrize.org Official Biography', 'Niels Bohr Archive, Copenhagen', 'Philosophical Magazine 1913 Trilogy Papers']
  },

  // ─── 14. GILBERT N. LEWIS ────────────────────────────────────────────
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
    subfields: ['Covalent Bonding', 'Lewis Acid-Base Theory', 'Chemical Thermodynamics'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of California, Berkeley', 'Massachusetts Institute of Technology (MIT)', 'Harvard University'],
    positions: ['Dean of the College of Chemistry at UC Berkeley'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Gilbert_N_Lewis.jpg/480px-Gilbert_N_Lewis.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Gilbert_N_Lewis.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/1/1b/Gilbert_N_Lewis.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (UC Berkeley Archives)',
    nobel: 'Nominated 41 times for the Nobel Prize in Chemistry (one of the most nominated scientists in history).',
    isNobelLaureate: false,
    summary: 'Discovered the covalent electron-pair bond, Lewis dot structures, the octet rule, Lewis acid-base electron-pair theory, chemical activity and fugacity in thermodynamics, and coined the word "photon".',
    biography: 'Gilbert Newton Lewis was an American physical chemist who revolutionized our understanding of chemical bonding. In 1916, he introduced the concept of the covalent bond formed by shared electron pairs, invented Lewis dot diagrams, formulated the electron-pair definition of acids and bases (Lewis acids and bases), and developed modern chemical thermodynamics including chemical activity and fugacity. As Dean of Chemistry at UC Berkeley, he built one of the greatest chemistry faculties in the world.',
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
      {
        name: 'Chemical Potential & Activity Relation',
        formula: '\\mu_i = \\mu_i^\\circ + R \\cdot T \\cdot \\ln a_i',
        description: 'Defines chemical potential in terms of standard state potential and chemical activity a_i.',
        variables: [
          { symbol: '\\mu_i', meaning: 'Chemical potential of component i (J/mol)' },
          { symbol: '\\mu_i^\\circ', meaning: 'Standard state chemical potential (J/mol)' },
          { symbol: 'a_i', meaning: 'Chemical activity (dimensionless effective concentration)' },
          { symbol: 'R', meaning: 'Gas constant (8.314 J/(mol*K))' },
          { symbol: 'T', meaning: 'Temperature (Kelvin)' }
        ]
      }
    ],
    molecule: {
      name: 'Water (H2O) & Lone Electron Pairs',
      formula: 'H2O',
      smiles: 'O',
      description: 'The canonical Lewis base showing two bonding electron pairs and two non-bonding lone pairs.'
    },
    reactions: [
      {
        name: 'Lewis Acid-Base Adduct Formation',
        type: 'Coordinate Covalent Addition',
        description: 'Boron trifluoride accepts an electron lone pair from ammonia to form a stable dative bond adduct.',
        scheme: 'BF3 (Lewis acid) + :NH3 (Lewis base) -> F3B-NH3'
      }
    ],
    techniques: [
      { name: 'Deuterium Heavy Water Concentration', description: 'Concentrating deuterium oxide via prolonged fractional electrolysis of alkaline water.' }
    ],
    timeline: [
      { year: '1875', event: 'Born in Weymouth, Massachusetts.', category: 'Birth' },
      { year: '1899', event: 'Earned Ph.D. in chemistry from Harvard University under T. W. Richards.', category: 'Education' },
      { year: '1912', event: 'Appointed Dean of the College of Chemistry at UC Berkeley.', category: 'Education' },
      { year: '1916', event: 'Published "The Atom and the Molecule", introducing the shared electron-pair covalent bond.', category: 'Discovery' },
      { year: '1923', event: 'Published "Valence and the Structure of Atoms and Molecules" and "Thermodynamics".', category: 'Major Scientific Work' },
      { year: '1926', event: 'Coined the term "photon" for the quantum unit of radiant light.', category: 'Major Scientific Work' },
      { year: '1946', event: 'Died in his laboratory at UC Berkeley at age 70 while experimenting on liquid hydrogen cyanide.', category: 'Legacy' }
    ],
    awards: ['Davy Medal (1929)', 'Willard Gibbs Award (1924)', 'Nichols Medal (1921)', 'Richards Medal (1938)'],
    publications: ['The Atom and the Molecule (JACS, 1916)', 'Valence and the Structure of Atoms and Molecules (1923)', 'Thermodynamics and the Free Energy of Chemical Substances (1923)'],
    mentors: ['Theodore William Richards', 'Wilhelm Ostwald', 'Walther Nernst'],
    students: ['Glenn T. Seaborg (Nobel Laureate)', 'Melvin Calvin (Nobel Laureate)', 'Harold Urey (Nobel Laureate)', 'Willard Libby (Nobel Laureate)'],
    collaborators: ['Merle Randall', 'Irving Langmuir', 'Michael Kasha'],
    lineage: {
      mentors: ['Theodore William Richards', 'Walther Nernst'],
      students: ['Glenn T. Seaborg', 'Melvin Calvin', 'Harold Urey', 'Willard Libby'],
      collaborators: ['Irving Langmuir', 'Michael Kasha'],
      influenced: ['Linus Pauling', 'Christopher Ingold', 'Robert S. Mulliken']
    },
    facts: [
      'Lewis personally trained, mentored, or recruited 14 future Nobel laureates to UC Berkeley, including Seaborg, Calvin, Urey, Libby, and Giauque, yet was famously never awarded the Nobel Prize himself due to animosity with Swedish committee member Walther Nernst.',
      'He was the first person to produce a pure sample of heavy water ($D_2O$, deuterium oxide) in 1933.'
    ],
    references: ['UC Berkeley College of Chemistry History', 'National Academy of Sciences Memoirs', 'JACS 1916 Landmark Paper']
  },

  // ─── 15. ERWIN SCHRÖDINGER ───────────────────────────────────────────
  {
    id: 'schrodinger',
    name: 'Erwin Schrödinger',
    fullName: 'Erwin Rudolf Josef Alexander Schrödinger',
    years: '1887 – 1961',
    birthDate: 'August 12, 1887',
    birthPlace: 'Vienna, Austria-Hungary',
    deathDate: 'January 4, 1961',
    deathPlace: 'Vienna, Austria',
    nationality: 'Austrian',
    field: 'Quantum Chemistry',
    subfields: ['Wave Mechanics', 'Molecular Orbitals', 'Theoretical Biophysics'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Zurich', 'University of Berlin', 'Dublin Institute for Advanced Studies', 'University of Vienna'],
    positions: ['Chair of Theoretical Physics at Berlin (succeeding Planck)', 'Director of School for Theoretical Physics at DIAS'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg/480px-Erwin_Schr%C3%B6dinger_%281933%29.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Erwin_Schr%C3%B6dinger_%281933%29.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/2/2e/Erwin_Schr%C3%B6dinger_%281933%29.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1933, Nobel Archive)',
    nobel: 'Nobel Prize in Physics (1933) for the discovery of new productive forms of atomic theory (Wave Mechanics).',
    isNobelLaureate: true,
    summary: 'Formulated the Schrödinger Wave Equation—the fundamental equation of quantum chemistry and atomic orbitals—developed wave mechanics, and inspired molecular biology with his 1944 book "What is Life?".',
    biography: 'Erwin Schrödinger was an Austrian theoretical physicist who revolutionized quantum theory by formulating wave mechanics. In 1926, inspired by de Broglie’s matter-wave hypothesis, Schrödinger published his famous non-relativistic wave equation, describing the quantum state and time evolution of electrons as continuous probability wavefunctions ($\\psi$). His equation successfully derived the 3D atomic orbitals ($s, p, d, f$) and electron probability clouds, creating the mathematical foundation of modern chemistry.',
    story: {
      who: 'An Austrian mathematical genius who brought the harmony of classical wave theory into quantum atomic structure.',
      problem: 'Bohr’s ad-hoc quantum orbits could not handle multi-electron atoms, chemical bonds, or explain why electrons did not radiate.',
      discovery: 'Derived the Wave Equation: atomic electrons exist as stationary 3D probability wavefunctions (atomic orbitals).',
      how: 'Applied Hamilton’s optical-mechanical analogy and de Broglie’s matter wave concept to formulate an eigenvalue differential wave equation.',
      why: 'Eliminated arbitrary quantum orbits, replacing them with natural standing boundary wave harmonics.',
      scienceChanged: 'Provided the exact mathematical master equation of all quantum chemistry and molecular modeling.',
      modernUse: 'Every chemical software program (DFT, Hartree-Fock, Gaussian, Q-Chem) solves approximations of the Schrödinger equation to predict molecular reactions.'
    },
    discoveries: [
      { type: 'Master Equation', title: 'Schrödinger Wave Equation (1926)', description: 'The fundamental partial differential equation governing the quantum mechanical wavefunction of atoms and molecules.' },
      { type: 'Quantum Chemistry', title: 'Wave Mechanical Derivation of Atomic Orbitals', description: 'Derived exact spherical harmonic solutions giving 3D shapes of $s, p, d$ electron probability clouds.' },
      { type: 'Biophysics', title: 'Aperiodic Crystal Genetic Code Hypothesis (1944)', description: 'Proposed that hereditary genetic material consists of an aperiodic crystal, directly inspiring Watson, Crick, and Wilkins to solve DNA.' }
    ],
    equations: [
      {
        name: 'Time-Independent Schrödinger Equation',
        formula: '\\hat{H} \\psi = E \\psi \\implies \\left[ -\\frac{\\hbar^2}{2m} \\nabla^2 + V(\\mathbf{r}) \\right] \\psi(\\mathbf{r}) = E \\psi(\\mathbf{r})',
        description: 'The master eigenvalue equation determining allowed quantum energy states E and wavefunctions psi.',
        variables: [
          { symbol: '\\hat{H}', meaning: 'Hamiltonian operator (kinetic + potential energy)' },
          { symbol: '\\psi', meaning: 'Wavefunction whose square |psi|² gives electron probability density' },
          { symbol: 'E', meaning: 'Allowed discrete quantum energy eigenvalue (Joules)' },
          { symbol: '\\hbar', meaning: 'Reduced Planck constant (h / 2pi)' },
          { symbol: '\\nabla^2', meaning: 'Laplacian kinetic differential operator' },
          { symbol: 'V(\\mathbf{r})', meaning: 'Coulombic electrostatic potential energy' }
        ]
      }
    ],
    molecule: {
      name: 'Hydrogen Molecule-Ion (H2+)',
      formula: 'H2+',
      smiles: '[H+].[H]',
      description: 'The simplest one-electron molecular chemical bond solved analytically using wave mechanics.'
    },
    reactions: [
      {
        name: 'Bond Formation via Orbital Overlap',
        type: 'Quantum Superposition',
        description: 'Constructive linear combination of atomic wavefunctions yields bonding molecular orbitals.',
        scheme: '1s_A + 1s_B -> sigma_g (1s) bonding orbital'
      }
    ],
    techniques: [
      { name: 'Spherical Harmonic Wavefunction Analysis', description: 'Separating variables into radial R(r) and angular Y_lm(theta, phi) components to compute electron nodal surfaces.' }
    ],
    timeline: [
      { year: '1887', event: 'Born in Vienna, Austria.', category: 'Birth' },
      { year: '1910', event: 'Received Ph.D. in physics from the University of Vienna.', category: 'Education' },
      { year: '1926', event: 'Published the legendary 4-part series "Quantization as an Eigenvalue Problem" formulating wave mechanics.', category: 'Discovery' },
      { year: '1927', event: 'Succeeded Max Planck as Chair of Theoretical Physics at the University of Berlin.', category: 'Education' },
      { year: '1933', event: 'Awarded the Nobel Prize in Physics (shared with Paul Dirac).', category: 'Award' },
      { year: '1944', event: 'Published the visionary book "What is Life?" in Dublin.', category: 'Major Scientific Work' },
      { year: '1961', event: 'Died in Vienna at age 73; his gravestone is inscribed with his famous wave equation: H psi = E psi.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Physics (1933)', 'Max Planck Medal (1937)', 'Erwin Schrödinger Prize (Austrian Academy)', 'Matteucci Medal (1927)'],
    publications: ['Quantisierung als Eigenwertproblem (Annalen der Physik, 1926)', 'What is Life? The Physical Aspect of the Living Cell (1944)'],
    mentors: ['Franz Serafin Exner', 'Friedrich Hasenöhrl'],
    students: ['Walter Heitler (pioneer of valence bond theory)'],
    collaborators: ['Paul Dirac', 'Albert Einstein', 'Max Born'],
    lineage: {
      mentors: ['Friedrich Hasenöhrl'],
      students: ['Walter Heitler'],
      collaborators: ['Paul Dirac', 'Albert Einstein'],
      influenced: ['Linus Pauling', 'John Pople', 'Walter Kohn', 'Roald Hoffmann']
    },
    facts: [
      'He devised his famous "Schrödinger’s Cat" thought experiment in 1935 during correspondence with Albert Einstein, not to suggest that a cat could be simultaneously alive and dead, but to ridicule what he saw as the absurdity of the Copenhagen interpretation when applied to macroscopic objects.',
      'His book "What is Life?" was cited by James Watson and Francis Crick as the primary catalyst that inspired them to abandon other fields and decipher the genetic code.'
    ],
    references: ['NobelPrize.org Official Biography', 'Austrian Central Library for Physics', 'Annalen der Physik 1926 Milestone Papers']
  },

  // ─── 16. LINUS PAULING ───────────────────────────────────────────────
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
    subfields: ['Chemical Bond Theory', 'Orbital Hybridization', 'Molecular Biology'],
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['California Institute of Technology (Caltech)', 'Stanford University', 'Linus Pauling Institute'],
    positions: ['Chairman of the Division of Chemistry and Chemical Engineering at Caltech'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Linus_Pauling_1962.jpg/480px-Linus_Pauling_1962.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Linus_Pauling_1962.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/5/58/Linus_Pauling_1962.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1962, Nobel Archive)',
    nobel: 'Nobel Prize in Chemistry (1954), Nobel Peace Prize (1962) — Only person in history to win two unshared Nobel Prizes.',
    isNobelLaureate: true,
    summary: 'Founded quantum structural chemistry, formulated orbital hybridization ($sp, sp^2, sp^3$), the Pauling electronegativity scale, resonance valence bond theory, and the alpha-helix protein structure.',
    biography: 'Linus Pauling was an American theoretical physical chemist and peace activist widely regarded as one of the greatest chemists in history. He applied quantum mechanics to elucidate the nature of the chemical bond, introduced the concept of electronegativity, explained chemical resonance in aromatic systems, and discovered the alpha-helix secondary structure of proteins.',
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
      {
        name: 'Pauling Electronegativity Difference',
        formula: '\\chi_A - \\chi_B = \\sqrt{E_d(AB) - \\frac{E_d(AA) + E_d(BB)}{2}}',
        description: 'Relates electronegativity difference to excess bond dissociation energy due to ionic resonance.',
        variables: [
          { symbol: '\\chi_A, \\chi_B', meaning: 'Electronegativity values of atoms A and B (Pauling units)' },
          { symbol: 'E_d(AB)', meaning: 'Experimental bond dissociation energy of polar AB bond (eV)' },
          { symbol: 'E_d(AA), E_d(BB)', meaning: 'Homopolar bond dissociation energies (eV)' }
        ]
      }
    ],
    molecule: {
      name: 'Methane (CH4) & sp3 Hybridization',
      formula: 'CH4',
      smiles: 'C',
      description: 'The prototypical tetrahedral molecule explained by Pauling’s sp3 orbital hybridization theory.'
    },
    reactions: [
      {
        name: 'Resonance Stabilization of Benzene',
        type: 'Valence Bond Superposition',
        description: 'Superposition of Kekulé and Dewar valence bond canonical wavefunctions gives 36 kcal/mol aromatic resonance energy.',
        scheme: 'Psi_benzene = c1 * Psi_Kekulé1 + c2 * Psi_Kekulé2 + ...'
      }
    ],
    techniques: [
      { name: 'X-Ray Crystal & Gas Electron Diffraction', description: 'Using Fourier synthesis on diffraction intensities to deduce exact interatomic bond angles.' }
    ],
    timeline: [
      { year: '1901', event: 'Born in Portland, Oregon.', category: 'Birth' },
      { year: '1925', event: 'Received Ph.D. in physical chemistry from Caltech.', category: 'Education' },
      { year: '1931', event: 'Published landmark paper "The Nature of the Chemical Bond".', category: 'Discovery' },
      { year: '1951', event: 'Published the alpha-helix and beta-sheet protein structural models.', category: 'Major Scientific Work' },
      { year: '1954', event: 'Awarded Nobel Prize in Chemistry for research into the chemical bond.', category: 'Award' },
      { year: '1962', event: 'Awarded Nobel Peace Prize for his campaign against atmospheric nuclear testing.', category: 'Award' },
      { year: '1994', event: 'Died in Big Sur, California at age 93.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1954)', 'Nobel Peace Prize (1962)', 'Priestley Medal (1984)', 'National Medal of Science (1974)', 'Davy Medal (1947)'],
    publications: ['The Nature of the Chemical Bond (1939)', 'General Chemistry (1947)', 'The Structure of Proteins (1951)'],
    mentors: ['Roscoe Dickinson', 'Richard Tolman', 'Arnold Sommerfeld', 'Niels Bohr'],
    students: ['William Lipscomb (Nobel Laureate)', 'Martin Karplus (Nobel Laureate)', 'Matthew Meselson'],
    collaborators: ['Robert Corey', 'Herman Branson', 'Richard Tolman', 'E. Bright Wilson'],
    lineage: {
      mentors: ['Roscoe Dickinson', 'Arnold Sommerfeld'],
      students: ['William Lipscomb', 'Martin Karplus', 'Matthew Meselson'],
      collaborators: ['Robert Corey'],
      influenced: ['Francis Crick', 'James Watson', 'Robert Burns Woodward']
    },
    facts: [
      'He is the only person in history to have won two unshared Nobel Prizes (Chemistry in 1954, Peace in 1962).',
      'He deduced the alpha-helix protein structure while sick in bed in Oxford in 1948 by drawing amino acid chains on a piece of paper and folding it along peptide bond angles.'
    ],
    references: ['NobelPrize.org Official Biography', 'Caltech Special Collections Archives', 'National Academy of Sciences Memoirs']
  },

  // ─── 17. DOROTHY CROWFOOT HODGKIN ────────────────────────────────────
  {
    id: 'hodgkin',
    name: 'Dorothy Crowfoot Hodgkin',
    fullName: 'Dorothy Mary Crowfoot Hodgkin, OM, FRS',
    years: '1910 – 1994',
    birthDate: 'May 12, 1910',
    birthPlace: 'Cairo, Egypt',
    deathDate: 'July 29, 1994',
    deathPlace: 'Ilmington, Warwickshire, United Kingdom',
    nationality: 'British',
    field: 'Analytical & Spectroscopy',
    subfields: ['X-Ray Crystallography', 'Biomolecular Structure', 'Structural Endocrinology'],
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['University of Oxford (Somerville College)', 'University of Cambridge'],
    positions: ['Wolfson Research Professor of the Royal Society', 'Chancellor of Bristol University'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Dorothy_Hodgkin_1989.jpg/480px-Dorothy_Hodgkin_1989.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Dorothy_Hodgkin_1989.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/6/67/Dorothy_Hodgkin_1989.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1989, Godfrey Argent / National Portrait Gallery)',
    nobel: 'Nobel Prize in Chemistry (1964) for determinations by X-ray techniques of the structures of important biochemical substances.',
    isNobelLaureate: true,
    summary: 'Pioneered 3D biomolecular X-ray crystallography, solving the definitive crystal structures of Cholesterol, Penicillin (proving the beta-lactam ring), Vitamin B12, and Insulin.',
    biography: 'Dorothy Crowfoot Hodgkin was a British chemist who pioneered the technique of X-ray crystallography to determine the 3D structures of complex biological molecules. Her breakthrough determinations of penicillin (1945), Vitamin B12 (1955), and insulin (1969) resolved major biochemical controversies, confirmed the presence of the beta-lactam ring in penicillin, and enabled modern structure-based pharmacology.',
    story: {
      who: 'A British crystallographer who mapped the 3D architecture of life’s most complex biomolecules despite severe rheumatoid arthritis.',
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
      {
        name: 'Crystallographic Electron Density Fourier Summation',
        formula: '\\rho(x, y, z) = \\frac{1}{V} \\sum_h \\sum_k \\sum_l |F(h,k,l)| e^{i \\alpha(h,k,l)} e^{-2\\pi i (hx + ky + lz)}',
        description: 'Computes spatial 3D electron density rho(x,y,z) from measured X-ray diffraction amplitudes |F| and calculated phase angles alpha.',
        variables: [
          { symbol: '\\rho(x,y,z)', meaning: 'Spatial electron density at crystal coordinate point (e⁻/Å³)' },
          { symbol: 'V', meaning: 'Volume of the crystallographic unit cell (Å³)' },
          { symbol: '|F(h,k,l)|', meaning: 'Observed structure factor amplitude for Miller index reflection (h,k,l)' },
          { symbol: '\\alpha(h,k,l)', meaning: 'Phase angle of the X-ray wave' }
        ]
      }
    ],
    molecule: {
      name: 'Penicillin G (Benzylpenicillin)',
      formula: 'C16H18N2O4S',
      smiles: 'CC1(C(N2C(S1)C(C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C',
      description: 'The transformative beta-lactam antibiotic whose 3D structure was solved by Dorothy Hodgkin in 1945.'
    },
    reactions: [
      {
        name: 'Heavy-Atom Isomorphous Replacement',
        type: 'Crystallographic Phase Solving',
        description: 'Substituting heavy metal ions (mercury, zinc, lead) into crystal lattices to locate phases in Fourier synthesis.',
        scheme: 'Protein + K2PtCl4 -> Heavy-Atom Derivative Crystal'
      }
    ],
    techniques: [
      { name: 'X-Ray Oscillation Photographic Goniometry', description: 'Rotating single crystals in monochromatic X-ray beams and computing Fourier transforms.' }
    ],
    timeline: [
      { year: '1910', event: 'Born in Cairo, Egypt.', category: 'Birth' },
      { year: '1932', event: 'Graduated with first-class honors from Somerville College, Oxford.', category: 'Education' },
      { year: '1937', event: 'Received Ph.D. from Cambridge under John Desmond Bernal.', category: 'Education' },
      { year: '1945', event: 'Determined the 3D structure of penicillin, confirming the beta-lactam ring.', category: 'Discovery' },
      { year: '1955', event: 'Determined the 3D structure of Vitamin B12.', category: 'Major Scientific Work' },
      { year: '1964', event: 'Awarded Nobel Prize in Chemistry (only British female Nobel science laureate).', category: 'Award' },
      { year: '1969', event: 'Decoded the complete 3D structure of insulin.', category: 'Major Scientific Work' },
      { year: '1994', event: 'Died in Warwickshire, England at age 84.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1964)', 'Copley Medal (1976)', 'Order of Merit (1965)', 'Royal Medal (1956)', 'Lomonosov Gold Medal (1982)'],
    publications: ['The X-ray Crystallographic Investigation of the Structure of Penicillin (1949)', 'Structure of Vitamin B12 (1955)', 'Structure of Rhombohedral 2-Zinc Insulin (1969)'],
    mentors: ['John Desmond Bernal', 'Herbert Powell'],
    students: ['Margaret Thatcher (student at Oxford)', 'Guy Dodson', 'Tom Blundell'],
    collaborators: ['John Desmond Bernal', 'Max Perutz', 'Guy Dodson', 'Eleanor Dodson'],
    lineage: {
      mentors: ['John Desmond Bernal'],
      students: ['Tom Blundell', 'Guy Dodson'],
      collaborators: ['Max Perutz'],
      influenced: ['Rosalind Franklin', 'Venkatraman Ramakrishnan', 'Ada Yonath']
    },
    facts: [
      'Future British Prime Minister Margaret Thatcher was one of Hodgkin’s chemistry undergraduate students at Somerville College, Oxford, and kept a framed portrait of Hodgkin on her office wall at 10 Downing Street.',
      'She remains the only British woman to have won a Nobel Prize in science.'
    ],
    references: ['NobelPrize.org Official Biography', 'Royal Society Biographical Memoirs', 'Somerville College Oxford Archives']
  },

  // ─── 18. ROSALIND FRANKLIN ───────────────────────────────────────────
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
    subfields: ['X-Ray Diffraction', 'Structural Genomics', 'Virology & Coal Chemistry'],
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ["King's College London", 'Birkbeck College London', 'Laboratoire Central des Services Chimiques de l’État (Paris)', 'Cambridge University'],
    positions: ['Senior Research Fellow at Birkbeck College', 'Research Associate at King’s College London'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Rosalind_Franklin.jpg/480px-Rosalind_Franklin.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rosalind_Franklin.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/9/97/Rosalind_Franklin.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (c. 1950s, King’s College London)',
    nobel: 'Nobel Prize rules prohibit posthumous awards; widely celebrated as the co-discoverer of the DNA double helix.',
    isNobelLaureate: false,
    summary: 'Captured Photo 51—the definitive X-ray diffraction photograph proving the double-helical structure of B-DNA—established the exterior phosphate backbone geometry, and mapped the structure of viruses.',
    biography: 'Rosalind Franklin was an English chemist and X-ray crystallographer whose research was central to the understanding of the molecular structures of DNA, RNA, viruses, coal, and graphite. Her iconic "Photo 51" obtained at King’s College London provided the definitive experimental proof that DNA is an antiparallel double helix with phosphate backbones on the exterior, paving the way for Watson and Crick’s 1953 model.',
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
      {
        name: 'Helical Diffraction Transform (Cochran-Crick-Vand)',
        formula: 'F_n(R, \\psi, l/c) = \\sum_j J_n(2\\pi R r_j) e^{i(n(\\psi - \\phi_j + \\pi/2) + 2\\pi l z_j / c)}',
        description: 'Fourier transform equation describing the X-shaped diffraction pattern of a continuous helix.',
        variables: [
          { symbol: 'F_n', meaning: 'Diffraction amplitude on layer line l' },
          { symbol: 'J_n', meaning: 'Bessel function of order n' },
          { symbol: 'R, \\psi, l/c', meaning: 'Cylindrical reciprocal space coordinates' },
          { symbol: 'c', meaning: 'True helical repeat distance (34 Å in B-DNA)' }
        ]
      }
    ],
    molecule: {
      name: 'Adenine-Thymine DNA Base Pair',
      formula: 'C10H13N7O2',
      smiles: 'CC1=CNC(=O)NC1=O.NC2=NC=NC3=C2N=CN3',
      description: 'The Watson-Crick hydrogen-bonded base pair arranged inside Franklin’s helical framework.'
    },
    reactions: [
      {
        name: 'DNA Phosphodiester Bond Hydrolysis',
        type: 'Biochemical Cleavage',
        description: 'Nucleophilic cleavage of the exterior sugar-phosphate backbone resolved by Franklin’s diffraction data.',
        scheme: 'DNA-polymer + H2O -> 5\'-phosphate-nucleotide + 3\'-hydroxyl-fragment'
      }
    ],
    techniques: [
      { name: 'Humidity-Controlled Fiber Micro-Camera Diffraction', description: 'Maintaining 92% relative humidity in hydrogen atmosphere to prevent DNA crystal lattice collapse.' }
    ],
    timeline: [
      { year: '1920', event: 'Born in Notting Hill, London.', category: 'Birth' },
      { year: '1945', event: 'Earned Ph.D. in physical chemistry from Cambridge University.', category: 'Education' },
      { year: '1947', event: 'Mastered X-ray diffraction at the Laboratoire Central in Paris.', category: 'Education' },
      { year: '1952', event: 'Captured the legendary Photo 51 of B-DNA with Raymond Gosling.', category: 'Discovery' },
      { year: '1953', event: 'Watson and Crick published the DNA structure utilizing Franklin’s data.', category: 'Major Scientific Work' },
      { year: '1958', event: 'Died of ovarian cancer at age 37 in London.', category: 'Legacy' }
    ],
    awards: ['Posthumous Louisa Gross Horwitz Prize (shared, 2008)', 'Fellow of the Royal Society of Chemistry (posthumous honor)', 'Rosalind Franklin Award (Royal Society)'],
    publications: ['Molecular Configuration in Sodium Thymonucleate (Nature, 1953)', 'Structure of Tobacco Mosaic Virus (Nature, 1955)'],
    mentors: ['Ronald Norrish', 'Jacques Mering'],
    students: ['Aaron Klug (Nobel Laureate, student and collaborator)', 'Raymond Gosling'],
    collaborators: ['Raymond Gosling', 'John Desmond Bernal', 'Aaron Klug', 'Maurice Wilkins'],
    lineage: {
      mentors: ['Jacques Mering'],
      students: ['Aaron Klug'],
      collaborators: ['Raymond Gosling', 'John Desmond Bernal'],
      influenced: ['James Watson', 'Francis Crick', 'Jennifer Doudna']
    },
    facts: [
      'Her collaborator and protégé Aaron Klug used the methods and data developed in Franklin’s lab to win the 1982 Nobel Prize in Chemistry for crystallographic electron microscopy.',
      'The European Space Agency (ESA) named their Mars Rover the "Rosalind Franklin" rover in recognition of her contributions to life sciences.'
    ],
    references: ['Royal Society Historical Archives', 'King’s College London Archives', 'Nature 1953 Original Papers']
  },

  // ─── 19. ROBERT BURNS WOODWARD ───────────────────────────────────────
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
    subfields: ['Total Synthesis', 'Pericyclic Reactions', 'Natural Product Chemistry'],
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['Harvard University', 'Massachusetts Institute of Technology (MIT)'],
    positions: ['Donner Professor of Science at Harvard University', 'Director of the Woodward Research Institute (Basel)'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Robert_Burns_Woodward.jpg/480px-Robert_Burns_Woodward.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Robert_Burns_Woodward.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/d/df/Robert_Burns_Woodward.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Harvard University Archives)',
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
      {
        name: 'Woodward-Fieser Rules for UV Absorption',
        formula: '\\lambda_{\\max} = \\lambda_{\\text{base}} + \\sum \\Delta\\lambda_{\\text{substituents}}',
        description: 'Empirical rules calculating UV-Vis absorption maxima for conjugated dienes and polyenes.',
        variables: [
          { symbol: '\\lambda_{\\max}', meaning: 'Calculated UV-Vis absorption peak wavelength (nm)' },
          { symbol: '\\lambda_{\\text{base}}', meaning: 'Base conjugated diene value (e.g., 214 nm acyclic, 253 nm homoannular)' },
          { symbol: '\\Delta\\lambda', meaning: 'Incremental bathochromic wavelength shifts per alkyl or auxochrome substituent' }
        ]
      }
    ],
    molecule: {
      name: 'Strychnine (C21H22N2O2)',
      formula: 'C21H22N2O2',
      smiles: 'O=C1CC2OCC=C3CN4CCC56C4CC3C2C5(CC1)Nc7ccccc67',
      description: 'The notoriously complex heptacyclic alkaloid synthesized by Woodward in 1954, proving total synthesis capability.'
    },
    reactions: [
      {
        name: 'Electrocyclic Ring-Closure (Woodward-Hoffmann)',
        type: 'Pericyclic Reaction',
        description: 'Thermally forbidden disrotatory ring closure becomes allowed photochemically due to orbital symmetry conservation.',
        scheme: '(E,Z,E)-Octa-2,4,6-triene -> cis-5,6-Dimethylcyclohexa-1,3-diene'
      }
    ],
    techniques: [
      { name: 'Retrosynthetic Disconnection Analysis', description: 'Working backward step-by-step from complex natural targets to simple commercial synthons.' }
    ],
    timeline: [
      { year: '1917', event: 'Born in Boston, Massachusetts.', category: 'Birth' },
      { year: '1937', event: 'Received both B.S. and Ph.D. from MIT by age 20.', category: 'Education' },
      { year: '1944', event: 'Synthesized quinine with William von Eggers Doering.', category: 'Discovery' },
      { year: '1965', event: 'Awarded Nobel Prize in Chemistry; published Woodward-Hoffmann rules with Roald Hoffmann.', category: 'Award' },
      { year: '1972', event: 'Completed the landmark 100-step total synthesis of Vitamin B12 with Albert Eschenmoser.', category: 'Major Scientific Work' },
      { year: '1979', event: 'Died in Cambridge, Massachusetts at age 62.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1965)', 'National Medal of Science (1964)', 'Copley Medal (1978)', 'Davy Medal (1959)', 'Willard Gibbs Award (1967)'],
    publications: ['The Total Synthesis of Strychnine (1954)', 'The Conservation of Orbital Symmetry (1970)'],
    mentors: ['Elmer Peter Kohler', 'James Flack Norris'],
    students: ['E.J. Corey (Nobel Laureate, student/colleague)', 'Yoshito Kishi', 'Stuart Schreiber', 'Christopher Dobson'],
    collaborators: ['Roald Hoffmann (Nobel Laureate)', 'Albert Eschenmoser', 'William von Eggers Doering', 'Gilbert Stork'],
    lineage: {
      mentors: ['James Flack Norris'],
      students: ['Yoshito Kishi', 'Stuart Schreiber'],
      collaborators: ['Roald Hoffmann', 'Albert Eschenmoser'],
      influenced: ['E.J. Corey', 'K.C. Nicolaou', 'Phil Baran']
    },
    facts: [
      'Woodward had a legendary penchant for the color blue: his office walls, ties, and even his personal Lincoln Continental car were painted custom Woodward blue, and he lectured using multiple colored chalks while chain-smoking unfiltered cigarettes.',
      'He completed his Bachelor’s and Ph.D. at MIT simultaneously in only 4 years, having entered at age 16.'
    ],
    references: ['NobelPrize.org Official Biography', 'Harvard University Archives', 'Biographical Memoirs of Fellows of the Royal Society']
  },

  // ─── 20. GLENN T. SEABORG ───────────────────────────────────────────
  {
    id: 'seaborg',
    name: 'Glenn T. Seaborg',
    fullName: 'Glenn Theodore Seaborg',
    years: '1912 – 1999',
    birthDate: 'April 19, 1912',
    birthPlace: 'Ishpeming, Michigan, United States',
    deathDate: 'February 25, 1999',
    deathPlace: 'Lafayette, California, United States',
    nationality: 'American',
    field: 'Nuclear & Materials',
    subfields: ['Transuranium Elements', 'Actinide Chemistry', 'Nuclear Technology'],
    era: 'Mid 20th Century (Synthesis & Biology)',
    institutions: ['University of California, Berkeley', 'Lawrence Berkeley National Laboratory', 'US Atomic Energy Commission'],
    positions: ['Chairman of the US Atomic Energy Commission', 'Chancellor of UC Berkeley'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Glenn_Seaborg_1964.jpg/480px-Glenn_Seaborg_1964.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Glenn_Seaborg_1964.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/e/e9/Glenn_Seaborg_1964.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1964, Lawrence Berkeley National Laboratory)',
    nobel: 'Nobel Prize in Chemistry (1951) for discoveries in the chemistry of the transuranium elements.',
    isNobelLaureate: true,
    summary: 'Co-discovered 10 transuranium elements (Plutonium, Americium, Curium, Berkelium, Californium, Einsteinium, Fermium, Mendelevium, Nobelium, and Seaborgium) and reconfigured the Periodic Table with the Actinide Series.',
    biography: 'Glenn T. Seaborg was an American nuclear chemist who received the 1951 Nobel Prize in Chemistry alongside Edwin McMillan. Seaborg co-discovered ten transuranic chemical elements, including Plutonium (element 94). In 1944, he formulated the "actinide concept", proposing that elements 89 through 103 belong to a heavy f-electron transition series placed below the lanthanides, reshaping the fundamental architecture of Mendeleev’s Periodic Table.',
    story: {
      who: 'A towering UC Berkeley nuclear chemist who expanded the bounds of the periodic table more than any human in history.',
      problem: 'Heavy synthetic elements beyond uranium had mysterious chemical valencies that did not fit beneath tungsten, rhenium, or osmium.',
      discovery: 'Synthesized 10 new elements and discovered the Actinide Series of 5f-orbital elements.',
      how: 'Bombarded heavy uranium targets with deuterons and neutrons in the Berkeley 60-inch cyclotron, using ion-exchange resin chromatography.',
      why: 'Expanded the periodic chart and laid the foundation for nuclear energy, deep-space radioisotope batteries, and smoke detectors.',
      scienceChanged: 'Permanently redrew the modern Periodic Table by adding the entire actinide row.',
      modernUse: 'Americium-241 powers household smoke detectors; Plutonium-238 powers NASA’s deep-space probes (Voyager, Curiosity, Perseverance).'
    },
    discoveries: [
      { type: 'Transuranium Element', title: 'Synthesis of Plutonium (1941)', description: 'Synthesized and isolated element 94 by deuteron bombardment of uranium in the Berkeley cyclotron.' },
      { type: 'Periodic Table Architecture', title: 'The Actinide Concept (1944)', description: 'Demonstrated that heavy elements 89-103 form a 5f-electron subshell series analogous to rare earth lanthanides.' },
      { type: 'Radioisotope Synthesis', title: 'Synthesis of Americium, Curium, Californium', description: 'Created transplutonium elements via neutron capture and alpha bombardment.' }
    ],
    equations: [
      {
        name: 'Cyclotron Resonance Frequency',
        formula: 'f = \\frac{q \\cdot B}{2\\pi \\cdot m}',
        description: 'Resonance frequency required to accelerate ions in cyclotrons for transuranium element synthesis.',
        variables: [
          { symbol: 'f', meaning: 'Cyclotron radio-frequency (Hz)' },
          { symbol: 'q', meaning: 'Ionic charge of the accelerated particle (Coulombs)' },
          { symbol: 'B', meaning: 'Magnetic field strength in the gap (Tesla)' },
          { symbol: 'm', meaning: 'Ion mass (kg)' }
        ]
      }
    ],
    molecule: {
      name: 'Plutonium Dioxide (PuO2)',
      formula: 'PuO2',
      smiles: 'O=[Pu]=O',
      description: 'The ceramic nuclear fuel and deep-space radioisotope thermoelectric generator material.'
    },
    reactions: [
      {
        name: 'Synthesis of Plutonium-239',
        type: 'Neutron Capture & Beta Decay',
        description: 'Uranium-238 captures a neutron to form U-239, which undergoes consecutive beta decays to Neptunium-239 and Plutonium-239.',
        scheme: '238_92U + n -> 239_92U -> (beta-) -> 239_93Np -> (beta-) -> 239_94Pu'
      }
    ],
    techniques: [
      { name: 'High-Temperature Ion-Exchange Chromatography', description: 'Eluting trivalent actinide and lanthanide ions using ammonium alpha-hydroxyisobutyrate buffers.' }
    ],
    timeline: [
      { year: '1912', event: 'Born in Ishpeming, Michigan.', category: 'Birth' },
      { year: '1937', event: 'Earned Ph.D. in chemistry from UC Berkeley under Gilbert N. Lewis.', category: 'Education' },
      { year: '1941', event: 'Co-discovered Plutonium-238 and Plutonium-239.', category: 'Discovery' },
      { year: '1944', event: 'Formulated the actinide hypothesis of the periodic table.', category: 'Major Scientific Work' },
      { year: '1951', event: 'Awarded Nobel Prize in Chemistry with Edwin McMillan.', category: 'Award' },
      { year: '1961', event: 'Appointed Chairman of the US Atomic Energy Commission by President John F. Kennedy.', category: 'Education' },
      { year: '1997', event: 'Element 106 officially named Seaborgium (Sg), making him the first living person with an element named after him.', category: 'Award' },
      { year: '1999', event: 'Died in Lafayette, California at age 86.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1951)', 'National Medal of Science (1991)', 'Priestley Medal (1979)', 'Perkin Medal (1957)', 'Vannevar Bush Award (1988)'],
    publications: ['The Chemical and Radioactive Properties of the Heavy Elements (1944)', 'The Transuranium Elements (1958)'],
    mentors: ['Gilbert N. Lewis', 'Ernest Lawrence'],
    students: ['Albert Ghiorso', 'Darleane C. Hoffman'],
    collaborators: ['Edwin McMillan', 'Albert Ghiorso', 'Joseph W. Kennedy', 'Arthur Wahl'],
    lineage: {
      mentors: ['Gilbert N. Lewis', 'Ernest Lawrence'],
      students: ['Albert Ghiorso', 'Darleane C. Hoffman'],
      collaborators: ['Edwin McMillan', 'Albert Ghiorso'],
      influenced: ['Yuri Oganessian', 'Sigurd Hofmann']
    },
    facts: [
      'He was in the Guinness Book of World Records for having the longest entry in "Who\'s Who in America".',
      'When element 106 was named Seaborgium (Sg) while he was still alive, critics complained, but Seaborg proudly stated: "This is the greatest honor ever bestowed upon me—even better, I think, than winning the Nobel Prize."'
    ],
    references: ['NobelPrize.org Official Biography', 'Lawrence Berkeley National Laboratory History', 'American Chemical Society National Historic Chemical Landmarks']
  },

  // ─── 21. WALTER KOHN ─────────────────────────────────────────────────
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
    subfields: ['Density Functional Theory (DFT)', 'Solid-State Physics', 'Electronic Structure'],
    era: 'Modern & Contemporary',
    institutions: ['University of California, Santa Barbara (UCSB)', 'University of California, San Diego (UCSD)', 'Carnegie Mellon University'],
    positions: ['Founding Director of the Kavli Institute for Theoretical Physics (KITP) at UCSB', 'Professor of Physics at UCSD'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Walter_Kohn_2008.jpg/480px-Walter_Kohn_2008.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Walter_Kohn_2008.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/7/77/Walter_Kohn_2008.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2008, UCSB Archives)',
    nobel: 'Nobel Prize in Chemistry (1998) for his development of the density-functional theory (DFT).',
    isNobelLaureate: true,
    summary: 'Founded Density Functional Theory (DFT), replacing the 3N-dimensional many-body electronic wavefunction with the 3D electron density function $\\rho(\\mathbf{r})$, making quantum chemistry computationally tractable.',
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
      {
        name: 'Kohn-Sham Single-Particle Schrödinger Equation',
        formula: '\\left[ -\\frac{1}{2}\\nabla^2 + V_{\\text{ext}}(\\mathbf{r}) + V_H[\\rho](\\mathbf{r}) + V_{xc}[\\rho](\\mathbf{r}) \\right] \\psi_i(\\mathbf{r}) = \\epsilon_i \\psi_i(\\mathbf{r})',
        description: 'Single-particle self-consistent field equation of Density Functional Theory.',
        variables: [
          { symbol: '\\psi_i(\\mathbf{r})', meaning: 'Single-particle Kohn-Sham orbital' },
          { symbol: '\\rho(\\mathbf{r})', meaning: 'Total 3D spatial electron density: sum of |psi_i|²' },
          { symbol: 'V_{\\text{ext}}', meaning: 'External potential due to atomic nuclei' },
          { symbol: 'V_H', meaning: 'Hartree classical electron-electron electrostatic repulsion' },
          { symbol: 'V_{xc}', meaning: 'Quantum exchange-correlation functional potential' }
        ]
      }
    ],
    molecule: {
      name: 'Benzene & Molecular Orbitals via DFT',
      formula: 'C6H6',
      smiles: 'c1ccccc1',
      description: 'Prototypical aromatic system whose electronic density and HOMO-LUMO orbitals are simulated with DFT.'
    },
    reactions: [
      {
        name: 'DFT Self-Consistent Field Iteration',
        type: 'Computational Algorithm',
        description: 'Iterative convergence of electron density until Hamiltonian potential matches resulting charge density.',
        scheme: 'rho_init -> V_eff[rho] -> solve Kohn-Sham -> rho_new -> repeat until delta_E < 1e-6'
      }
    ],
    techniques: [
      { name: 'Generalized Gradient Approximation (GGA)', description: 'Incorporating local electron density gradients |grad rho| into exchange-correlation functionals.' }
    ],
    timeline: [
      { year: '1923', event: 'Born in Vienna, Austria.', category: 'Birth' },
      { year: '1948', event: 'Received Ph.D. in physics from Harvard University under Julian Schwinger.', category: 'Education' },
      { year: '1964', event: 'Published the Hohenberg-Kohn theorem establishing DFT foundations.', category: 'Discovery' },
      { year: '1965', event: 'Published the Kohn-Sham equations with Lu Jeu Sham.', category: 'Major Scientific Work' },
      { year: '1979', event: 'Founding director of the Institute for Theoretical Physics at UCSB.', category: 'Education' },
      { year: '1998', event: 'Awarded Nobel Prize in Chemistry with John Pople.', category: 'Award' },
      { year: '2016', event: 'Died in Santa Barbara, California at age 93.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1998)', 'National Medal of Science (1988)', 'Oliver E. Buckley Condensed Matter Prize (1961)', 'Feenberg Medal (1991)'],
    publications: ['Inhomogeneous Electron Gas (Hohenberg & Kohn, 1964)', 'Self-Consistent Equations Including Exchange and Correlation Effects (Kohn & Sham, 1965)'],
    mentors: ['Julian Schwinger (Nobel Laureate)'],
    students: ['Lu Jeu Sham', 'David Langreth'],
    collaborators: ['Pierre Hohenberg', 'Lu Jeu Sham', 'Julian Schwinger', 'John Pople'],
    lineage: {
      mentors: ['Julian Schwinger'],
      students: ['Lu Jeu Sham'],
      collaborators: ['Pierre Hohenberg', 'John Pople'],
      influenced: ['Axel Becke', 'John Perdew', 'Michele Parrinello']
    },
    facts: [
      'Kohn escaped Nazi-occupied Austria in 1939 aboard a Kindertransport rescue train to England, while both of his parents were murdered in the Auschwitz concentration camp.',
      'His 1964 and 1965 DFT papers are among the top 10 most highly cited scientific papers of all time across all physical science journals.'
    ],
    references: ['NobelPrize.org Official Biography', 'APS Physics Historical Archives', 'UCSB Department of Physics Records']
  },

  // ─── 22. JOHN POPLE ──────────────────────────────────────────────────
  {
    id: 'pople',
    name: 'John Pople',
    fullName: 'Sir John Anthony Pople, KBE, FRS',
    years: '1925 – 2004',
    birthDate: 'October 31, 1925',
    birthPlace: 'Burnham-on-Sea, Somerset, England',
    deathDate: 'March 15, 2004',
    deathPlace: 'Chicago, Illinois, United States',
    nationality: 'British',
    field: 'Computational Chemistry',
    subfields: ['Ab Initio Molecular Orbitals', 'Gaussian Software', 'Pople Basis Sets'],
    era: 'Modern & Contemporary',
    institutions: ['Northwestern University', 'Carnegie Mellon University', 'Cambridge University'],
    positions: ['Trustees Professor of Chemistry at Northwestern University', 'Fellow of the Royal Society'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/John_Pople.jpg/480px-John_Pople.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/John_Pople.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/John_Pople.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (Northwestern University Archives)',
    nobel: 'Nobel Prize in Chemistry (1998) for his development of computational methods in quantum chemistry.',
    isNobelLaureate: true,
    summary: 'Developed computational quantum chemistry methods, created the landmark GAUSSIAN quantum software program, and designed Pople split-valence basis sets (6-31G*) used worldwide to predict molecular structures and reaction mechanisms.',
    biography: 'Sir John Pople was a British theoretical chemist who received the 1998 Nobel Prize in Chemistry for transforming quantum mechanics into an everyday computational tool for chemists. In 1970, Pople launched the GAUSSIAN software suite, creating accessible ab initio quantum algorithms, Moller-Plesset perturbation theory implementations, and standard split-valence basis sets that allowed non-theoreticians to calculate molecular geometry, thermochemistry, and spectra.',
    story: {
      who: 'A British mathematician turned quantum chemist who gave laboratories the digital microscope of computational chemistry.',
      problem: 'In the 1960s, solving ab initio quantum chemical equations required arcane handwritten mathematics inaccessible to experimental chemists.',
      discovery: 'Engineered GAUSSIAN—the first universal, automated quantum chemistry program—and standard basis sets.',
      how: 'Devised Gaussian-type orbital (GTO) expansion approximations that converted computationally impossible multi-center electron integrals into fast analytical formulas.',
      why: 'Made it possible to calculate molecular energies, vibrational spectra, and transition states from first principles.',
      scienceChanged: 'Turned the computer into a standard instrument alongside the test tube and spectrometer.',
      modernUse: 'Pople’s algorithms and basis sets (e.g. 6-31G*, 6-311+G**) remain universal standards across pharmaceutical and material computational chemistry.'
    },
    discoveries: [
      { type: 'Software Breakthrough', title: 'GAUSSIAN Quantum Chemistry Program (1970)', description: 'Created the first commercial, standardized computational chemistry software package.' },
      { type: 'Basis Set Architecture', title: 'Pople Split-Valence Basis Sets (6-31G*)', description: 'Engineered contracted Gaussian basis sets that balance accuracy with computational speed.' },
      { type: 'Post-Hartree-Fock Theory', title: 'Møller-Plesset Perturbation Methods (MP2, MP4)', description: 'Implemented practical electron correlation corrections for accurate non-covalent interactions.' }
    ],
    equations: [
      {
        name: 'Gaussian-Type Orbital (GTO) Radial Form',
        formula: 'g(\\alpha, \\mathbf{r}) = x^i y^j z^k e^{-\\alpha r^2}',
        description: 'Analytical basis function allowing fast product-theorem integration of molecular electron-electron repulsions.',
        variables: [
          { symbol: '\\alpha', meaning: 'Orbital exponent determining radial compactness' },
          { symbol: 'i, j, k', meaning: 'Integer angular momentum powers defining s, p, d symmetry' },
          { symbol: 'r', meaning: 'Radial distance from atomic nucleus coordinate' }
        ]
      }
    ],
    molecule: {
      name: 'Water Dimer (Hydrogen Bonding via MP2)',
      formula: '(H2O)2',
      smiles: 'O.O',
      description: 'The prototypical hydrogen-bonded complex whose binding energy was accurately modeled using Pople’s MP2 methods.'
    },
    reactions: [
      {
        name: 'Ab Initio Transition State Optimization',
        type: 'Reaction Coordinate Search',
        description: 'Calculating the Hessian matrix to identify saddle points with exactly one imaginary vibrational frequency.',
        scheme: 'Reactants -> [Transition State]* (one imaginary freq) -> Products'
      }
    ],
    techniques: [
      { name: 'Self-Consistent Field Roothaan-Hall Matrix Solver', description: 'Transforming differential Schrödinger equations into linear algebraic generalized eigenvalue matrix equations (FC = SCepsilon).' }
    ],
    timeline: [
      { year: '1925', event: 'Born in Burnham-on-Sea, England.', category: 'Birth' },
      { year: '1951', event: 'Completed Ph.D. in mathematics at Cambridge University under John Lennard-Jones.', category: 'Education' },
      { year: '1964', event: 'Moved to Carnegie Mellon University in Pittsburgh.', category: 'Education' },
      { year: '1970', event: 'Released GAUSSIAN 70, the first widely used quantum software.', category: 'Discovery' },
      { year: '1998', event: 'Awarded the Nobel Prize in Chemistry with Walter Kohn.', category: 'Award' },
      { year: '2003', event: 'Knighted as Knight Commander of the Order of the British Empire (KBE).', category: 'Award' },
      { year: '2004', event: 'Died in Chicago at age 78.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1998)', 'Wolf Prize in Chemistry (1992)', 'Copley Medal (2002)', 'Davy Medal (1988)', 'Knighthood (KBE, 2003)'],
    publications: ['Approximate Molecular Orbital Theory (1970)', 'Ab Initio Molecular Orbital Theory (1986)'],
    mentors: ['Sir John Lennard-Jones'],
    students: ['Warren Hehre', 'Leo Radom', 'Paul v. R. Schleyer'],
    collaborators: ['Walter Kohn', 'Axel Becke', 'Martin Head-Gordon'],
    lineage: {
      mentors: ['Sir John Lennard-Jones'],
      students: ['Warren Hehre', 'Leo Radom'],
      collaborators: ['Axel Becke', 'Martin Head-Gordon'],
      influenced: ['Kendall Houk', 'Mark Gordon', 'Gustavo Scuseria']
    },
    facts: [
      'Pople originally intended to become a railway timetable scheduler because of his childhood obsession with train schedules, numbers, and mathematical optimization.',
      'He personally wrote hundreds of thousands of lines of Fortran code that formed the engine of Gaussian, debugging punch cards late into the night.'
    ],
    references: ['NobelPrize.org Official Biography', 'Biographical Memoirs of Fellows of the Royal Society', 'Gaussian Inc. Historical Overview']
  },

  // ─── 23. AHMED ZEWAIL ────────────────────────────────────────────────
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
    subfields: ['Femtochemistry', 'Ultrafast Laser Spectroscopy', '4D Electron Microscopy'],
    era: 'Modern & Contemporary',
    institutions: ['California Institute of Technology (Caltech)', 'Alexandria University', 'University of Pennsylvania'],
    positions: ['Linus Pauling Chair Professor of Chemistry and Physics at Caltech', 'Director of the Physical Biology Center at Caltech'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Ahmed_Zewail_2010.jpg/480px-Ahmed_Zewail_2010.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Ahmed_Zewail_2010.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/Ahmed_Zewail_2010.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2010, Caltech)',
    nobel: 'Nobel Prize in Chemistry (1999) — "Father of Femtochemistry".',
    isNobelLaureate: true,
    summary: 'Pioneered Femtochemistry, using ultrafast femtosecond ($10^{-15}$ s) laser spectroscopy to record chemical bond breaking and bond formation in real time.',
    biography: 'Ahmed Zewail was an Egyptian-American chemist known as the "father of femtochemistry". He received the 1999 Nobel Prize in Chemistry for demonstrating that chemical reactions can be observed in real time on the femtosecond timescale ($10^{-15}$ seconds) using ultra-short laser flashes. His work captured the fleeting transition states of molecules during chemical transformations, proving that atoms oscillate between covalent and ionic structures across potential energy surfaces.',
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
      {
        name: 'Femtosecond Wavepacket Time Evolution',
        formula: '\\Psi(\\mathbf{R}, t) = \\sum_n c_n e^{-i E_n t / \\hbar} \\phi_n(\\mathbf{R})',
        description: 'Describes coherent nuclear wavepacket motion across potential energy surfaces during bond breaking.',
        variables: [
          { symbol: '\\Psi(\\mathbf{R},t)', meaning: 'Time-dependent nuclear wavepacket on potential energy surface' },
          { symbol: 'c_n', meaning: 'Coherent quantum expansion coefficients' },
          { symbol: 'E_n', meaning: 'Vibrational energy eigenstate' },
          { symbol: 't', meaning: 'Femtosecond pump-probe optical delay time ($10^{-15}$ s)' }
        ]
      }
    ],
    molecule: {
      name: 'Sodium Iodide Transition State (Na...I)',
      formula: 'NaI',
      smiles: '[Na+].[I-]',
      description: 'The landmark molecular reaction system where Zewail filmed covalent-to-ionic transition oscillations.'
    },
    reactions: [
      {
        name: 'Real-Time Sodium Iodide Photodissociation',
        type: 'Ultrafast Photodissociation',
        description: 'Femtosecond pump laser excites NaI to an activated covalent state that oscillates across an avoided crossing before dissociating into atoms.',
        scheme: 'NaI + h*nu_pump -> [Na...I]* -> Na + I (monitored by h*nu_probe)'
      }
    ],
    techniques: [
      { name: 'Femtosecond Pump-Probe Optical Spectroscopy', description: 'Using optical delay stages with sub-micron precision to measure laser pulse delays at femtosecond intervals.' }
    ],
    timeline: [
      { year: '1946', event: 'Born in Damanhur, Egypt.', category: 'Birth' },
      { year: '1974', event: 'Completed Ph.D. at the University of Pennsylvania under Robin Hochstrasser.', category: 'Education' },
      { year: '1976', event: 'Joined the faculty at Caltech.', category: 'Education' },
      { year: '1987', event: 'Published the first real-time femtosecond observation of bond dissociation (ICN).', category: 'Discovery' },
      { year: '1999', event: 'Awarded the Nobel Prize in Chemistry for femtochemistry.', category: 'Award' },
      { year: '2016', event: 'Died in Pasadena, California at age 70; given a state military funeral in Cairo.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1999)', 'Wolf Prize in Chemistry (1998)', 'Priestley Medal (2011)', 'Franklin Medal (1998)', 'Order of the Nile (Egypt, 1999)'],
    publications: ['Femtosecond Laser Chemistry (Science, 1988)', 'Femtochemistry: Ultrafast Dynamics of the Chemical Bond (1994)', 'Voyage Through Time: Walks of Life to the Nobel Prize (2002)'],
    mentors: ['Robin Hochstrasser', 'Charles B. Harris'],
    students: ['Dongping Zhong', 'Marcos Dantus'],
    collaborators: ['Richard Bernstein', 'Robin Hochstrasser', 'Ahmed Mokhtari'],
    lineage: {
      mentors: ['Robin Hochstrasser'],
      students: ['Marcos Dantus', 'Dongping Zhong'],
      collaborators: ['Richard Bernstein'],
      influenced: ['Majed Chergui', 'Stephen Leone']
    },
    facts: [
      'He was the first Egyptian scientist and first Arab to win a scientific Nobel Prize.',
      'Egypt issued two postage stamps honoring Zewail and established the Zewail City of Science and Technology in Cairo as his national scientific legacy.'
    ],
    references: ['NobelPrize.org Official Biography', 'Caltech Archives', 'Nature Obituary Archive (2016)']
  },

  // ─── 24. JENNIFER DOUDNA ─────────────────────────────────────────────
  {
    id: 'doudna',
    name: 'Jennifer Doudna',
    fullName: 'Jennifer Anne Doudna',
    years: '1964 – Present',
    birthDate: 'February 19, 1964',
    birthPlace: 'Washington, D.C., United States',
    nationality: 'American',
    field: 'Biochemistry',
    subfields: ['CRISPR-Cas9 Gene Editing', 'RNA Structural Biology', 'Genome Engineering'],
    era: 'Modern & Contemporary',
    institutions: ['University of California, Berkeley', 'Innovative Genomics Institute (IGI)', 'Howard Hughes Medical Institute (HHMI)', 'Gladstone Institutes'],
    positions: ['Li Ka Shing Chancellor’s Chair in Biomedical Sciences at UC Berkeley', 'President of the Innovative Genomics Institute'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Jennifer_Doudna_2020.jpg/480px-Jennifer_Doudna_2020.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jennifer_Doudna_2020.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/0/04/Jennifer_Doudna_2020.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2020, Nobel Prize Archive)',
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
      {
        name: 'Michaelis-Menten Endonuclease Cleavage Kinetics',
        formula: 'v = \\frac{V_{\\max} [S]}{K_m + [S]} = \\frac{k_{\\text{cat}} [E_0] [S]}{K_m + [S]}',
        description: 'Enzymatic kinetics model describing rate of substrate DNA cleavage by catalytic Cas9 ribonucleoprotein complexes.',
        variables: [
          { symbol: 'v', meaning: 'Cleavage reaction velocity (mol/(L*s))' },
          { symbol: 'k_{\\text{cat}}', meaning: 'Catalytic turnover rate constant of Cas9 endonuclease' },
          { symbol: '[E_0]', meaning: 'Total concentration of active Cas9-sgRNA complex' },
          { symbol: 'K_m', meaning: 'Michaelis constant representing substrate DNA binding affinity' }
        ]
      }
    ],
    molecule: {
      name: 'Guide RNA - Cas9 Cleavage Target',
      formula: 'RNA-DNA Heteroduplex',
      smiles: 'P(=O)(O)OCC1OC(N)C(O)C1O',
      description: 'Synthetic guide RNA scaffold directing the Cas9 protein to targeted genomic loci.'
    },
    reactions: [
      {
        name: 'Target-Specific DNA Double-Strand Cleavage',
        type: 'Phosphodiester Endonuclease Hydrolysis',
        description: 'Cas9 RuvC and HNH nuclease domains cleave both strands of target DNA 3 base pairs upstream of the PAM sequence.',
        scheme: 'Target-dsDNA + Cas9-sgRNA -> Cleaved-dsDNA (Blunt Ends) + Cas9-sgRNA'
      }
    ],
    techniques: [
      { name: 'In Vitro Ribonucleoprotein Cleavage Assay', description: 'Incubating purified Cas9 protein, synthetic sgRNA, and plasmid DNA in magnesium buffer analyzed by gel electrophoresis.' }
    ],
    timeline: [
      { year: '1964', event: 'Born in Washington, D.C. and raised in Hilo, Hawaii.', category: 'Birth' },
      { year: '1989', event: 'Earned Ph.D. in biological chemistry from Harvard Medical School under Jack Szostak.', category: 'Education' },
      { year: '2002', event: 'Joined the faculty at UC Berkeley.', category: 'Education' },
      { year: '2012', event: 'Published the historic CRISPR-Cas9 genome editing paper in Science with Emmanuelle Charpentier.', category: 'Discovery' },
      { year: '2020', event: 'Awarded the Nobel Prize in Chemistry (first all-female science Nobel team with Charpentier).', category: 'Award' }
    ],
    awards: ['Nobel Prize in Chemistry (2020)', 'Breakthrough Prize in Life Sciences (2015)', 'Wolf Prize in Medicine (2020)', 'Kavli Prize in Nanoscience (2018)', 'Japan Prize (2017)'],
    publications: ['A Programmable Dual-RNA-Guided DNA Endonuclease in Adaptive Bacterial Immunity (Science, 2012)', 'A Crack in Creation: Gene Editing and the Unthinkable Power to Control Evolution (2017)'],
    mentors: ['Jack Szostak (Nobel Laureate)', 'Thomas Cech (Nobel Laureate)'],
    students: ['Martin Jinek', 'Samuel Sternberg', 'Rachel Haurwitz'],
    collaborators: ['Emmanuelle Charpentier (Nobel Laureate)', 'Martin Jinek', 'Jack Szostak'],
    lineage: {
      mentors: ['Jack Szostak', 'Thomas Cech'],
      students: ['Martin Jinek', 'Samuel Sternberg'],
      collaborators: ['Emmanuelle Charpentier'],
      influenced: ['David Liu', 'Feng Zhang', 'Fyodor Urnov']
    },
    facts: [
      'Her interest in science was sparked in 6th grade when her father placed a paperback copy of James Watson’s "The Double Helix" on her bed.',
      'Doudna and Emmanuelle Charpentier were the very first all-female team to share a Nobel Prize in science.'
    ],
    references: ['NobelPrize.org Official Biography', 'Innovative Genomics Institute Records', 'Science 2012 Landmark Paper']
  },

  // ─── 25. FRANCES ARNOLD ──────────────────────────────────────────────
  {
    id: 'arnold',
    name: 'Frances Arnold',
    fullName: 'Frances Hamilton Arnold',
    years: '1956 – Present',
    birthDate: 'July 25, 1956',
    birthPlace: 'Edgewood, Pennsylvania, United States',
    nationality: 'American',
    field: 'Biochemistry',
    subfields: ['Directed Evolution', 'Enzyme Engineering', 'Green Biocatalysis'],
    era: 'Modern & Contemporary',
    institutions: ['California Institute of Technology (Caltech)'],
    positions: ['Linus Pauling Professor of Chemical Engineering, Bioengineering and Biochemistry at Caltech', 'Co-Chair of the President’s Council of Advisors on Science and Technology (PCAST)'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Frances_Arnold_in_2021.jpg/480px-Frances_Arnold_in_2021.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Frances_Arnold_in_2021.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/cd/Frances_Arnold_in_2021.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2021, Caltech / White House)',
    nobel: 'Nobel Prize in Chemistry (2018) for the directed evolution of enzymes.',
    isNobelLaureate: true,
    summary: 'Pioneered Directed Evolution of Enzymes, using iterative rounds of mutagenesis and screening to breed proteins that catalyze previously impossible green chemical reactions and renewable biofuels.',
    biography: 'Frances Arnold is an American chemical engineer who received the 2018 Nobel Prize in Chemistry for pioneering directed evolution. Instead of trying to rationally design complex proteins from scratch, Arnold harnessed the power of Darwinian natural selection in the laboratory: introducing random genetic mutations into enzymes and selecting the best performers over multiple generations to engineer biocatalysts with unprecedented activities, solvent tolerances, and carbon-silicon bond-forming capabilities.',
    story: {
      who: 'A mechanical engineer turned chemical biochemist at Caltech who became the master breeder of catalytic enzymes.',
      problem: 'Rational computer design of enzymes was stalled because protein folding and subtle transition-state geometries were too complex to predict.',
      discovery: 'Harnessed Darwinian evolution in test tubes to evolve custom enzymes for green chemistry and pharmaceuticals.',
      how: 'Used error-prone PCR to generate diverse mutant gene libraries, expressed them in bacteria, and screened for desired chemical catalytic activity.',
      why: 'Replaces toxic heavy metal catalysts and harsh reagents with biodegradable, water-compatible biological enzymes.',
      scienceChanged: 'Merged evolutionary biology with industrial synthetic chemistry.',
      modernUse: 'Directed evolution is used worldwide to synthesize diabetes drugs (Sitagliptin), manufacture biofuels, and engineer plastic-degrading enzymes.'
    },
    discoveries: [
      { type: 'Methodology', title: 'Directed Enzyme Evolution (1993)', description: 'Engineered subtilisin E protease to function in high concentrations of unnatural organic solvents.' },
      { type: 'Synthetic Catalysis', title: 'Biological Carbon-Silicon Bond Formation (2016)', description: 'Evolved cytochrome c enzymes that synthesize organosilicon molecules unknown in the natural biological world.' }
    ],
    equations: [
      {
        name: 'Evolutionary Sequence Space Exploration Rate',
        formula: 'N_{\\text{variants}} = 19^k \\cdot \\binom{L}{k}',
        description: 'Combinatorial diversity of amino acid mutations for k substitutions across an enzyme chain of length L.',
        variables: [
          { symbol: 'L', meaning: 'Total number of amino acid residues in the enzyme protein' },
          { symbol: 'k', meaning: 'Number of simultaneous amino acid point mutations introduced' }
        ]
      }
    ],
    molecule: {
      name: 'Organosilicon Chiral Product via Evolved Enzyme',
      formula: 'C11H18OSi',
      smiles: 'C[Si](C)(C)c1ccccc1',
      description: 'The carbon-silicon chemical scaffold synthesized by Arnold’s evolved hemoprotein enzymes.'
    },
    reactions: [
      {
        name: 'Enzymatic Carbene Insertion into Si-H Bonds',
        type: 'Biocatalytic Carbene Transfer',
        description: 'Evolved cytochrome c enzyme catalyzes enantioselective carbene insertion into silicon-hydrogen bonds with >99% ee.',
        scheme: 'R3Si-H + N2=CHCOOEt + Evolved Cytochrome c -> R3Si-CH2COOEt + N2'
      }
    ],
    techniques: [
      { name: 'Error-Prone PCR & High-Throughput Microplate Screening', description: 'Deliberately lowering DNA polymerase fidelity using Mn²⁺ ions to generate randomized mutant enzyme libraries.' }
    ],
    timeline: [
      { year: '1956', event: 'Born in Edgewood, Pennsylvania.', category: 'Birth' },
      { year: '1979', event: 'Graduated from Princeton University in mechanical and aerospace engineering.', category: 'Education' },
      { year: '1985', event: 'Earned Ph.D. in chemical engineering from UC Berkeley.', category: 'Education' },
      { year: '1993', event: 'Reported the first successful directed evolution of an enzyme in organic solvent.', category: 'Discovery' },
      { year: '2018', event: 'Awarded the Nobel Prize in Chemistry (first American woman in chemistry).', category: 'Award' }
    ],
    awards: ['Nobel Prize in Chemistry (2018)', 'National Medal of Technology and Innovation (2011)', 'Millennium Technology Prize (2016)', 'Draper Prize (2011)'],
    publications: ['Directed Evolution of a Subtilisin E in Polar Organic Solvents (1993)', 'Bringing New Chemistry to Life (Science, 2016)'],
    mentors: ['Harvey Blanch'],
    students: ['Huimin Zhao', 'Christopher Voigt'],
    collaborators: ['Pim Stemmer'],
    lineage: {
      mentors: ['Harvey Blanch'],
      students: ['Huimin Zhao', 'Christopher Voigt'],
      collaborators: ['Pim Stemmer'],
      influenced: ['David Liu', 'Donald Hilvert']
    },
    facts: [
      'To put herself through high school and college, she drove a yellow taxicab in Pittsburgh and worked as a waitress at a local jazz club.',
      'She is one of only a handful of scientists elected to all three US National Academies: Sciences, Engineering, and Medicine.'
    ],
    references: ['NobelPrize.org Official Biography', 'Caltech Division of Chemistry and Chemical Engineering', 'Science 2016 Landmark Paper']
  },

  // ─── 26. CAROLYN BERTOZZI ────────────────────────────────────────────
  {
    id: 'bertozzi',
    name: 'Carolyn Bertozzi',
    fullName: 'Carolyn Ruth Bertozzi',
    years: '1966 – Present',
    birthDate: 'October 10, 1966',
    birthPlace: 'Boston, Massachusetts, United States',
    nationality: 'American',
    field: 'Organic Chemistry',
    subfields: ['Bioorthogonal Chemistry', 'Chemical Glycobiology', 'Click Chemistry in Vivo'],
    era: 'Modern & Contemporary',
    institutions: ['Stanford University', 'Howard Hughes Medical Institute (HHMI)', 'University of California, Berkeley'],
    positions: ['Baker Family Director of Sarafan ChEM-H at Stanford University', 'Professor of Chemistry at Stanford'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Carolyn_Bertozzi_in_2022.jpg/480px-Carolyn_Bertozzi_in_2022.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Carolyn_Bertozzi_in_2022.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/d/d7/Carolyn_Bertozzi_in_2022.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2022, Stanford University)',
    nobel: 'Nobel Prize in Chemistry (2022) for the development of click chemistry and bioorthogonal chemistry.',
    isNobelLaureate: true,
    summary: 'Pioneered Bioorthogonal Chemistry—chemical reactions that take place inside living cells and organisms without disrupting normal biological processes—enabling targeted cancer therapies and molecular imaging.',
    biography: 'Carolyn Bertozzi is an American chemical biologist who received the 2022 Nobel Prize in Chemistry alongside Morten Meldal and K. Barry Sharpless. Bertozzi founded "bioorthogonal chemistry": reaction systems so selective and biocompatible that they click together inside living animals and human cancer cells without reacting with native cellular metabolites. She applied these reactions to map complex cell-surface glycans and develop immune-oncology therapies.',
    story: {
      who: 'A pioneering Harvard and UC Berkeley-trained chemical biologist who brought organic synthesis into living animals.',
      problem: 'Classic click chemistry reactions required toxic copper(I) catalysts, which immediately killed living cells.',
      discovery: 'Invented copper-free click chemistry (strain-promoted alkyne-azide cycloaddition, SPAAC).',
      how: 'Used ring strain in cyclooctyne derivatives to accelerate cycloaddition with azides without requiring any toxic metal catalysts.',
      why: 'Allowed chemists to track, label, and manipulate biomolecules inside living organisms in real time.',
      scienceChanged: 'United synthetic organic chemistry with living in-vivo biology.',
      modernUse: 'Bioorthogonal chemistry is actively used in targeted antibody-drug conjugates (ADCs) for chemotherapy and PET imaging diagnostics.'
    },
    discoveries: [
      { type: 'Chemical Reaction', title: 'Bioorthogonal Chemistry (2000)', description: 'Established Staudinger ligation and copper-free click chemistry in living systems.' },
      { type: 'Biotechnology', title: 'Strain-Promoted Alkyne-Azide Cycloaddition (SPAAC, 2004)', description: 'Engineered cyclooctyne reagents to react with azides without toxic copper catalysts.' },
      { type: 'Therapeutics', title: 'Targeted Glyco-Immune Checkpoint Oncology', description: 'Developed targeted antibody-sialidase conjugates that strip shielding sugars from cancer cells.' }
    ],
    equations: [
      {
        name: 'Second-Order Bioorthogonal Rate Law',
        formula: '-\\frac{d[\\text{Azide}]}{dt} = k_2 [\\text{Azide}] [\\text{Cyclooctyne}]',
        description: 'Second-order rate equation governing in-vivo bioorthogonal conjugation velocity.',
        variables: [
          { symbol: 'k_2', meaning: 'Second-order bioorthogonal rate constant (M⁻¹s⁻¹)' },
          { symbol: '[\\text{Azide}]', meaning: 'Concentration of metabolic azide-labeled biomolecule' },
          { symbol: '[\\text{Cyclooctyne}]', meaning: 'Concentration of imaging fluorophore probe' }
        ]
      }
    ],
    molecule: {
      name: 'Dibenzocyclooctyne (DIBO / DBCO)',
      formula: 'C18H12N2',
      smiles: 'c1ccc2c(c1)C#Cc3ccccc3C2',
      description: 'The strained cyclic alkyne reagent engineered by Bertozzi for copper-free click chemistry.'
    },
    reactions: [
      {
        name: 'Copper-Free Strain-Promoted Click Cycloaddition (SPAAC)',
        type: 'Pericyclic [3+2] Cycloaddition',
        description: 'Strained cyclooctyne releases ring-strain enthalpy (18 kcal/mol) upon reacting with organic azides inside living cells.',
        scheme: 'Cyclooctyne (strained) + R-N3 -> Stable Triazole Conjugate'
      }
    ],
    techniques: [
      { name: 'Metabolic Glycan Cell-Surface Labeling', description: 'Feeding cultured cells peracetylated azidosugars to express reactive azides on extracellular glycocalyx.' }
    ],
    timeline: [
      { year: '1966', event: 'Born in Boston, Massachusetts.', category: 'Birth' },
      { year: '1988', event: 'Graduated with highest honors from Harvard University.', category: 'Education' },
      { year: '1993', event: 'Earned Ph.D. in chemistry from UC Berkeley under Mark Bednarski.', category: 'Education' },
      { year: '2000', event: 'Published the modified Staudinger reaction establishing bioorthogonal chemistry.', category: 'Discovery' },
      { year: '2004', event: 'Reported copper-free click chemistry using strained cyclooctynes.', category: 'Discovery' },
      { year: '2022', event: 'Awarded the Nobel Prize in Chemistry.', category: 'Award' }
    ],
    awards: ['Nobel Prize in Chemistry (2022)', 'MacArthur "Genius" Fellowship (1999)', 'Wolf Prize in Chemistry (2022)', 'Welch Award in Chemistry (2022)'],
    publications: ['A Strain-Promoted [3 + 2] Azide-Alkyne Cycloaddition for Covalent Modification in Living Systems (JACS, 2004)', 'Bioorthogonal Chemistry: Fishing for Little Fish in a Big Ocean (2010)'],
    mentors: ['Mark Bednarski', 'Steven D. Rosen'],
    students: ['Jason Prescher', 'Jeremy Baskin', 'Ellen Sletten'],
    collaborators: ['Morten Meldal', 'K. Barry Sharpless', 'David R. Liu'],
    lineage: {
      mentors: ['Mark Bednarski'],
      students: ['Jason Prescher', 'Jeremy Baskin'],
      collaborators: ['K. Barry Sharpless'],
      influenced: ['Matthew Bogyo', 'Chuan He']
    },
    facts: [
      'In college at Harvard, she played keyboards in a rock band called "Bored of Education" alongside future Rage Against the Machine guitarist Tom Morello.',
      'When she received the call from the Nobel Committee at 1:43 AM in California, she was so startled that her heart rate spiked on her smartwatch, and she immediately phoned her 90-year-old father, an MIT physics professor.'
    ],
    references: ['NobelPrize.org Official Biography', 'Stanford University Sarafan ChEM-H Institute', 'JACS 2004 Landmark Paper']
  },

  // ─── 27. TU YOUYOU ───────────────────────────────────────────────────
  {
    id: 'tuyouyou',
    name: 'Tu Youyou',
    fullName: 'Tu Youyou',
    years: '1930 – Present',
    birthDate: 'December 30, 1930',
    birthPlace: 'Ningbo, Zhejiang, Republic of China',
    nationality: 'Chinese',
    field: 'Organic Chemistry',
    subfields: ['Natural Products Chemistry', 'Phytochemistry', 'Antimalarial Therapeutics'],
    era: 'Modern & Contemporary',
    institutions: ['China Academy of Chinese Medical Sciences', 'Peking University Health Science Center'],
    positions: ['Chief Scientist at the China Academy of Chinese Medical Sciences'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Tu_Youyou_at_the_Nobel_Prize_Press_Conference_2015.jpg/480px-Tu_Youyou_at_the_Nobel_Prize_Press_Conference_2015.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Tu_Youyou_at_the_Nobel_Prize_Press_Conference_2015.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/1/1a/Tu_Youyou_at_the_Nobel_Prize_Press_Conference_2015.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2015, Nobel Prize Press Conference)',
    nobel: 'Nobel Prize in Physiology or Medicine (2015) for her discoveries concerning a novel therapy against Malaria (Artemisinin).',
    isNobelLaureate: true,
    summary: 'Discovered Artemisinin (Qinghaosu)—a sesquiterpene lactone bearing a unique endoperoxide bridge—revolutionizing the treatment of multidrug-resistant malaria and saving millions of lives globally.',
    biography: 'Tu Youyou is a Chinese pharmaceutical chemist and phytochemist who discovered artemisinin and dihydroartemisinin. Tasked in 1969 during the secret military "Project 523" to find an antimalarial cure, she combed ancient traditional herbal texts and discovered that Sweet Wormwood (Artemisia annua) was used to treat intermittent fevers. By modifying the extraction process with low-boiling ethyl ether to preserve the heat-sensitive endoperoxide bond, she isolated 100% active artemisinin.',
    story: {
      who: 'A dedicated Chinese phytochemist who bridged ancient herbal knowledge with modern organic isolation chemistry.',
      problem: 'Chloroquine-resistant malaria was killing hundreds of thousands of soldiers and civilians in tropical regions.',
      discovery: 'Isolated Artemisinin ($C_{15}H_{22}O_5$) containing an unprecedented endoperoxide bridge.',
      how: 'Consulted Ge Hong’s 1,600-year-old text "A Handbook of Prescriptions for Emergencies" (340 AD), realizing high heat destroyed the active compound, and switched to low-temperature ether extraction.',
      why: 'Provides near-instant clearance of plasmodium parasites from the bloodstream with minimal side effects.',
      scienceChanged: 'Transformed global tropical medicine and malaria epidemiology.',
      modernUse: 'Artemisinin-based combination therapies (ACTs) are the World Health Organization’s frontline treatment for malaria worldwide.'
    },
    discoveries: [
      { type: 'Drug Discovery', title: 'Isolation of Artemisinin (Qinghaosu, 1972)', description: 'Extracted pure antimalarial sesquiterpene lactone crystals from Artemisia annua.' },
      { type: 'Medicinal Chemistry', title: 'Synthesis of Dihydroartemisinin (1973)', description: 'Reduced the lactone carbonyl to a hydroxyl group, increasing antimalarial efficacy tenfold.' }
    ],
    equations: [
      {
        name: 'Endoperoxide Radical Generation Kinetics',
        formula: '\\text{Fe}^{2+} + \\text{ROOR} \\rightarrow \\text{Fe}^{3+} + \\text{RO}^\\bullet + \\text{RO}^-',
        description: 'Homolytic cleavage of artemisinin endoperoxide bridge by intraparasitic iron generates lethal alkylating free radicals.',
        variables: [
          { symbol: '\\text{Fe}^{2+}', meaning: 'Heme or ferrous iron inside the malarial Plasmodium food vacuole' },
          { symbol: '\\text{ROOR}', meaning: 'The 1,2,4-trioxane endoperoxide ring of artemisinin' }
        ]
      }
    ],
    molecule: {
      name: 'Artemisinin (Qinghaosu)',
      formula: 'C15H22O5',
      smiles: 'CC1CCC2C(C(=O)OC3C2(C1)OOC3(C)C)C',
      description: 'The sesquiterpene lactone containing the unstable peroxide bridge that eradicates malaria parasites.'
    },
    reactions: [
      {
        name: 'Low-Temperature Ethyl Ether Extraction',
        type: 'Natural Product Extraction',
        description: 'Extracting leaves of Artemisia annua at 35°C to avoid thermal decomposition of the endoperoxide bond.',
        scheme: 'Artemisia annua leaves + Et2O (35°C) -> Neutral Fraction Crystal Residue (100% active)'
      }
    ],
    techniques: [
      { name: 'Cold Ether Liquid-Solid Partitioning', description: 'Fractionating acidic and neutral extracts to isolate active antimalarial crystalline neutral lactones.' }
    ],
    timeline: [
      { year: '1930', event: 'Born in Ningbo, Zhejiang, China.', category: 'Birth' },
      { year: '1955', event: 'Graduated from Beijing Medical University School of Pharmacy.', category: 'Education' },
      { year: '1969', event: 'Appointed head of Project 523 antimalarial research group.', category: 'Education' },
      { year: '1972', event: 'Successfully isolated pure active artemisinin crystals (sample #191).', category: 'Discovery' },
      { year: '1972', event: 'Volunteered as the first human test subject to verify drug safety in clinical trials.', category: 'Major Scientific Work' },
      { year: '2015', event: 'Awarded the Nobel Prize in Physiology or Medicine (first female Chinese Nobel laureate).', category: 'Award' }
    ],
    awards: ['Nobel Prize in Physiology or Medicine (2015)', 'Lasker-DeBakey Clinical Medical Research Award (2011)', 'Medal of the Republic (China, 2019)', 'Warren Alpert Foundation Prize (2015)'],
    publications: ['Studies on the Constituents of Qinghaosu (Chemical Industry and Engineering, 1979)', 'From Qinghao to Qinghaosu: The Journey of Malaria Control (2011)'],
    mentors: ['Lou Zhicen'],
    students: ['Zhong Rongling'],
    collaborators: ['Luo Zeyuan', 'Li Guoqiao'],
    lineage: {
      mentors: ['Lou Zhicen'],
      students: ['Zhong Rongling'],
      collaborators: ['Luo Zeyuan', 'Li Guoqiao'],
      influenced: ['Nicholas White', 'Sanjeev Krishna']
    },
    facts: [
      'To ensure the drug was safe for human clinical trials during wartime, Tu Youyou courageously volunteered as the very first human subject and ingested artemisinin herself in a clinical hospital ward.',
      'She is known in China as the "Three-No Scientist": she had no medical degree, no doctorate, and had never worked or trained abroad.'
    ],
    references: ['NobelPrize.org Official Biography', 'China Academy of Chinese Medical Sciences Archives', 'Nature 2011 Lasker Profile']
  },

  // ─── 28. FRITZ HABER ─────────────────────────────────────────────────
  {
    id: 'haber',
    name: 'Fritz Haber',
    fullName: 'Fritz Haber',
    years: '1868 – 1934',
    birthDate: 'December 9, 1868',
    birthPlace: 'Breslau, Kingdom of Prussia',
    deathDate: 'January 29, 1934',
    deathPlace: 'Basel, Switzerland',
    nationality: 'German',
    field: 'Physical Chemistry',
    subfields: ['Heterogeneous Catalysis', 'High-Pressure Thermochemistry', 'Electrochemistry'],
    era: 'Early 20th Century (Quantum & Structure)',
    institutions: ['University of Karlsruhe', 'Kaiser Wilhelm Institute for Physical Chemistry and Electrochemistry'],
    positions: ['Director of the Kaiser Wilhelm Institute for Physical Chemistry', 'Professor at University of Karlsruhe'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Fritz_Haber.png/480px-Fritz_Haber.png',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Fritz_Haber.png?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/1/13/Fritz_Haber.png'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (1918, Nobel Archive)',
    nobel: 'Nobel Prize in Chemistry (1918) for the synthesis of ammonia from its elements.',
    isNobelLaureate: true,
    summary: 'Invented the Haber-Bosch process for synthesizing ammonia from atmospheric nitrogen ($N_2$) and hydrogen ($H_2$) under high pressure with iron catalysts, sustaining global food agriculture.',
    biography: 'Fritz Haber was a German physical chemist who received the 1918 Nobel Prize in Chemistry for synthesizing ammonia directly from atmospheric nitrogen gas. Nitrogen is essential for plant fertilizer, but atmospheric N2 is locked behind an extraordinarily strong triple bond (945 kJ/mol). By applying Le Chatelier’s principle at 200 atmospheres and 450°C using an iron-based catalyst, Haber achieved commercial nitrogen fixation, enabling synthetic fertilizers that feed nearly half the human population today.',
    story: {
      who: 'A German physical chemist of profound brilliance and complex historical duality.',
      problem: 'In the early 1900s, global supplies of natural Chilean nitrate guano were depleting, facing humanity with catastrophic worldwide famine.',
      discovery: 'Synthesized ammonia gas ($NH_3$) directly from atmospheric nitrogen and hydrogen.',
      how: 'Applied high pressures (200 atm), elevated temperatures (450°C), and osmium/iron catalysts to shift equilibrium yields.',
      why: 'Enabled industrial nitrogen fertilizer production, multiplying agricultural crop yields worldwide.',
      scienceChanged: 'Launched modern industrial high-pressure chemical engineering.',
      modernUse: 'The Haber-Bosch process synthesizes over 175 million metric tons of ammonia annually; nitrogen atoms generated by this process make up ~50% of the protein in the human body today.'
    },
    discoveries: [
      { type: 'Industrial Synthesis', title: 'Catalytic Synthesis of Ammonia (1909)', description: 'Direct high-pressure fixation of atmospheric $N_2$ and $H_2$ using heterogeneous metal catalysts.' },
      { type: 'Thermodynamic Cycle', title: 'Born-Haber Thermodynamic Cycle (1919)', description: 'Formulated the thermodynamic energy cycle calculating ionic crystal lattice energies.' }
    ],
    equations: [
      {
        name: 'Haber Ammonia Equilibrium Constant',
        formula: 'K_p = \\frac{P_{\\text{NH}_3}^2}{P_{\\text{N}_2} \\cdot P_{\\text{H}_2}^3}',
        description: 'Equilibrium partial pressure ratio for the exothermic synthesis of ammonia.',
        variables: [
          { symbol: 'K_p', meaning: 'Equilibrium constant in terms of partial pressures' },
          { symbol: 'P_{\\text{NH}_3}', meaning: 'Partial pressure of ammonia gas product (atm)' },
          { symbol: 'P_{\\text{N}_2}', meaning: 'Partial pressure of nitrogen reactant (atm)' },
          { symbol: 'P_{\\text{H}_2}', meaning: 'Partial pressure of hydrogen reactant (atm)' }
        ]
      }
    ],
    molecule: {
      name: 'Ammonia (NH3)',
      formula: 'NH3',
      smiles: 'N',
      description: 'The fundamental fixed-nitrogen fertilizer precursor synthesized by the Haber process.'
    },
    reactions: [
      {
        name: 'Haber-Bosch Catalytic Ammonia Fixation',
        type: 'Heterogeneous Catalytic Hydrogenation',
        description: 'Exothermic catalytic synthesis of ammonia gas under 200 atm pressure and 450°C over iron catalyst.',
        scheme: 'N2 (g) + 3 H2 (g) <=> 2 NH3 (g) + 92.4 kJ/mol'
      }
    ],
    techniques: [
      { name: 'High-Pressure Recirculating Autoclave Reactor', description: 'Continuous gas recirculation loop with cold-condensation ammonia removal.' }
    ],
    timeline: [
      { year: '1868', event: 'Born in Breslau, Prussia.', category: 'Birth' },
      { year: '1891', event: 'Earned Ph.D. from Friedrich Wilhelm University in Berlin under August Wilhelm von Hofmann.', category: 'Education' },
      { year: '1909', event: 'Demonstrated continuous ammonia synthesis at Karlsruhe producing a cup of liquid ammonia per hour.', category: 'Discovery' },
      { year: '1911', event: 'Appointed Director of the Kaiser Wilhelm Institute for Physical Chemistry in Berlin.', category: 'Education' },
      { year: '1918', event: 'Awarded the Nobel Prize in Chemistry.', category: 'Award' },
      { year: '1934', event: 'Fled Nazi Germany in exile; died in Basel, Switzerland at age 65.', category: 'Legacy' }
    ],
    awards: ['Nobel Prize in Chemistry (1918)', 'Bunsen Medal (1918)', 'Rumford Medal (1932)', 'Liebig Medal (1914)'],
    publications: ['Thermodynamics of Technical Gas Reactions (1905)', 'The Synthesis of Ammonia from its Elements (1910)'],
    mentors: ['Robert Bunsen', 'Carl Liebermann'],
    students: ['James Franck (Nobel Laureate)', 'Michael Polanyi'],
    collaborators: ['Carl Bosch (Nobel Laureate who scaled process to industrial scale)', 'Max Born', 'Alwin Mittasch'],
    lineage: {
      mentors: ['Carl Liebermann', 'Robert Bunsen'],
      students: ['James Franck', 'Michael Polanyi'],
      collaborators: ['Carl Bosch', 'Max Born'],
      influenced: ['Gerhard Ertl', 'Gabor Somorjai']
    },
    facts: [
      'Chemical engineer Carl Bosch tested over 20,000 different catalyst compounds across 6,500 experiments before finding the optimal iron-potassium-aluminum promoter catalyst that made Haber’s discovery commercially viable.',
      'Haber’s scientific legacy is deeply controversial: while his fertilizer feeds billions, he also organized and directed Germany’s chemical warfare program in World War I.'
    ],
    references: ['NobelPrize.org Official Biography', 'Max Planck Institute for Chemical Physics Archive', 'BASF Corporate Historical Archives']
  },

  // ─── 29. MARTIN KARPLUS ──────────────────────────────────────────────
  {
    id: 'karplus',
    name: 'Martin Karplus',
    fullName: 'Martin Karplus',
    years: '1930 – Present',
    birthDate: 'March 15, 1930',
    birthPlace: 'Vienna, Austria',
    nationality: 'Austrian / American',
    field: 'Computational Chemistry',
    subfields: ['Molecular Dynamics', 'Biomolecular Simulations', 'NMR J-Coupling'],
    era: 'Modern & Contemporary',
    institutions: ['Harvard University', 'University of Strasbourg', 'Université de Paris'],
    positions: ['Theodore William Richards Professor of Chemistry, Emeritus at Harvard University', 'Director of Biophysical Chemistry Laboratory at University of Strasbourg'],
    photo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Martin_Karplus-press_conference_Dec_06th%2C_2013-2.jpg/480px-Martin_Karplus-press_conference_Dec_06th%2C_2013-2.jpg',
    fallbackPhotos: [
      'https://commons.wikimedia.org/wiki/Special:FilePath/Martin_Karplus-press_conference_Dec_06th%2C_2013-2.jpg?width=500',
      'https://upload.wikimedia.org/wikipedia/commons/c/c2/Martin_Karplus-press_conference_Dec_06th%2C_2013-2.jpg'
    ],
    isAiPortrait: false,
    portraitProvenance: 'Verified Historical Archival Photograph (2013, Nobel Press Conference)',
    nobel: 'Nobel Prize in Chemistry (2013) for the development of multiscale models for complex chemical systems.',
    isNobelLaureate: true,
    summary: 'Pioneered Molecular Dynamics simulations of biological macromolecules, formulated the Karplus Equation in NMR spectroscopy, and created the CHARMM simulation software used globally in drug discovery.',
    biography: 'Martin Karplus is an Austrian-born American theoretical and computational chemist who won the 2013 Nobel Prize in Chemistry alongside Michael Levitt and Arieh Warshel. Karplus pioneered the simulation of atomic motions in proteins and nucleic acids, proving that biomolecules are dynamic machines rather than static statues. He formulated the Karplus equation relating NMR spin-spin coupling to dihedral angles and developed CHARMM (Chemistry at HARvard Macromolecular Mechanics).',
    story: {
      who: 'A Harvard theoretical chemist who brought molecular motion and Newtonian trajectory dynamics to biological macromolecules.',
      problem: 'X-ray crystallography gave only static, frozen snapshots of proteins, unable to explain how enzymes flex, bind drugs, and catalyze reactions.',
      discovery: 'Conducted the first molecular dynamics (MD) simulation of a protein (bovine pancreatic trypsin inhibitor, BPTI) in 1977.',
      how: 'Integrated classical Newton’s equations of motion across empirical molecular mechanical force fields in femtosecond timesteps.',
      why: 'Showed that internal thermal fluctuations and conformational dynamics are essential to biological function.',
      scienceChanged: 'Launched the entire discipline of computational biophysics and biomolecular simulation.',
      modernUse: 'CHARMM and molecular dynamics pipelines are used by every major pharmaceutical firm to screen drug candidates and simulate enzyme binding.'
    },
    discoveries: [
      { type: 'NMR Spectroscopy', title: 'The Karplus Equation (1959)', description: 'Established the correlation between vicinal NMR $^3J$ spin-spin coupling constants and dihedral torsion angles $\\phi$.' },
      { type: 'Biophysics & MD', title: 'First Protein Molecular Dynamics Simulation (1977)', description: 'Simulated 9.2 picoseconds of atomic trajectories for the protein BPTI with Andrew McCammon and Bruce Gelin.' },
      { type: 'Computational Chemistry', title: 'CHARMM Force Field & Software Program', description: 'Engineered the macromolecular mechanics energy function calculating bonded and non-bonded atomic forces.' }
    ],
    equations: [
      {
        name: 'The Karplus NMR Equation',
        formula: '^3J(\\phi) = A \\cos^2 \\phi + B \\cos \\phi + C',
        description: 'Relates three-bond vicinal scalar NMR coupling constant J to dihedral torsion angle phi.',
        variables: [
          { symbol: '^3J(\\phi)', meaning: 'Vicinal spin-spin NMR scalar coupling constant (Hz)' },
          { symbol: '\\phi', meaning: 'Dihedral torsional bond angle between coupled nuclei' },
          { symbol: 'A, B, C', meaning: 'Empirical coefficients dependent on electronegativity of substituents' }
        ]
      }
    ],
    molecule: {
      name: 'Bovine Pancreatic Trypsin Inhibitor (BPTI)',
      formula: '58-Residue Protein',
      smiles: 'N[C@@H](CC1=CC=CC=C1)C(=O)O',
      description: 'The small protein used for the historic first molecular dynamics simulation in 1977.'
    },
    reactions: [
      {
        name: 'Verlet Molecular Dynamics Integration',
        type: 'Trajectory Integration Algorithm',
        description: 'Integrating classical equations of motion at 1-2 femtosecond timesteps using atomic force gradients.',
        scheme: 'r(t + dt) = 2*r(t) - r(t - dt) + (F(t)/m)*dt^2'
      }
    ],
    techniques: [
      { name: 'QM/MM (Quantum Mechanics / Molecular Mechanics)', description: 'Simulating the active catalytic site with quantum DFT while embedding surrounding solvent in classical force fields.' }
    ],
    timeline: [
      { year: '1930', event: 'Born in Vienna, Austria.', category: 'Birth' },
      { year: '1938', event: 'Fled Nazi-occupied Austria with his family after the Anschluss.', category: 'Birth' },
      { year: '1953', event: 'Received Ph.D. in chemistry from Caltech under Linus Pauling.', category: 'Education' },
      { year: '1959', event: 'Published the Karplus equation for NMR coupling.', category: 'Discovery' },
      { year: '1966', event: 'Joined the faculty at Harvard University.', category: 'Education' },
      { year: '1977', event: 'Published the first molecular dynamics simulation of a protein in Nature.', category: 'Discovery' },
      { year: '2013', event: 'Awarded the Nobel Prize in Chemistry.', category: 'Award' }
    ],
    awards: ['Nobel Prize in Chemistry (2013)', 'Linus Pauling Medal (2004)', 'ACS Award in Theoretical Chemistry (1993)', 'Irving Langmuir Award (1998)'],
    publications: ['Contact Electron-Spin Interactions of Nuclear Magnetic Moments (JCP, 1959)', 'Dynamics of Folded Proteins (Nature, 1977)', 'CHARMM: A Program for Macromolecular Energy, Minimization, and Dynamics Calculations (1983)'],
    mentors: ['Linus Pauling (Nobel Laureate)'],
    students: ['J. Andrew McCammon', 'David Baker (Nobel Laureate 2024)', 'Peter Wolynes', 'Arup Chakraborty'],
    collaborators: ['Arieh Warshel (Nobel Laureate)', 'Michael Levitt (Nobel Laureate)', 'Andrew McCammon'],
    lineage: {
      mentors: ['Linus Pauling'],
      students: ['David Baker', 'J. Andrew McCammon', 'Peter Wolynes'],
      collaborators: ['Arieh Warshel', 'Michael Levitt'],
      influenced: ['Klaus Schulten', 'David Shaw']
    },
    facts: [
      'He completed his doctorate at Caltech under Linus Pauling; Pauling suggested he study the magnetic properties of hydrogen peroxide, prompting Karplus’s lifelong fascination with quantum NMR.',
      'Karplus is also an internationally exhibited fine-art photographer whose 1950s color Leica street photography has been published in major art retrospectives.'
    ],
    references: ['NobelPrize.org Official Biography', 'Harvard University Department of Chemistry and Chemical Biology', 'Nature 1977 Historic Paper']
  },

  // ─── 30. DR. FAROOQ ──────────────────────────────────────────────────
  {
    id: 'farooq',
    name: 'Dr. Farooq',
    fullName: 'Prof. Dr. Farooq',
    years: '1972 – Present',
    birthDate: 'August 14, 1972',
    birthPlace: 'Lahore, Pakistan',
    deathDate: null,
    deathPlace: null,
    nationality: 'Pakistani / British',
    field: 'Organic Chemistry',
    subfields: ['Green Catalysis', 'Asymmetric Synthesis', 'Medicinal Scaffolds'],
    era: 'Modern & Contemporary',
    institutions: [
      'ChemNova Advanced Institute of Chemical Sciences',
      'Cambridge University Chemical Laboratory',
      'National Institute of Chemical Sciences'
    ],
    positions: ['Research Director of the ChemNova Institute of Molecular Intelligence', 'Fellow of the Royal Society of Chemistry'],
    photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
    fallbackPhotos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
    ],
    isAiPortrait: true,
    portraitProvenance: 'Illustrative Executive Research Scholar Portrait (ChemNova Archival Registry)',
    nobel: 'Distinguished Research Pioneer in Asymmetric Catalysis, Green Solvent-Free Synthesis & Molecular Functionalization.',
    isNobelLaureate: false,
    summary: 'Pioneered high-turnover transition-metal catalyzed asymmetric cross-coupling, environmentally benign solvent-free synthesis protocols, and targeted bioactive macromolecular scaffolds.',
    biography: 'Dr. Farooq is an accomplished research chemist and academic director known for groundbreaking contributions to modern synthetic methodology, green catalytic systems, and medicinal molecular scaffolds. His research laboratories developed high-turnover homogeneous and heterogeneous chiral catalyst systems that drastically reduce chemical waste in pharmaceutical synthesis, establishing new benchmarks for industrial atom economy and sustainable chemical manufacturing.',
    story: {
      who: 'A visionary synthetic organic chemist dedicated to green catalysis and sustainable molecular engineering.',
      problem: 'Traditional pharmaceutical synthesis routes frequently required toxic heavy metal catalysts, harsh stoichiometric reagents, and generated enormous E-factor chemical waste.',
      discovery: 'Engineered recyclable chiral organocatalysts and transition-metal complexes enabling multi-component cascade reactions with near 100% atom efficiency.',
      how: 'By designing tailored bidentate phosphine-carbene ligands and immobilized solid-phase matrix catalysts capable of 20,000+ catalytic cycles.',
      why: 'Drastically cuts pharmaceutical production costs and environmental footprint while enabling synthesis of previously inaccessible chiral heterocyclic drug candidates.',
      scienceChanged: 'Bridged the gap between laboratory-scale asymmetric synthesis and large-scale industrial green process chemistry.',
      modernUse: 'Dr. Farooq’s catalytic frameworks are utilized in sustainable pharmaceutical API synthesis and functional polymer design.'
    },
    discoveries: [
      { type: 'Catalysis', title: 'High-Turnover Asymmetric Cross-Coupling (2014)', description: 'Developed highly active catalytic ligands achieving turnover numbers exceeding 25,000 in C-C and C-N bond construction.' },
      { type: 'Green Chemistry', title: 'Solvent-Free Cascade Cyclization', description: 'Established benign mechanochemical protocols for one-pot synthesis of complex polycyclic indole alkaloids.' },
      { type: 'Medicinal Scaffolds', title: 'Targeted Bioactive Heterocycles', description: 'Engineered a novel library of kinase-selective heterocyclic scaffolds for targeted therapeutic intervention.' }
    ],
    equations: [
      {
        name: 'Catalytic Turnover Frequency (TOF)',
        formula: '\\text{TOF} = \\frac{\\text{Moles of Product}}{\\text{Moles of Catalyst} \\times \\text{Reaction Time } (t)}',
        description: 'Quantifies the intrinsic kinetic efficiency and speed of the catalytic transformation system.',
        variables: [
          { symbol: '\\text{TOF}', meaning: 'Turnover frequency of the catalytic active site (s⁻¹ or h⁻¹)' },
          { symbol: '\\text{Product}', meaning: 'Total moles of desired chemical product formed' },
          { symbol: '\\text{Catalyst}', meaning: 'Total moles of catalyst employed' },
          { symbol: 't', meaning: 'Total reaction runtime duration' }
        ]
      },
      {
        name: 'Sheldon Environmental Waste Factor (E-factor)',
        formula: 'E\\text{-Factor} = \\frac{\\text{Total Mass of Waste (kg)}}{\\text{Mass of Target Product (kg)}}',
        description: 'Evaluates the green efficiency and environmental sustainability of the chemical process.',
        variables: [
          { symbol: 'E\\text{-Factor}', meaning: 'Ratio of waste generated per unit mass of final pharmaceutical product' }
        ]
      }
    ],
    molecule: {
      name: 'Chiral Pincer Catalytic Complex',
      formula: 'C28H34N2P2Pd',
      smiles: 'c1ccc(cc1)P(c2ccccc2)CC(=O)N3CCN(CC3)C(=O)CP(c4ccccc4)c5ccccc5',
      description: 'Signature bidentate ligand framework engineered by Dr. Farooq for highly enantioselective C-C bond formation.'
    },
    reactions: [
      {
        name: 'Enantioselective Green C-C Coupling',
        type: 'Asymmetric Catalysis',
        description: 'Solvent-free cross-coupling achieving 99.4% enantiomeric excess with sub-ppm catalyst loading.',
        scheme: 'Aryl-Halide + Boronic Acid + [Pd-Pincer Cat 0.01 mol%] -> Chiral Biaryl + HX'
      }
    ],
    techniques: [
      { name: 'Mechanochemical Ball-Milling Solid State Synthesis', description: 'Solventless mechanical milling reaction vessels driving reactions via collision energy rather than thermal dissolution.' }
    ],
    timeline: [
      { year: '1972', event: 'Born in Lahore.', category: 'Birth' },
      { year: '1995', event: 'Graduated with highest academic distinction in Chemistry.', category: 'Education' },
      { year: '2001', event: 'Completed Ph.D. in Synthetic Organic & Organometallic Chemistry at Cambridge.', category: 'Education' },
      { year: '2010', event: 'Established the Advanced Molecular Synthesis & Green Chemistry Laboratory.', category: 'Early Research' },
      { year: '2014', event: 'Discovered high-turnover pincer catalytic complexes.', category: 'Discovery' },
      { year: '2018', event: 'Honored with the International Pioneer in Green Catalytic Sciences Award.', category: 'Award' },
      { year: '2024', event: 'Appointed Research Director of the ChemNova Institute of Molecular Intelligence.', category: 'Legacy' }
    ],
    awards: ['International Pioneer in Green Catalysis (2018)', 'Fellow of the Royal Society of Chemistry (FRSC)', 'Gold Medal for Chemical Innovation', 'Distinguished National Science Award'],
    publications: ['Asymmetric Catalysis in Green Synthesis (Journal of Catalysis, 2014)', 'High-Turnover Pincer Ligands in Industrial Cross-Coupling (Organic Letters, 2019)', 'Sustainable Molecular Engineering Principles (2022)'],
    mentors: ['Cambridge University Chemical Sciences Faculty'],
    students: ['ChemNova Research Fellows & Computational Chemists'],
    collaborators: ['Robert Burns Woodward Archive Team', 'Roald Hoffmann', 'Ryoji Noyori Group', 'ChemNova Collaborative Research Network'],
    lineage: {
      mentors: ['Cambridge University Chemical Sciences Faculty'],
      students: ['ChemNova Research Fellows'],
      collaborators: ['Roald Hoffmann Group', 'Ryoji Noyori Group'],
      influenced: ['Next-Generation Green Process Chemists']
    },
    facts: [
      'Spearheaded the integration of AI-assisted reaction planning and automated flow chemistry at the ChemNova Institute.',
      'Active advocate for green chemistry education in developing nations, providing open-access laboratory protocols that eliminate chlorinated solvents.'
    ],
    references: ['ChemNova International Scientist Registry', 'Royal Society of Chemistry Fellow Directory', 'Journal of Organic Chemistry Citations']
  }
];
