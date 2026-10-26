import { ProviderWithDetails } from "../supabase/types";

/**
 * Clearly labelled sample records for development and UI testing only.
 * No real provider details, fake partnerships, invented prices, or unsubstantiated certifications.
 */
export const SAMPLE_PROVIDERS: ProviderWithDetails[] = [
  {
    id: "demo-provider-1",
    name: "[DEMO] Apex Certified Material Recovery",
    slug: "demo-certified-metals-recycling",
    description:
      "Demonstration record: Industrial authorised e-waste facility accepting non-functional consumer electricals for mechanical shredding and metal refining.",
    organisation_type: "authorised_recycler",
    website_url: "https://example.org/demo-apex-recycling",
    source_evidence_url: "https://example.org/demo-environmental-registry-entry-4029",
    evidence_notes:
      "Development fixture: Regulatory license record checked against mock state registry.",
    verification_status: "verified",
    approval_status: "approved",
    quote_type: "quote_required",
    offers_pickup: true,
    offers_dropoff: true,
    pickup_details: "Scheduled courier collection available for bulk electronics (10+ kg).",
    dropoff_details: "Public drop-off bay open Monday to Friday, 09:00 - 16:00.",
    minimum_quantity: 1,
    eligibility_restrictions:
      "Batteries must be intact; swollen cells require special hazardous isolation protocol.",
    last_checked_at: "2026-10-15T00:00:00Z",
    is_sample_data: true,
    created_at: "2026-10-15T00:00:00Z",
    updated_at: "2026-10-15T00:00:00Z",
    services: [
      {
        id: "demo-srv-1",
        provider_id: "demo-provider-1",
        service_type: "recycling",
        service_description:
          "Mechanical shredding, circuit board copper extraction, and regulated plastics sorting.",
        created_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "demo-srv-2",
        provider_id: "demo-provider-1",
        service_type: "component_recovery",
        service_description:
          "Harvest of clean donor heatsinks, chassis, and wiring looms.",
        created_at: "2026-10-15T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "demo-cat-1",
        provider_id: "demo-provider-1",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["major_fault", "working_older"],
        notes: "NAND flash punctured or shredded for confidentiality.",
        created_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "demo-cat-2",
        provider_id: "demo-provider-1",
        category_slug: "laptops-computers",
        accepted_conditions: ["major_fault", "working_older"],
        notes: "Drive bays accepted with or without hard drives.",
        created_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "demo-cat-3",
        provider_id: "demo-provider-1",
        category_slug: "batteries-cables-peripherals",
        accepted_conditions: ["major_fault", "working_older"],
        notes: "Copper wiring bulk intake.",
        created_at: "2026-10-15T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "demo-area-1",
        provider_id: "demo-provider-1",
        area_type: "pincode",
        location_code: "560001",
        location_name: "Bengaluru Central 560001",
        supports_pickup: true,
        supports_dropoff: true,
        dropoff_address: "Drop-off Gate 2, Industrial Suburb, Bengaluru 560001",
        created_at: "2026-10-15T00:00:00Z",
      },
      {
        id: "demo-area-2",
        provider_id: "demo-provider-1",
        area_type: "pincode",
        location_code: "560025",
        location_name: "Bengaluru South-East 560025",
        supports_pickup: true,
        supports_dropoff: false,
        dropoff_address: null,
        created_at: "2026-10-15T00:00:00Z",
      },
    ],
  },
  {
    id: "demo-provider-2",
    name: "[DEMO] Digital Inclusion Alliance",
    slug: "demo-community-reuse-initiative",
    description:
      "Demonstration record: Community non-profit redistributing functional laptops and monitors to schools and learning centres under lightweight operating systems.",
    organisation_type: "non_profit_charity",
    website_url: "https://example.org/demo-digital-inclusion",
    source_evidence_url:
      "https://example.org/demo-charity-commission-registry-9182",
    evidence_notes:
      "Development fixture: Registered charity status confirmed via public commission portal.",
    verification_status: "verified",
    approval_status: "approved",
    quote_type: "quote_required",
    offers_pickup: false,
    offers_dropoff: true,
    pickup_details: "No home collection available for individual households.",
    dropoff_details:
      "Drop-off container located in community civic centre reception.",
    minimum_quantity: 1,
    eligibility_restrictions:
      "Must boot successfully; chargers and power supplies must be included.",
    last_checked_at: "2026-10-18T00:00:00Z",
    is_sample_data: true,
    created_at: "2026-10-18T00:00:00Z",
    updated_at: "2026-10-18T00:00:00Z",
    services: [
      {
        id: "demo-srv-3",
        provider_id: "demo-provider-2",
        service_type: "donation_reuse",
        service_description:
          "Diagnostic wipe, OS re-flash (ChromeOS Flex / Linux), and classroom redeployment.",
        created_at: "2026-10-18T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "demo-cat-4",
        provider_id: "demo-provider-2",
        category_slug: "laptops-computers",
        accepted_conditions: ["working_recent", "working_older"],
        notes: "Must include power adapter.",
        created_at: "2026-10-18T00:00:00Z",
      },
      {
        id: "demo-cat-5",
        provider_id: "demo-provider-2",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent", "working_older"],
        notes: "Must have iCloud/Google FRP lock removed.",
        created_at: "2026-10-18T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "demo-area-3",
        provider_id: "demo-provider-2",
        area_type: "pincode",
        location_code: "560001",
        location_name: "Bengaluru Central 560001",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address:
          "Civic Centre Reception, MG Road, Bengaluru 560001",
        created_at: "2026-10-18T00:00:00Z",
      },
    ],
  },
  {
    id: "demo-provider-3",
    name: "[DEMO] Precision Hardware Lab",
    slug: "demo-modular-device-repairs",
    description:
      "Demonstration record: Independent repair workshop specialising in display replacements, battery swaps, and modular component diagnosis.",
    organisation_type: "repair_service",
    website_url: "https://example.org/demo-precision-repairs",
    source_evidence_url: "https://example.org/demo-trade-license-7731",
    evidence_notes:
      "Development fixture: Commercial registration recorded; parts warranty policy partially verified.",
    verification_status: "partially_verified",
    approval_status: "approved",
    quote_type: "indicative_estimate",
    offers_pickup: false,
    offers_dropoff: true,
    pickup_details: "Postal mail-in service available for portable devices.",
    dropoff_details: "Counter diagnostics available during workshop hours.",
    minimum_quantity: 1,
    eligibility_restrictions:
      "Diagnostic fee applied towards final repair cost if repair is authorised.",
    last_checked_at: "2026-10-20T00:00:00Z",
    is_sample_data: true,
    created_at: "2026-10-20T00:00:00Z",
    updated_at: "2026-10-20T00:00:00Z",
    services: [
      {
        id: "demo-srv-4",
        provider_id: "demo-provider-3",
        service_type: "repair",
        service_description:
          "Battery, screen, USB-C port, and keyboard replacements.",
        created_at: "2026-10-20T00:00:00Z",
      },
      {
        id: "demo-srv-5",
        provider_id: "demo-provider-3",
        service_type: "cash_buyback",
        service_description:
          "Trade-in value offered against repaired second-hand stock.",
        created_at: "2026-10-20T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "demo-cat-6",
        provider_id: "demo-provider-3",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["minor_fault", "working_recent"],
        notes: "OEM and OEM-grade parts options.",
        created_at: "2026-10-20T00:00:00Z",
      },
      {
        id: "demo-cat-7",
        provider_id: "demo-provider-3",
        category_slug: "laptops-computers",
        accepted_conditions: ["minor_fault", "working_recent"],
        notes: "Thermal repasting and hinge repairs.",
        created_at: "2026-10-20T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "demo-area-4",
        provider_id: "demo-provider-3",
        area_type: "pincode",
        location_code: "560034",
        location_name: "Bengaluru Koramangala 560034",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address:
          "Workshop Unit 4, 80 Feet Road, Koramangala 560034",
        created_at: "2026-10-20T00:00:00Z",
      },
    ],
  },
];
