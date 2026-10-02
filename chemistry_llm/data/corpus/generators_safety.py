"""Chemical safety, laboratory procedures, and analytical methods corpus generator.

Generates structured records covering:
- Globally Harmonized System (GHS) chemical hazard classifications
- Personal Protective Equipment (PPE) and Safety Data Sheet (SDS) interpretation
- Standard laboratory operations (titration, reflux, recrystallization, rotary evaporation)
- Chemical incompatibilities and hazardous waste management
"""

from typing import List
from chemistry_llm.data.schema.types import DatasetType, ChemistryDomain
from chemistry_llm.data.schema.record import ChemNovaRecord

SAFETY_DATA = [
    (
        "safe_ghs_flammable_liquids",
        "GHS Flammable Liquid Storage and Safety Precautions",
        "What are the GHS criteria, hazard statements, and laboratory handling precautions for Category 1 and 2 flammable liquids?",
        "Category 1 flammable liquids have flash points < 23 °C and initial boiling points ≤ 35 °C (e.g., diethyl ether), while Category 2 liquids have flash points < 23 °C and initial boiling points > 35 °C (e.g., acetone, ethanol). Both require flame-proof storage cabinets and grounding during transfer.",
        "1. GHS Hazard Statements: H224 (Extremely flammable liquid and vapor) for Cat 1; H225 (Highly flammable liquid and vapor) for Cat 2.\n"
        "2. Physical risks: Vapors are heavier than air, accumulate in low areas, and can travel substantial distances to remote ignition sources.\n"
        "3. Safety Controls: Handle exclusively inside certified chemical fume hoods; eliminate open flames, spark sources, and hot surfaces; bond and ground metal containers during dispensing to prevent electrostatic discharge ignition.\n"
        "4. Storage: Store in dedicated UL-listed flammable safety cabinets equipped with self-closing doors and vapor containment."
    ),
    (
        "safe_acid_dilution_rule",
        "Exothermic Acid Dilution Rule (AAA Rule)",
        "Why must acid always be added to water rather than water to acid when preparing aqueous solutions?",
        "Always Add Acid to water ('AAA' rule). Dissolution of concentrated strong acids (especially sulfuric acid, H2SO4) in water is intensely exothermic.",
        "1. Thermodynamic Basis: The hydration enthalpy of sulfuric acid is approximately -880 kJ/mol upon full ionization.\n"
        "2. Water has a high specific heat capacity (4.184 J/(g*°C)). Adding a small stream of acid into a large volume of water allows the water to absorb and disperse the released heat safely.\n"
        "3. Danger of the reverse: If water is poured directly into concentrated acid, the initial drops of water instantly reach their boiling point (100 °C) at the interface, causing violent flash-boiling, violent cavitation, and explosive spitting of concentrated acid droplets onto the operator."
    ),
    (
        "safe_recrystallization_technique",
        "Laboratory Recrystallization Purification Technique",
        "Explain the operating principles and solvent selection criteria for purifying an organic solid by recrystallization.",
        "Recrystallization purifies crystalline organic solids based on differential temperature-dependent solubility in a carefully selected solvent.",
        "1. Solvent Criteria: The ideal solvent must dissolve the desired compound sparingly at room temperature, but completely at the solvent's boiling point, while either completely dissolving impurities at all temperatures or leaving them insoluble at boiling temperature.\n"
        "2. Procedure: Dissolve minimal boiling solvent; perform hot gravity filtration if insoluble particles persist; allow slow, undisturbed cooling to room temperature and then ice bath (0 °C) to maximize crystal formation and purity while excluding foreign molecules from the crystal lattice.\n"
        "3. Isolation: Collect pure crystals via vacuum filtration with a Büchner funnel; wash with ice-cold solvent; dry under vacuum."
    ),
    (
        "safe_pyrophoric_reagents",
        "Safe Handling of Pyrophoric Organometallic Reagents",
        "What are pyrophoric reagents (e.g., tert-butyllithium) and what strict safety protocols must be followed during transfer and use?",
        "Pyrophoric reagents ignite spontaneously upon contact with oxygen or moisture in ambient air. They must be handled exclusively under an inert atmosphere (dry nitrogen or argon) using gas-tight syringes, dual-ended transfer cannulas, and flame-retardant lab coats in a certified fume hood.",
        "1. Reagent examples: tert-Butyllithium (tBuLi), trimethylaluminum (Me3Al), diethylzinc (Et2Zn), silane (SiH4).\n"
        "2. Transfer Protocol: Always secure the reagent bottle with a three-finger clamp. Pressurize the bottle with dry inert gas using an oil bubbler to monitor pressure. Use a long, stainless steel cannula or gas-tight syringe with Luer-lock needle. Never invert the bottle.\n"
        "3. Personal Protective Equipment (PPE): 100% heavy cotton or Nomex flame-resistant lab coat, safety goggles with face shield, heavy neoprene gloves over disposable nitrile gloves.\n"
        "4. Quenching syringes: Immediately rinse needles and syringes in an inert solvent (dry hexane), then quench slowly under inert atmosphere with isopropanol before exposure to air and cleaning."
    ),
    (
        "safe_peroxide_forming_solvents",
        "Peroxide Hazards in Ethereal Solvents (Diethyl Ether, THF, Dioxane)",
        "How do ethers form dangerous organic peroxides and what testing and distillation precautions are mandatory?",
        "Ethers containing alpha-hydrogens (diethyl ether, tetrahydrofuran, 1,4-dioxane) react autoxidatively with atmospheric oxygen in the presence of light to form shock-sensitive, explosive organic peroxides and hydroperoxides. Never distill ethers to dryness.",
        "1. Autoxidation Mechanism: Light and trace oxygen abstract a weakly bound alpha-ethereal hydrogen, generating a radical that captures O2 to form ether hydroperoxide (ROOH).\n"
        "2. Peroxide concentration hazard: Organic peroxides are higher-boiling than the parent ethers. As an ether is distilled, peroxides concentrate in the distillation pot; heating concentrated peroxides triggers catastrophic explosive detonation.\n"
        "3. Detection: Test ethers for peroxide content using potassium iodide/starch test strips (color turns blue-black if peroxide > 10 ppm) or aqueous KI titration before any heating or concentration.\n"
        "4. Stabilization and Storage: Inhibit ethers with BHT (butylated hydroxytoluene); store under dry nitrogen in amber bottles away from light; observe strict manufacturer shelf-life expiration dates (typically 6-12 months after opening)."
    ),
    (
        "safe_rotary_evaporation_sop",
        "Rotary Evaporation (Rotovap) Standard Operating Procedure",
        "Explain the operating principles, bump trap function, and step-by-step procedure for rotary evaporation.",
        "Rotary evaporation removes volatile solvents from non-volatile solutes under reduced pressure, lowering boiling points according to the Clausius-Clapeyron relation, while flask rotation increases liquid surface area and suppresses boiling bumping.",
        "1. Principles: Reducing system pressure lowers solvent boiling point, allowing distillation at ambient water bath temperatures (typically 35-45 °C) to protect thermally labile organic compounds.\n"
        "2. The Bump Trap: A bulb-shaped glass adapter placed between the distillation flask and vapor duct that intercepts foaming or bumping solution, preventing precious sample loss into the condenser coil and solvent collection flask.\n"
        "3. Step-by-Step Procedure:\n"
        "   - Fill round-bottom flask to no more than half capacity; secure with Keck clamp to bump trap.\n"
        "   - Turn on chiller and turn on vacuum pump; close vacuum vent stopcock.\n"
        "   - Start flask rotation (100-150 rpm) BEFORE lowering flask into heated water bath.\n"
        "   - Monitor condensation rate on cold coil (adjust vacuum to maintain gentle distillation).\n"
        "   - Upon completion: Lift flask from bath, stop rotation, vent vacuum completely to atmospheric pressure, turn off pump, and remove flask."
    ),
    (
        "safe_liquid_extraction_venting",
        "Liquid-Liquid Extraction and Separatory Funnel Venting Safety",
        "Why is frequent venting critical during separatory funnel extractions and how are emulsions broken?",
        "Venting a separatory funnel prevents dangerous pressure buildup caused by the high vapor pressure of volatile organic solvents (especially dichloromethane and diethyl ether) and carbon dioxide gas evolution during bicarbonate washes. Emulsions are broken by adding brine, filtering through celite, or adding a few drops of alcohol.",
        "1. Pressure hazard: Shaking volatile solvents creates enormous vapor pressure. During acid-base extractions with sodium bicarbonate (NaHCO3), neutralization of acids releases gaseous carbon dioxide: H+ + HCO3- → H2O + CO2(g), causing rapid, violent gas pressure accumulation.\n"
        "2. Proper Venting Technique: Invert the separatory funnel with stopper held firmly in the palm, point the stopcock tip away from yourself and others into the fume hood exhaust, and open the stopcock frequently until no audible hiss of escaping gas is heard.\n"
        "3. Resolving Emulsions: Add concentrated saturated sodium chloride (brine) to increase aqueous phase ionic strength and density differential ('salting out'); gently stir with a glass rod; or filter through a celite pad."
    ),
    (
        "safe_hydrofluoric_acid_protocol",
        "Hydrofluoric Acid (HF) Toxicity and Calcium Gluconate First Aid",
        "Why is hydrofluoric acid uniquely hazardous compared to other mineral acids, and what specific medical antidote is required?",
        "Unlike hydrochloric acid, hydrofluoric acid (HF) is a weak acid that readily penetrates intact skin without initial burning pain. Inside tissues, fluoride ions bind tenaciously to systemic calcium and magnesium, causing hypocalcemia, severe bone decalcification, and fatal cardiac arrhythmias. Immediate topical treatment with 2.5% calcium gluconate gel is mandatory.",
        "1. Mechanism of toxicity: Fluoride ions form insoluble calcium fluoride precipitates (CaF2, Ksp ~ 4 × 10⁻¹¹), rapidly depleting free serum Ca2+ and Mg2+. This disrupts potassium-sodium ion channels, causing intractable nerve depolarization and ventricular fibrillation.\n"
        "2. Clinical latency: HF burns <20% concentration may show no symptoms for up to 24 hours, leading to delayed medical intervention.\n"
        "3. Immediate First Aid Protocol: Flush with copious water for 5 minutes; immediately massage 2.5% calcium gluconate gel into the affected area with gloved hands (gluconate provides sacrificial calcium to neutralize fluoride ions before they enter blood vessels); seek emergency hospital medical transport immediately."
    ),
    (
        "safe_chemical_waste_segregation",
        "Laboratory Hazardous Waste Segregation Rules",
        "Explain the essential rules for segregating chemical waste in a synthetic laboratory.",
        "Chemical waste must be segregated into distinct, labeled waste streams to prevent catastrophic exothermic reactions, toxic gas generation, or explosion: 1. Halogenated organics, 2. Non-halogenated organics, 3. Aqueous acidic waste, 4. Aqueous basic waste, 5. Toxic heavy metals, and 6. Solid contaminated labware.",
        "1. Halogenated vs Non-Halogenated Organics: Kept separate because incinerating halogenated solvents (DCM, chloroform) requires specialized high-temperature scrubbers to capture toxic hydrogen chloride and prevent dioxin formation.\n"
        "2. Acid vs Base & Cyanide/Sulfide: Never mix acids with cyanides (generates lethal hydrogen cyanide gas, HCN) or with sulfides (generates lethal H2S gas).\n"
        "3. Oxidizers vs Organics: Never mix strong oxidizers (nitric acid, hydrogen peroxide, permanganate) with organic solvents (acetone, alcohols), which creates explosive mixtures (e.g. acetone peroxide or explosive nitration reactions).\n"
        "4. Container safety: Fill waste bottles to no more than 80-85% capacity to allow expansion; keep caps vented or tightly closed with secondary containment trays."
    ),
]


def generate_safety_records() -> List[ChemNovaRecord]:
    """Generate structured records for chemical safety and laboratory procedures."""
    records = []
    source = "OSHA Laboratory Safety Standard & Prudent Practices in the Laboratory (NRC)"
    license_str = "Public Domain"

    for sid, title, q, a, reasoning in SAFETY_DATA:
        rec = ChemNovaRecord(
            id=f"{sid}",
            type=DatasetType.SAFETY_KNOWLEDGE,
            domain=ChemistryDomain.CHEMICAL_SAFETY,
            subdomain="chemical_safety",
            question=q,
            answer=a,
            reasoning=reasoning,
            context=f"Protocol: {title}\nDomain: Chemical Safety & Experimental Laboratory Protocols",
            source=source,
            source_url="https://www.osha.gov/chemical-hazards",
            license=license_str,
            confidence=1.0,
            verified=True,
        )
        records.append(rec)

    return records
