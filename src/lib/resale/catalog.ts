import {
  PhoneBrand,
  PhoneModel,
  PhoneCondition,
  PhoneFaultOption,
} from "./types";

export const PHONE_BRANDS: PhoneBrand[] = [
  "Apple",
  "Samsung",
  "OnePlus",
  "Google",
  "Xiaomi",
  "Vivo",
  "Nothing",
];

export const PHONE_CATALOG: PhoneModel[] = [
  // --- APPLE ---
  {
    id: "apple-iphone-15-pro",
    brand: "Apple",
    name: "iPhone 15 Pro",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
    basePricesByStorage: {
      "128GB": 68000,
      "256GB": 75000,
      "512GB": 85000,
      "1TB": 95000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-15",
    brand: "Apple",
    name: "iPhone 15",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB", "512GB"],
    basePricesByStorage: {
      "128GB": 44000,
      "256GB": 51000,
      "512GB": 60000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-14-pro",
    brand: "Apple",
    name: "iPhone 14 Pro",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB", "512GB", "1TB"],
    basePricesByStorage: {
      "128GB": 48000,
      "256GB": 54000,
      "512GB": 62000,
      "1TB": 70000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-14",
    brand: "Apple",
    name: "iPhone 14",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB", "512GB"],
    basePricesByStorage: {
      "128GB": 32000,
      "256GB": 37000,
      "512GB": 45000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-13",
    brand: "Apple",
    name: "iPhone 13",
    releaseYear: 2021,
    storageOptions: ["128GB", "256GB", "512GB"],
    basePricesByStorage: {
      "128GB": 26000,
      "256GB": 30500,
      "512GB": 37000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-12",
    brand: "Apple",
    name: "iPhone 12",
    releaseYear: 2020,
    storageOptions: ["64GB", "128GB", "256GB"],
    basePricesByStorage: {
      "64GB": 16000,
      "128GB": 18500,
      "256GB": 22000,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-11",
    brand: "Apple",
    name: "iPhone 11",
    releaseYear: 2019,
    storageOptions: ["64GB", "128GB", "256GB"],
    basePricesByStorage: {
      "64GB": 11000,
      "128GB": 13000,
      "256GB": 15500,
    },
    isAppleTradeInEligible: true,
  },
  {
    id: "apple-iphone-se-2022",
    brand: "Apple",
    name: "iPhone SE (3rd Gen, 2022)",
    releaseYear: 2022,
    storageOptions: ["64GB", "128GB", "256GB"],
    basePricesByStorage: {
      "64GB": 12000,
      "128GB": 14500,
      "256GB": 17500,
    },
    isAppleTradeInEligible: true,
  },

  // --- SAMSUNG ---
  {
    id: "samsung-galaxy-s24-ultra",
    brand: "Samsung",
    name: "Galaxy S24 Ultra",
    releaseYear: 2024,
    storageOptions: ["256GB", "512GB", "1TB"],
    basePricesByStorage: {
      "256GB": 72000,
      "512GB": 82000,
      "1TB": 92000,
    },
  },
  {
    id: "samsung-galaxy-s23",
    brand: "Samsung",
    name: "Galaxy S23 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 32000,
      "256GB": 36000,
    },
  },
  {
    id: "samsung-galaxy-s22",
    brand: "Samsung",
    name: "Galaxy S22 5G",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 22000,
      "256GB": 25000,
    },
  },
  {
    id: "samsung-galaxy-s21-fe",
    brand: "Samsung",
    name: "Galaxy S21 FE 5G",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 14000,
      "256GB": 16500,
    },
  },
  {
    id: "samsung-galaxy-a54",
    brand: "Samsung",
    name: "Galaxy A54 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 13000,
      "256GB": 15000,
    },
  },

  // --- ONEPLUS ---
  {
    id: "oneplus-12",
    brand: "OnePlus",
    name: "OnePlus 12",
    releaseYear: 2024,
    storageOptions: ["256GB", "512GB"],
    basePricesByStorage: {
      "256GB": 42000,
      "512GB": 48000,
    },
  },
  {
    id: "oneplus-11",
    brand: "OnePlus",
    name: "OnePlus 11 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 26000,
      "256GB": 30000,
    },
  },
  {
    id: "oneplus-10-pro",
    brand: "OnePlus",
    name: "OnePlus 10 Pro 5G",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 18000,
      "256GB": 21000,
    },
  },
  {
    id: "oneplus-nord-3",
    brand: "OnePlus",
    name: "OnePlus Nord 3 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 14000,
      "256GB": 16500,
    },
  },
  {
    id: "oneplus-nord-ce-3",
    brand: "OnePlus",
    name: "OnePlus Nord CE 3 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 10500,
      "256GB": 12000,
    },
  },

  // --- GOOGLE ---
  {
    id: "google-pixel-8",
    brand: "Google",
    name: "Pixel 8",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 32000,
      "256GB": 37000,
    },
  },
  {
    id: "google-pixel-7",
    brand: "Google",
    name: "Pixel 7",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 18000,
      "256GB": 21000,
    },
  },
  {
    id: "google-pixel-6a",
    brand: "Google",
    name: "Pixel 6a",
    releaseYear: 2022,
    storageOptions: ["128GB"],
    basePricesByStorage: {
      "128GB": 10500,
    },
  },

  // --- XIAOMI ---
  {
    id: "xiaomi-13-pro",
    brand: "Xiaomi",
    name: "Xiaomi 13 Pro",
    releaseYear: 2023,
    storageOptions: ["256GB"],
    basePricesByStorage: {
      "256GB": 28000,
    },
  },
  {
    id: "redmi-note-13-pro",
    brand: "Xiaomi",
    name: "Redmi Note 13 Pro 5G",
    releaseYear: 2024,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 13500,
      "256GB": 15500,
    },
  },
  {
    id: "redmi-note-12-pro",
    brand: "Xiaomi",
    name: "Redmi Note 12 Pro 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 9500,
      "256GB": 11000,
    },
  },

  // --- VIVO ---
  {
    id: "vivo-v29",
    brand: "Vivo",
    name: "Vivo V29 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 14000,
      "256GB": 16000,
    },
  },
  {
    id: "iqoo-neo-7",
    brand: "Vivo",
    name: "iQOO Neo 7 5G",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 13500,
      "256GB": 15500,
    },
  },

  // --- NOTHING ---
  {
    id: "nothing-phone-2",
    brand: "Nothing",
    name: "Nothing Phone (2)",
    releaseYear: 2023,
    storageOptions: ["128GB", "256GB", "512GB"],
    basePricesByStorage: {
      "128GB": 19500,
      "256GB": 22500,
      "512GB": 26000,
    },
  },
  {
    id: "nothing-phone-2a",
    brand: "Nothing",
    name: "Nothing Phone (2a)",
    releaseYear: 2024,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 13500,
      "256GB": 15500,
    },
  },
  {
    id: "nothing-phone-2a-plus",
    brand: "Nothing",
    name: "Nothing Phone (2a) Plus",
    releaseYear: 2024,
    storageOptions: ["256GB"],
    basePricesByStorage: {
      "256GB": 17000,
    },
  },
  {
    id: "nothing-phone-1",
    brand: "Nothing",
    name: "Nothing Phone (1)",
    releaseYear: 2022,
    storageOptions: ["128GB", "256GB"],
    basePricesByStorage: {
      "128GB": 12000,
      "256GB": 14000,
    },
  },
  {
    id: "nothing-phone-4b",
    brand: "Nothing",
    name: "Nothing 4b / CMF Phone 1",
    releaseYear: 2024,
    storageOptions: ["128GB"],
    basePricesByStorage: {
      "128GB": 9800,
    },
  },
];

