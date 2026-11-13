# ThermoSense AI — Final Technical Decision & Specification
## Comprehensive Research Report, Executive Summary, Technical Specification and Implementation Plan

**Project:** ThermoSense AI  
**Competition:** Future Health Digital Innovation Challenge 2026  
**Team size:** 2 members  
**Research and planning status:** Scope frozen & technical specification locked  
**Project phase:** Transitioning into dataset acquisition and prototype development  
**Primary domain:** Occupational heat-health monitoring and early warning  

---

# EXECUTIVE SUMMARY & FINAL SCOPE LOCK

## 1. Scope Lock: Four Heat-Health Concerns
For a two-person team, scope expansion is stopped and the prototype is locked around four specific heat-health concerns:

1. **Heat strain** — The primary modeling target (physiological response to heat exposure).
2. **Dehydration risk** — A secondary risk-estimation target (fluid-balance concern).
3. **Heat syncope risk** — A safety concern flagged through conservative, evidence-based guidance, **not diagnosed**.
4. **Heat stroke risk** — An emergency safety concern escalated immediately, **not diagnosed**.

> [!IMPORTANT]
> **Scientific Distinction:** These are not four interchangeable machine-learning labels. Heat strain is a physiological response; dehydration is fluid balance; heat syncope and heat stroke are clinical conditions. ThermoSense AI is an **occupational heat-health monitoring and early-warning prototype**, not an AI medical-diagnosis system.

---

## 2. API Decisions & Cost Positions

| Service | Cost Position | Architectural Decision |
|---|---|---|
| **Open-Meteo** | Free for non-commercial use (10k calls/day, 5k/hr, 600/min). Attribution required. | **Selected for prototype's environmental data.** Provides ambient temperature, relative humidity, wind speed, solar radiation, wet-bulb estimates. |
| **CSV/JSON Wearable Import** | Free, zero API dependencies. | **First wearable-data integration.** Users/workers upload structured wearable data without OAuth blockers. |
| **Google Health API** | No simple guaranteed free tier; requires Google Cloud registration, OAuth 2.0 & restricted scopes security review. (Fitbit Web API was sunset Nov 2026). | **Designed into architecture as an optional future connector.** Never a blocker for demo. |
| **Health Connect** | Android OS-level health data sharing platform. | Optional Android connector if native app is built later. |

---

## 3. The Four Core Training Datasets

Each dataset fulfills a specific role in the multi-source evidence architecture:

