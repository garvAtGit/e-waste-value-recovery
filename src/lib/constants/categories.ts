export interface DeviceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  examples: string[];
  keyFactors: string[];
  typicalPathways: string[];
}

export const DEVICE_CATEGORIES: DeviceCategory[] = [
  {
    id: "smartphones-tablets",
    name: "Smartphones & Tablets",
    slug: "smartphones-tablets",
    description: "Handheld touch devices with high component density, lithium-ion batteries, and sensitive personal storage.",
    examples: ["iPhones & Android phones", "iPads & Android tablets", "E-readers"],
    keyFactors: [
      "OEM activation lock removal (iCloud / FRP)",
      "Screen & rear glass integrity",
      "Battery health degradation percentage",
      "Cellular blacklist & carrier unlock status"
    ],
    typicalPathways: ["Sell for cash", "Exchange / Trade-in", "Repair", "Refurbishers / Parts"]
  },
  {
    id: "laptops-computers",
    name: "Laptops & Desktops",
    slug: "laptops-computers",
    description: "Personal and enterprise computing equipment with modular or soldered storage, memory, and processors.",
    examples: ["MacBook & Windows laptops", "Custom & prebuilt desktop PCs", "Mini PCs & Workstations"],
    keyFactors: [
      "Cryptographic drive sanitisation / NVMe secure erase",
      "Chassis & motherboard physical condition",
      "Processor generation and Windows 11 / macOS support",
      "Battery cycle count (for notebooks)"
    ],
    typicalPathways: ["Repair & upgrade", "Direct sale", "Donate or reuse", "Refurbishers / Parts"]
  },
  {
    id: "audio-wearables",
    name: "Audio, Wearables & Cameras",
    slug: "audio-wearables",
    description: "Compact lifestyle electronics often built with non-removable micro-batteries and precision optics.",
    examples: ["Wireless earbuds & over-ear headphones", "Smartwatches & fitness bands", "DSLR & mirrorless cameras"],
    keyFactors: [
      "Micro-battery retention and charging contact wear",
      "Sensors, optical glass, and gimbal functionality",
      "Hygiene state and replaceable ear cushions / straps"
    ],
    typicalPathways: ["Sell for cash", "Exchange / Trade-in", "Authorised recycling"]
  },
  {
    id: "home-appliances-small",
    name: "Small Home Appliances",
    slug: "home-appliances-small",
    description: "Countertop and handheld electrical appliances with heating elements, electric motors, or basic logic boards.",
    examples: ["Coffee machines & kettles", "Microwaves & air fryers", "Vacuum cleaners & robot vacuums"],
    keyFactors: [
      "Motor, pump, or magnetron operational safety",
      "Presence of limescale, grease, or internal contamination",
      "Access to replacement seals, fuses, and heating elements"
    ],
    typicalPathways: ["Repair", "Donate or reuse", "Authorised recycling"]
  },
  {
    id: "home-appliances-large",
    name: "Large White Goods",
    slug: "home-appliances-large",
    description: "Major domestic appliances requiring specialised heavy logistics, refrigerant recovery, and electrical safety testing.",
    examples: ["Refrigerators & freezers", "Washing machines & dryers", "Dishwashers & ovens"],
    keyFactors: [
      "Refrigerant gas containment (ODS / F-gas compliance)",
      "Compressor, drum bearing, and pump mechanical health",
      "Collection logistics and kerbside handling requirements"
    ],
    typicalPathways: ["Professional repair", "Retailer exchange collection", "Authorised council / WEEE recycler"]
  },
  {
    id: "gaming-entertainment",
    name: "Gaming & Home Entertainment",
    slug: "gaming-entertainment",
    description: "Consoles, home theatre units, display panels, and accessories with active resale and enthusiast part markets.",
    examples: ["PlayStation, Xbox & Nintendo consoles", "Monitors & televisions", "AV receivers & controllers"],
    keyFactors: [
      "Optical drive & HDMI port physical integrity",
      "Thermal paste status & fan noise under load",
      "Controller stick drift and button responsiveness"
    ],
    typicalPathways: ["Direct sale", "Trade-in voucher", "Refurbishers / Modders", "Repair"]
  },
  {
    id: "batteries-cables-peripherals",
    name: "Cables, Batteries & Peripherals",
    slug: "batteries-cables-peripherals",
    description: "Low-unit-value accessories, peripheral hardware, and standalone chemical energy storage.",
    examples: ["Lithium power banks & loose batteries", "Cables, chargers & adapters", "Keyboards, mice & modems"],
    keyFactors: [
      "Chemical cell swelling or puncture hazard",
      "Copper and precious metal scrap concentration",
      "Zero personal data risk (cables/peripherals)"
    ],
    typicalPathways: ["Community reuse bin", "Hazardous battery drop-off", "Authorised e-waste recycler"]
  }
];
