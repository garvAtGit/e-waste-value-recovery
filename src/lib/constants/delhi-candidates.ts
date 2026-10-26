import { ProviderWithDetails } from "../supabase/types";

/**
 * Researched Delhi & NCR Candidate Provider Dataset.
 *
 * IMPORTANT GOVERNANCE RULES:
 * 1. ALL records remain in 'pending_review' status.
 * 2. NO live database insertion is permitted without explicit user review and approval.
 * 3. All UUIDs conform strictly to RFC 4122 UUID v4 specifications.
 * 4. All enums and constraints conform to postgres migration 20261026000000_provider_directory.sql:
 *    - organisation_type IN ('authorised_recycler', 'commercial_refurbisher', 'non_profit_charity', 'repair_service', 'retailer_oem', 'component_salvager')
 *    - quote_type IN ('confirmed_quote', 'indicative_estimate', 'quote_required')
 *    - verification_status IN ('verified', 'partially_verified', 'unverified')
 *    - approval_status IN ('approved', 'pending_review', 'rejected')
 *    - service_type IN ('repair', 'cash_buyback', 'exchange', 'donation_reuse', 'component_recovery', 'recycling')
 *    - area_type IN ('pincode', 'city', 'state_region', 'national')
 */

export const DELHI_CANDIDATE_PROVIDERS: ProviderWithDetails[] = [
  // 1. Cashify (Connaught Place & Nehru Place Kiosks)
  {
    id: "a0110001-0001-4000-8000-000000000001",
    name: "Cashify (Manak Waste Management Pvt Ltd)",
    slug: "cashify-delhi",
    description: "Re-commerce platform operating physical device trade-in and repair kiosks across Delhi commercial centers.",
    organisation_type: "commercial_refurbisher",
    website_url: "https://www.cashify.in",
    source_evidence_url: "https://www.cashify.in/stores/delhi",
    evidence_notes: "Store locations verified via official store locator: Rajiv Chowk Metro F-Block (110001) and Nehru Place GF-4 (110019). In-store physical evaluation confirmed for smartphones; doorstep pickup dynamic by pincode and not guaranteed for arbitrary areas.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "indicative_estimate",
    offers_pickup: false, // Physical store record: counter drop-off only
    offers_dropoff: true,
    pickup_details: "Doorstep evaluation is dynamic by pincode; in-store physical drop-off and inspection available at documented branch kiosks.",
    dropoff_details: "In-person kiosk evaluation at Rajiv Chowk Metro F Block (110001) and Nehru Place Industrial Consultants GF-4 (110019).",
    minimum_quantity: 1,
    eligibility_restrictions: "Swollen batteries, blacklisted, or physically tampered devices strictly rejected upon physical inspection.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110001-0001-4000-8000-000000000001",
        provider_id: "a0110001-0001-4000-8000-000000000001",
        service_type: "cash_buyback",
        service_description: "In-store immediate evaluation and cash payout for smartphones.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "b0110001-0001-4000-8000-000000000002",
        provider_id: "a0110001-0001-4000-8000-000000000001",
        service_type: "repair",
        service_description: "Screen, battery, and charging port repair backed by warranty.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110001-0001-4000-8000-000000000001",
        provider_id: "a0110001-0001-4000-8000-000000000001",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent", "working_older", "minor_fault"],
        notes: "Phones evaluated at kiosk counter. Laptops evaluated primarily via scheduled home visits, not walk-in kiosk counter.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110001-0001-4000-8000-000000000001",
        provider_id: "a0110001-0001-4000-8000-000000000001",
        area_type: "pincode",
        location_code: "110001",
        location_name: "Rajiv Chowk Metro, Connaught Place 110001",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "F Block, Ground Floor, Rajiv Chowk Metro Station, Connaught Place, New Delhi 110001",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "d0110001-0001-4000-8000-000000000002",
        provider_id: "a0110001-0001-4000-8000-000000000001",
        area_type: "pincode",
        location_code: "110019",
        location_name: "Nehru Place 110019",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "Industrial Consultants Inc., GF-4, Ground Floor, 50, Nehru Place, New Delhi 110019",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },

  // 2. Croma (Connaught Place & South Extension)
  {
    id: "a0110001-0002-4000-8000-000000000002",
    name: "Croma (Infiniti Retail Limited)",
    slug: "croma-delhi",
    description: "Electronics retail chain offering in-store small e-waste collection bins and Superrr Exchange store vouchers.",
    organisation_type: "retailer_oem",
    website_url: "https://www.croma.com",
    source_evidence_url: "https://www.croma.com/e-waste",
    evidence_notes: "Physical e-waste bin drop-off verified for small electronics and peripherals. Superrr Exchange vouchers available for phones and laptops against new purchases. Standalone domestic e-waste doorstep pickup is unconfirmed and marked unsupported.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "indicative_estimate",
    offers_pickup: false,
    offers_dropoff: true,
    pickup_details: "Doorstep collection tied primarily to new large appliance delivery; domestic e-waste home pickup requires prior store confirmation.",
    dropoff_details: "In-store e-waste collection bins and Superrr Exchange desks at Odeon CP (110001) and South Extension II (110049).",
    minimum_quantity: 1,
    eligibility_restrictions: "Intact consumer electronics. Severely broken/hazardous batteries require specialised disposal.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110001-0002-4000-8000-000000000001",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        service_type: "exchange",
        service_description: "Superrr Exchange store discount voucher against eligible working/minor fault devices.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "b0110001-0002-4000-8000-000000000002",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        service_type: "recycling",
        service_description: "Drop-off of small consumer electronics and peripherals in store e-waste bins.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110001-0002-4000-8000-000000000001",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent", "working_older", "minor_fault"],
        notes: "Exchange discount applied to new purchase invoice.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110001-0002-4000-8000-000000000002",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        category_slug: "laptops-computers",
        accepted_conditions: ["working_recent", "working_older"],
        notes: "Must boot to operating system for trade-in valuation.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110001-0002-4000-8000-000000000003",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        category_slug: "batteries-cables-peripherals",
        accepted_conditions: ["working_older", "major_fault"],
        notes: "Accepted in store e-waste collection bin.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110001-0002-4000-8000-000000000001",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        area_type: "pincode",
        location_code: "110001",
        location_name: "Odeon Connaught Place 110001",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "Ground Floor, Odeon Cine Complex, D Block, Middle Circle, Connaught Place, New Delhi 110001",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "d0110001-0002-4000-8000-000000000002",
        provider_id: "a0110001-0002-4000-8000-000000000002",
        area_type: "pincode",
        location_code: "110049",
        location_name: "South Extension Part II 110049",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "Plot No. D-14, Ring Road, South Extension Part II, New Delhi 110049",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },

  // 3. Apple Saket (Select CITYWALK)
  {
    id: "a0110017-0006-4000-8000-000000000006",
    name: "Apple Saket",
    slug: "apple-saket-delhi",
    description: "Official Apple Retail Store offering Apple Trade In exchange, Genius Bar diagnostics/repairs, and responsible recycling.",
    organisation_type: "retailer_oem",
    website_url: "https://www.apple.com/in/retail/saket/",
    source_evidence_url: "https://www.apple.com/in/trade-in/",
    evidence_notes: "Store address verified at Select CITYWALK, Saket (110017). Apple Trade In vouchers supported for iPhones and Macs; Genius Bar hardware repairs quote-based; free recycling drop-off available for Apple devices and accessories. Swollen batteries excluded from walk-in repair.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "indicative_estimate",
    offers_pickup: false,
    offers_dropoff: true,
    pickup_details: "Doorstep courier trade-in is available only with online store device orders; physical store provides in-person walk-in service.",
    dropoff_details: "F-11, Select CITYWALK, District Centre, Saket, New Delhi 110017.",
    minimum_quantity: 1,
    eligibility_restrictions: "Apple devices, batteries, and accessories. Swollen, leaking, or compromised battery units are quarantined under fire-safety protocol.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110017-0006-4000-8000-000000000001",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        service_type: "exchange",
        service_description: "Apple Trade In instant store credit voucher against a new device purchase.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "b0110017-0006-4000-8000-000000000002",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        service_type: "repair",
        service_description: "Genius Bar OEM diagnostics and hardware repair using genuine Apple parts.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "b0110017-0006-4000-8000-000000000003",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        service_type: "recycling",
        service_description: "Free in-store drop-off recycling for Apple devices, peripherals, and batteries holding zero trade-in value.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110017-0006-4000-8000-000000000001",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent", "working_older", "minor_fault", "major_fault"],
        notes: "iPhones and iPads. Trade-in credit requires booting device; zero-value units accepted for free recycling.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110017-0006-4000-8000-000000000002",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        category_slug: "laptops-computers",
        accepted_conditions: ["working_recent", "working_older", "minor_fault", "major_fault"],
        notes: "MacBooks and Mac desktops. Hardware repair or recycling.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110017-0006-4000-8000-000000000003",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        category_slug: "batteries-cables-peripherals",
        accepted_conditions: ["working_older", "major_fault"],
        notes: "Apple cables, power adapters, and intact batteries accepted for responsible recycling.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110017-0006-4000-8000-000000000001",
        provider_id: "a0110017-0006-4000-8000-000000000006",
        area_type: "pincode",
        location_code: "110017",
        location_name: "Select CITYWALK, Saket 110017",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "F-11, Select CITYWALK, District Centre, Saket, New Delhi 110017",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },

  // 4. Lappy Maker (Nehru Place Hardware Lab)
  {
    id: "a0110019-0003-4000-8000-000000000003",
    name: "Lappy Maker",
    slug: "lappy-maker-delhi",
    description: "Laptop and MacBook hardware repair lab located in Nehru Place with diagnostic estimate terms.",
    organisation_type: "repair_service",
    website_url: "https://www.lappymaker.com",
    source_evidence_url: "https://www.lappymaker.com/terms-and-conditions",
    evidence_notes: "Nehru Place workshop address verified: 703, 7th Floor, Madhuban Building (110019). Terms state initial diagnostic estimate is free, but ₹300 visit fee applies if multiple diagnosis visits are booked without proceeding with repair. Swollen batteries explicitly excluded from warranty. Doorstep pickup across arbitrary pincodes is unconfirmed and restricted to Nehru Place workshop walk-in unless confirmed.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "indicative_estimate",
    offers_pickup: false, // General unconfirmed pincode pickup is set to false to prevent false coverage claims
    offers_dropoff: true,
    pickup_details: "Technician doorstep pickup across Delhi NCR is advertised online, but pincode-specific SLAs are unconfirmed without direct inquiry. Workshop walk-in confirmed.",
    dropoff_details: "703, 7th Floor, Madhuban Building, Nehru Place, New Delhi 110019.",
    minimum_quantity: 1,
    eligibility_restrictions: "Laptops and MacBooks only. Swollen batteries excluded from warranty.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110019-0003-4000-8000-000000000001",
        provider_id: "a0110019-0003-4000-8000-000000000003",
        service_type: "repair",
        service_description: "MacBook and laptop motherboard, screen, battery, and keyboard hardware repair.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110019-0003-4000-8000-000000000001",
        provider_id: "a0110019-0003-4000-8000-000000000003",
        category_slug: "laptops-computers",
        accepted_conditions: ["minor_fault", "major_fault"],
        notes: "Specialist laptop lab. Does not repair smartphones.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110019-0003-4000-8000-000000000001",
        provider_id: "a0110019-0003-4000-8000-000000000003",
        area_type: "pincode",
        location_code: "110019",
        location_name: "Nehru Place 110019",
        supports_pickup: false, // Strict: do not infer pickup without documented pincode SLA
        supports_dropoff: true,
        dropoff_address: "703, 7th Floor, Madhuban Building, Nehru Place, New Delhi 110019",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },

  // 5. E-Waste Recyclers India (EWRI - Corporate Office & Commercial Hub)
  {
    id: "a0110020-0004-4000-8000-000000000004",
    name: "E-Waste Recyclers India (EWRI)",
    slug: "ewri-delhi-okhla",
    description: "CPCB/DPCC registered corporate office coordinating commercial and institutional e-waste collection; downstream processing plants located outside Delhi in Mathura (UP) and Nuh (Haryana).",
    organisation_type: "authorised_recycler",
    website_url: "https://www.ewri.in",
    source_evidence_url: "https://www.ewri.in/contact-us",
    evidence_notes: "A-46 Okhla Phase-I is EWRI's corporate/administrative office. Downstream heavy recycling plants are situated outside Delhi in Mathura (UP 281403) and Nuh, Mewat (Haryana 122103). Published Delhi collection points (Om Logistics Punjabi Bagh 110035 and Pooth Khurd 110039) are freight aggregation hubs under EPR, not retail walk-in depots. Domestic consumer walk-in drop-off at Okhla is unconfirmed without prior case coordination.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "quote_required",
    offers_pickup: false, // Ordinary single-household consumer pickup is NOT offered
    offers_dropoff: false, // A-46 Okhla is an office, not a consumer walk-in drop-off depot
    pickup_details: "Commercial and institutional batch collection coordinated via toll-free (1800-102-5679); individual consumer doorstep pickup is strictly not offered.",
    dropoff_details: "EWRI House, A-46, Okhla Industrial Area Phase-I, New Delhi 110020 (Corporate office; individual walk-in drop-off is unconfirmed and requires prior coordination).",
    minimum_quantity: 20, // Bulk / institutional batch minimum
    eligibility_restrictions: "Bulk, commercial, and institutional batches only (minimum 20 units or freight consignment). Single household consumer doorstep pickup and retail walk-in drop-off are strictly not offered.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110020-0004-4000-8000-000000000001",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        service_type: "recycling",
        service_description: "Mechanical separation, hazardous substance abatement, and precious metal recovery at R2-certified regional plants.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "b0110020-0004-4000-8000-000000000002",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        service_type: "component_recovery",
        service_description: "Industrial component salvage and circuit board depopulation.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110020-0004-4000-8000-000000000001",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_older", "major_fault"],
        notes: "Commercial batches; individual consumer walk-in unconfirmed.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110020-0004-4000-8000-000000000002",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        category_slug: "laptops-computers",
        accepted_conditions: ["working_older", "major_fault"],
        notes: "Commercial batches; individual consumer walk-in unconfirmed.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110020-0004-4000-8000-000000000003",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        category_slug: "batteries-cables-peripherals",
        accepted_conditions: ["working_older", "major_fault"],
        notes: "Commercial batches; individual consumer walk-in unconfirmed.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110020-0004-4000-8000-000000000001",
        provider_id: "a0110020-0004-4000-8000-000000000004",
        area_type: "pincode",
        location_code: "110020",
        location_name: "Okhla Industrial Area Phase-I 110020 (Corporate Office)",
        supports_pickup: false, // Single household consumer pickup is NOT offered
        supports_dropoff: false, // Corporate office only; not open for consumer walk-in drop-off
        dropoff_address: "EWRI House, A-46, Okhla Industrial Area Phase-I, New Delhi 110020",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },

  // 6. Goonj (Centre of Circularity)
  {
    id: "a0110076-0005-4000-8000-000000000005",
    name: "Goonj (Centre of Circularity)",
    slug: "goonj-delhi-reuse",
    description: "Non-profit community reuse organisation accepting strictly functional electronics for rural community and educational access.",
    organisation_type: "non_profit_charity",
    website_url: "https://goonj.org",
    source_evidence_url: "https://goonj.org/dropping-centres/",
    evidence_notes: "Intake of working laptops and computers documented at Madanpur Khadar centre. Household doorstep pickup explicitly NOT provided. Prior call required (011-41401216). Non-working, damaged, or hazardous devices strictly excluded.",
    verification_status: "partially_verified",
    approval_status: "pending_review",
    quote_type: "quote_required",
    offers_pickup: false,
    offers_dropoff: true,
    pickup_details: "Household doorstep pickup is NOT provided by Goonj. Donors must arrange transport or coordinate delivery to the processing hub.",
    dropoff_details: "Rajesh Pilot Marg, Madanpur Khadar, Near Sunder Public School, New Delhi 110076 (call 011-41401216 prior to visit).",
    minimum_quantity: 1,
    eligibility_restrictions: "Strictly working laptops, computers, and tablets. Damaged, non-booting, or hazardous items NOT accepted.",
    last_checked_at: "2026-10-26T00:00:00Z",
    is_sample_data: false,
    created_at: "2026-10-26T00:00:00Z",
    updated_at: "2026-10-26T00:00:00Z",
    services: [
      {
        id: "b0110076-0005-4000-8000-000000000001",
        provider_id: "a0110076-0005-4000-8000-000000000005",
        service_type: "donation_reuse",
        service_description: "Community donation and refurbishment for rural education and digital access.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    accepted_categories: [
      {
        id: "c0110076-0005-4000-8000-000000000001",
        provider_id: "a0110076-0005-4000-8000-000000000005",
        category_slug: "laptops-computers",
        accepted_conditions: ["working_recent", "working_older"],
        notes: "Strictly working laptops/PCs. Faulty or non-booting devices excluded.",
        created_at: "2026-10-26T00:00:00Z",
      },
      {
        id: "c0110076-0005-4000-8000-000000000002",
        provider_id: "a0110076-0005-4000-8000-000000000005",
        category_slug: "smartphones-tablets",
        accepted_conditions: ["working_recent", "working_older"],
        notes: "Strictly working phones/tablets.",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
    service_areas: [
      {
        id: "d0110076-0005-4000-8000-000000000001",
        provider_id: "a0110076-0005-4000-8000-000000000005",
        area_type: "pincode",
        location_code: "110076",
        location_name: "Madanpur Khadar 110076",
        supports_pickup: false,
        supports_dropoff: true,
        dropoff_address: "Rajesh Pilot Marg, Madanpur Khadar, Near Sunder Public School, New Delhi 110076",
        created_at: "2026-10-26T00:00:00Z",
      },
    ],
  },
];