| Dataset | Primary Contribution | Role in ThermoSense AI | Access Link / DOI |
|---|---|---|---|
| **PROSPIE** | Core body temperature & physiological measurements in factory workers | Primary training dataset for physiological heat-strain estimation | [PROSPIE DOI: 10.17028/rd.lboro.26076577.v1](https://doi.org/10.17028/rd.lboro.26076577.v1) |
| **Firefighter Heat-Stress** | 21 firefighters; core temp, HR, perceived exertion, pre/post body mass, total body water, under-PPE microclimate | Heat-strain progression, hydration indicators, and PPE microclimate analysis (CC BY 4.0) | [Mendeley Data DOI: 10.17632/7ghxcsd9sz.1](https://data.mendeley.com/datasets/7ghxcsd9sz/1) |
| **EPA Wearables** | 8-person pilot with PPE wearing smartwatches (HR, HRV, steps, respiration) | Practical wearable signal ingestion, noise handling, and feature alignment | [Data.gov / EPA Uploads](https://pasteur.epa.gov/uploads/10.23719/1529134/EPA_WearablesPaper_Data.xlsx) |
| **HEATSHIELD** | 982 exposures across 75 conditions; climate, solar radiation, clothing, work capacity loss, skin temp | Environmental heat-risk estimation and physical work-capacity loss modeling | [HEATSHIELD DOI: 10.17028/rd.lboro.25722384.v2](https://doi.org/10.17028/rd.lboro.25722384.v2) |

---

# SYSTEM ARCHITECTURE & DATA FLOW

```
[ DATA COLLECTION ]
  ├── Open-Meteo API (Regional Environmental Estimates)
  ├── Wearables via CSV / JSON Import (HR, HRV, Steps, Skin Temp)
  ├── Worker Workload Context & PPE Level (Light / Moderate / Heavy)
  └── Exposure History & Shift Duration
          │
          ▼
[ DATA PROCESSING & QUALITY CONTROL ]
  ├── Validation, Cleaning & Unit Standardization
  ├── Timestamp Alignment & Missing Data Imputation
  ├── Signal Freshness & Quality Tagging
  └── Canonical Feature Engineering
          │
          ▼
[ THERMOSENSE INTELLIGENCE ENGINE ]
  ├── Model A: Physiological Heat-Strain Estimation (Core Temp & Progression)
  ├── Model B: Environmental Heat-Risk Assessment (Work capacity & thermal stress)
  ├── Model C: Hydration-Related Risk Indicators (Body mass change % & water balance)
  ├── Model D: Uncertainty & Data-Reliability Assessment (Conformal / intervals)
  └── Safety Logic: Precautionary syncope guidance & immediate emergency heat-stroke escalation
          │
          ▼
[ APPLICATION & DASHBOARD ]
  ├── Mode A: Full Physiological Monitoring (Wearable + Environment)
  ├── Mode B: Environmental-Only Fallback (No wearable available)
  ├── Data Provenance Display (Measured vs. Estimated vs. Derived)
  └── Preventive Action Recommendations & Emergency Protocols
```

---

# FEATURE SPECIFICATION & DATA PROVENANCE

### Data Provenance Classifications
- **Measured:** Directly captured by a sensor (smartwatch HR, scale body mass).
- **Estimated:** Inferred by a model or external service (Open-Meteo weather, model core temperature).
- **Derived:** Deterministically computed from other values (Body Mass Change %, rolling averages).

### Hydration Calculation Formula
$$\text{Body Mass Change (\%)} = \left(\frac{\text{Pre-exposure Mass} - \text{Post-exposure Mass}}{\text{Pre-exposure Mass}}\right) \times 100$$
*(Treated strictly as a physical fluid-loss proxy, never as a standalone clinical diagnosis).*

---

# TWO-PERSON EXECUTION PLAN

```
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│        PERSON 1: AI/ML & DATA ENGINE         │  │     PERSON 2: BACKEND & APPLICATION          │
├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤
│ 1. Download & audit the 4 raw datasets       │  │ 1. FastAPI backend architecture & endpoints   │
│ 2. Canonical feature dictionary & adapters   │  │ 2. Open-Meteo connector & caching             │
│ 3. Signal cleaning, alignment & pipelines    │  │ 3. CSV/JSON wearable ingestion pipeline       │
│ 4. Train Model A (Heat-Strain) & Model B     │  │ 4. Worker session & exposure history storage  │
│ 5. Hydration indicator algorithms            │  │ 5. Dashboard UI, alert feeds & visualization  │
│ 6. Participant-disjoint model validation     │  │ 6. Model inference service integration        │
│ 7. Uncertainty estimation & reliability tags │  │ 7. Google Health API connector stub           │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
                                         ▲              ▲
                                         │              │
                                ┌────────┴──────────────┴────────┐
                                │      SHARED DELIVERABLES       │
                                ├────────────────────────────────┤
                                │ • Safety logic & alert rules   │
                                │ • End-to-end integration test  │
                                │ • Competition pitch & demo     │
                                └────────────────────────────────┘
```

---

# SEVEN-DAY IMPLEMENTATION SCHEDULE

- **Day 1: Setup & Acquisition:** Download 4 datasets, verify raw file sizes/licenses, launch FastAPI backend skeleton.
- **Day 2: Audit & Data Contracts:** Variable audit, participant counts, canonical schema, REST contract definitions.
- **Day 3: Adapters & Feature Pipeline:** Standardize units and timestamps, build feature engineering pipelines.
- **Day 4: Baseline Models:** Train baseline core-temp regressor and environmental risk models with participant-disjoint splits.
- **Day 5: Hydration & Reliability:** Implement hydration change metrics, missing-data handling, and uncertainty bounds.
- **Day 6: Full Integration:** Connect ML inference engine to FastAPI endpoints and dashboard UI.
- **Day 7: Validation & Demo Prep:** Stress test missing inputs, verify fail-safes and emergency escalation, finalize docs.

---

# IMMEDIATE NEXT STEPS

Run the raw dataset download audit:
```powershell
Get-ChildItem .\ai_engine\data\raw -Recurse -File | Select-Object FullName, Length, Extension | Format-Table -AutoSize
```