export const CONDITION_DEFINITIONS: Record<
  PhoneCondition,
  { label: string; factor: number; description: string; badge: string }
> = {
  flawless: {
    label: "Flawless / Like New",
    factor: 1.0,
    description: "Zero visible scratches, original display, pristine chassis, battery health > 85%.",
    badge: "border-[#1B3B2B] bg-[#EDF5F0] text-[#1B3B2B]",
  },
  good: {
    label: "Good / Normal Wear",
    factor: 0.85,
    description: "Minor hairline micro-scratches on frame/rear, screen 100% scratch-free, fully functional.",
    badge: "border-[#D5D0C5] bg-[#FAF9F5] text-[#141413]",
  },
  fair: {
    label: "Fair / Heavy Scratches",
    factor: 0.7,
    description: "Noticeable scratches, paint chipping, or corner scuffs on casing. Screen fully responsive.",
    badge: "border-[#E8DCBF] bg-[#FAF5EB] text-[#6A4E23]",
  },
  faulty: {
    label: "Minor Fault / Broken Glass",
    factor: 0.45,
    description: "Cracked glass, worn battery (<80%), or single faulty sensor. Device boots and functions.",
    badge: "border-[#F3D1C2] bg-[#FFF9F5] text-[#C8532C]",
  },
  major_fault: {
    label: "Major Fault / Non-Functional",
    factor: 0.2,
    description: "Does not turn on, severe liquid damage, dead display, or boot loop. Salvage value only.",
    badge: "border-[#E5E0D8] bg-[#F4F1EA] text-[#5A574F]",
  },
  hazardous: {
    label: "Swollen Battery / Thermal Risk",
    factor: 0.0,
    description: "Battery physically swollen, bulging screen/rear, chemical smell. Transport & resale blocked.",
    badge: "border-[#C8532C] bg-[#FFF0E8] text-[#C8532C]",
  },
};

