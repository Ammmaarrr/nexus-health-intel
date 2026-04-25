export type Capability = "yes" | "no" | "uncertain";

export interface Flag {
  level: "warning" | "info";
  text: string;
}

export interface EvidenceItem {
  source: string;
  date: string;
  snippet: string;
  url?: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  region: "urban" | "rural";
  trust_score: number;
  coords: { lat: number; lng: number };
  capabilities: {
    icu: Capability;
    surgery: Capability;
    emergency: Capability;
    anesthesiology: Capability;
    obstetrics: Capability;
    radiology: Capability;
  };
  flags: Flag[];
  evidence: EvidenceItem[];
  reasoning: string;
  trace: Record<string, unknown>;
}

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "aiims-patna",
    name: "AIIMS Patna",
    location: "Patna, Bihar",
    region: "urban",
    trust_score: 0.88,
    coords: { lat: 25.6093, lng: 85.1376 },
    capabilities: {
      icu: "yes",
      surgery: "yes",
      emergency: "yes",
      anesthesiology: "yes",
      obstetrics: "yes",
      radiology: "yes",
    },
    flags: [],
    evidence: [
      {
        source: "Ministry of Health & Family Welfare",
        date: "2024-08-12",
        snippet:
          "AIIMS Patna operates a 960-bed tertiary care centre with 24/7 trauma, ICU, and multi-specialty surgical services.",
      },
      {
        source: "AIIMS Patna Annual Report 2024",
        date: "2024-04-30",
        snippet:
          "The institute maintains 12 modular operation theatres and a 64-bed intensive care unit verified by NABH accreditation.",
      },
      {
        source: "NABH Accreditation Database",
        date: "2024-01-22",
        snippet:
          "Active NABH full accreditation status for emergency medicine, critical care, and surgical disciplines.",
      },
    ],
    reasoning:
      "Three independent high-confidence sources (government, institutional, accreditation body) cross-validate every capability claim. Recency within 12 months. Trust score weighted by source authority (0.35 gov, 0.30 institutional, 0.25 accreditation) and capability completeness (1.0).",
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 47,
      passed_filter: 12,
      verification_passes: 3,
      consensus_score: 0.91,
      sources: ["mohfw.gov.in", "aiims-patna.edu.in", "nabh.co"],
      latency_ms: 1842,
    },
  },
  {
    id: "rhc-gaya",
    name: "Rural Health Centre Gaya",
    location: "Gaya District, Bihar",
    region: "rural",
    trust_score: 0.42,
    coords: { lat: 24.7914, lng: 85.0002 },
    capabilities: {
      icu: "uncertain",
      surgery: "no",
      emergency: "yes",
      anesthesiology: "no",
      obstetrics: "yes",
      radiology: "uncertain",
    },
    flags: [
      { level: "warning", text: "No anesthesiologist on staff — surgical capability cannot be verified." },
      { level: "warning", text: "ICU bed count reported inconsistently across sources (2018 vs 2023)." },
      { level: "info", text: "Last verified site visit was 18 months ago." },
    ],
    evidence: [
      {
        source: "Bihar State Health Society Directory",
        date: "2023-11-04",
        snippet:
          "Rural Health Centre Gaya provides primary maternal care and outpatient emergency triage. Staffing: 2 medical officers, 4 nurses.",
      },
      {
        source: "District Health Profile, Gaya (2022)",
        date: "2022-09-15",
        snippet:
          "Facility lacks dedicated anesthesia coverage; surgical referrals routed to district hospital 47 km away.",
      },
    ],
    reasoning:
      "Limited source diversity (2 sources, both regional). Conflicting capability data on ICU. Absence of anesthesiology contradicts surgical claims. Trust score penalized for source recency (-0.15) and internal inconsistency (-0.20).",
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 11,
      passed_filter: 4,
      verification_passes: 1,
      consensus_score: 0.48,
      sources: ["bshs.gov.in", "gaya.nic.in"],
      conflicts: [
        { field: "icu_beds", values: ["4", "0", "uncertain"] },
        { field: "anesthesiology", values: ["no", "occasional"] },
      ],
      latency_ms: 2104,
    },
  },
  {
    id: "dh-muzaffarpur",
    name: "District Hospital Muzaffarpur",
    location: "Muzaffarpur, Bihar",
    region: "urban",
    trust_score: 0.61,
    coords: { lat: 26.1209, lng: 85.3647 },
    capabilities: {
      icu: "yes",
      surgery: "yes",
      emergency: "yes",
      anesthesiology: "uncertain",
      obstetrics: "yes",
      radiology: "yes",
    },
    flags: [
      { level: "warning", text: "Anesthesiology coverage reported as part-time — verify before referral." },
      { level: "info", text: "Equipment audit pending for 2024 cycle." },
    ],
    evidence: [
      {
        source: "Bihar Directorate of Health Services",
        date: "2024-03-18",
        snippet:
          "200-bed district hospital with 8-bed ICU, 3 operation theatres, and 24/7 emergency department serving Muzaffarpur and adjoining blocks.",
      },
      {
        source: "PIB News Release",
        date: "2024-06-02",
        snippet:
          "District Hospital Muzaffarpur received CT scanner upgrade and added 12 ICU monitors under PM-ABHIM scheme.",
      },
      {
        source: "Local Medical Association Bulletin",
        date: "2023-12-09",
        snippet:
          "Two anesthesiology positions remain unfilled; current coverage rotates across two nearby facilities.",
      },
    ],
    reasoning:
      "Mixed-confidence profile. Strong infrastructure verification from 2 government sources. Anesthesiology gap creates moderate risk for elective surgery referrals. Trust score reflects partial capability verification (0.61 = high infra, mid staffing).",
    trace: {
      query_id: "qry_8af21c",
      retrieved_documents: 23,
      passed_filter: 7,
      verification_passes: 2,
      consensus_score: 0.66,
      sources: ["bihar-health.gov.in", "pib.gov.in", "bma-muzaffarpur.org"],
      latency_ms: 1967,
    },
  },
];

export async function fetchHospitals(query: string): Promise<Hospital[]> {
  const backend = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (backend) {
    try {
      const res = await fetch(`${backend}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("backend error");
      const data = await res.json();
      if (Array.isArray(data?.results) && data.results.length) return data.results as Hospital[];
    } catch {
      /* silent fallback */
    }
  }
  // Simulate network latency for the cinematic loading state
  await new Promise((r) => setTimeout(r, 2400));
  return MOCK_HOSPITALS;
}