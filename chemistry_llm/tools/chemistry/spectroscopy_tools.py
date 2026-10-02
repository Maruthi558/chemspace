"""Spectroscopy lookup utilities for IR and NMR spectra interpretation.

Provides reference correlation tables to ground model reasoning in experimental facts.
"""

from typing import Any, Dict, List

# Standard Infrared absorption frequency correlation table (cm^-1)
IR_CHARACTERISTIC_BANDS = [
    {
        "min": 3200,
        "max": 3650,
        "group": "O-H / N-H stretch",
        "description": "Alcohols, phenols, amines, amides (broad if H-bonded)",
    },
    {
        "min": 2850,
        "max": 3000,
        "group": "C-H stretch (sp3)",
        "description": "Aliphatic alkane C-H stretch",
    },
    {
        "min": 3000,
        "max": 3100,
        "group": "C-H stretch (sp2)",
        "description": "Aromatic and alkene =C-H stretch",
    },
    {
        "min": 2200,
        "max": 2260,
        "group": "C≡N / C≡C stretch",
        "description": "Nitriles and internal/terminal alkynes",
    },
    {
        "min": 1680,
        "max": 1750,
        "group": "C=O stretch",
        "description": "Carbonyl (ketones, aldehydes, esters, carboxylic acids)",
    },
    {
        "min": 1600,
        "max": 1660,
        "group": "C=C / C=N stretch",
        "description": "Alkenes, imines, aromatic ring stretch",
    },
    {
        "min": 1000,
        "max": 1300,
        "group": "C-O stretch",
        "description": "Esters, ethers, alcohols",
    },
]

# Standard 1H NMR chemical shift correlation table (ppm)
NMR_1H_REGIONS = [
    {"min": 0.5, "max": 1.8, "group": "R-CH3, R-CH2-R", "description": "Aliphatic primary and secondary protons"},
    {"min": 1.9, "max": 2.7, "group": "-C(=O)-CH-", "description": "Protons alpha to carbonyl or allylic"},
    {"min": 3.2, "max": 4.5, "group": "-O-CH-, -N-CH-", "description": "Protons attached to carbon with electronegative heteroatom (O, N, halogen)"},
    {"min": 6.5, "max": 8.5, "group": "Ar-H", "description": "Aromatic ring protons"},
    {"min": 9.0, "max": 10.0, "group": "-CHO", "description": "Aldehyde proton"},
    {"min": 10.5, "max": 13.0, "group": "-COOH", "description": "Carboxylic acid proton"},
]


def lookup_ir_band(wavenumber: float) -> List[Dict[str, Any]]:
    """Identify functional groups matching a given IR absorption wavenumber."""
    matches = []
    for band in IR_CHARACTERISTIC_BANDS:
        if band["min"] <= wavenumber <= band["max"]:
            matches.append(band)
    return matches


def estimate_nmr_region(ppm: float, nucleus: str = "1H") -> List[Dict[str, Any]]:
    """Identify proton environment corresponding to an experimental chemical shift (ppm)."""
    if nucleus != "1H":
        return []
    matches = []
    for region in NMR_1H_REGIONS:
        if region["min"] <= ppm <= region["max"]:
            matches.append(region)
    return matches