export const COMMON_PHONE_FAULTS: PhoneFaultOption[] = [
  {
    id: "fault-screen-cracked",
    label: "Cracked Screen / Display Glass",
    description: "Glass is fractured or has lines, but touch and OLED respond.",
    deductionAmount: 3200,
    affectsDisplay: true,
  },
  {
    id: "fault-back-glass",
    label: "Broken Rear Glass / Panel",
    description: "Rear panel is spiderwebbed or severely scratched.",
    deductionAmount: 1400,
  },
  {
    id: "fault-battery-service",
    label: "Battery Health < 80% / Service",
    description: "Battery discharges rapidly or displays service advisory.",
    deductionAmount: 1800,
    affectsBattery: true,
  },
  {
    id: "fault-camera-lens",
    label: "Camera Malfunction / Cracked Lens",
    description: "Blurry focus, cracked camera lens, or shutter error.",
    deductionAmount: 2200,
  },
  {
    id: "fault-biometrics",
    label: "Face ID / Fingerprint Failure",
    description: "Biometric sensor does not register or throws hardware error.",
    deductionAmount: 2500,
  },
  {
    id: "fault-speaker-mic",
    label: "Distorted Ear-Speaker / Microphone",
    description: "Calls cannot be heard clearly or microphone crackles.",
    deductionAmount: 800,
  },
  {
    id: "fault-water-indicator",
    label: "Liquid Contact / Moisture Tripped",
    description: "Red moisture indicator visible in SIM tray or port.",
    deductionAmount: 4500,
    deductionPercent: 0.35,
  },
];

export const ACCESSORY_VALUES: Record<
  "box" | "original_charger" | "valid_bill",
  { label: string; bonusAmount: number; description: string }
> = {
  valid_bill: {
    label: "Original GST Invoice / Purchase Bill",
    bonusAmount: 700,
    description: "Proves legitimate non-stolen ownership, prevents deduction.",
  },
  box: {
    label: "Original Packaging Box (Matching IMEI)",
    bonusAmount: 400,
    description: "Increases secondary dealer resale grading.",
  },
  original_charger: {
    label: "Original OEM Fast Charger & Cable",
    bonusAmount: 500,
    description: "Saves buyer component sourcing cost.",
  },
};

/**
 * Checks if a 6-digit string is an authoritative Delhi NCT pincode.
 * Delhi pincodes start with 110001 through 110099.
 */
export function isDelhiPincode(pincode: string): boolean {
  const clean = pincode.trim();
  if (!/^\d{6}$/.test(clean)) return false;
  const prefix = clean.substring(0, 3);
  return prefix === "110";
}

/**
 * Returns documented Delhi locality name for key pilot areas.
 */
export function getDelhiLocalityName(pincode: string): string | null {
  const map: Record<string, string> = {
    "110001": "Connaught Place / Central Delhi",
    "110002": "Daryaganj / Old Delhi",
    "110005": "Karol Bagh / Patel Nagar",
    "110017": "Saket / Malviya Nagar (South Delhi)",
    "110019": "Nehru Place / Kalkaji",
    "110020": "Okhla Industrial Area Phase I-III",
    "110049": "South Extension / Andrews Ganj",
    "110075": "Dwarka Sector 6-10",
    "110085": "Rohini Sector 7-14",
    "110092": "Laxmi Nagar / East Delhi",
  };
  return map[pincode.trim()] || null;
}

export const PHONE_MODELS = PHONE_CATALOG;
export const PHONE_FAULTS = COMMON_PHONE_FAULTS;
export const PHONE_ACCESSORIES = ACCESSORY_VALUES;

export function getModelsByBrand(brand: string): PhoneModel[] {
  const norm = brand.trim().toLowerCase();
  return PHONE_CATALOG.filter((m) => m.brand.toLowerCase() === norm);
}

export function getModelById(id: string): PhoneModel | undefined {
  return PHONE_CATALOG.find((m) => m.id === id);
}

/**
 * Checks whether quote/pricing data is stale based on a maximum age threshold.
 * Uses October 2026 as the active pilot baseline date.
 */
export function isQuoteStale(lastVerifiedDate: string, maxAgeDays = 60): boolean {
  if (!lastVerifiedDate) return true;
  try {
    const verifiedTime = new Date(lastVerifiedDate).getTime();
    if (isNaN(verifiedTime)) return true;
    const pilotDate = new Date("2026-10-27T00:00:00Z").getTime();
    const ageDays = (pilotDate - verifiedTime) / (1000 * 60 * 60 * 24);
    return ageDays > maxAgeDays;
  } catch {
    return true;
  }
}
