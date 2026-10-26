export interface Pathway {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  bestSuitedFor: string[];
  tradeoffs: {
    financialReturn: "Highest" | "Moderate to High" | "Store-locked" | "Modest (Salvage)" | "Zero (Charitable)" | "Zero to Nominal";
    effortRequired: "Low" | "Medium" | "High";
    speed: "Same day to days" | "1 to 2 weeks" | "Immediate to 3 days" | "3 to 7 days" | "Immediate" | "Immediate to scheduled";
  };
  keyPrerequisites: string[];
  caveats: string[];
}

export const PATHWAYS: Pathway[] = [
  {
    id: "repair",
    title: "Repair and Continue Using",
    shortDescription: "Restore functionality to defer new purchases and extend the device's operational life.",
    fullDescription: "Diagnose specific hardware faults (such as a degraded battery, broken display, worn bearing, or blown capacitor) and replace accessible parts. This route generally retains the greatest personal utility when repair costs remain well below the cost of a comparable replacement.",
    bestSuitedFor: [
      "Devices that still receive active operating system and security updates",
      "Isolated faults where replacement parts and repair manuals are accessible",
      "Equipment where performance of newer models offers minimal practical advantage"
    ],
    tradeoffs: {
      financialReturn: "Highest",
      effortRequired: "Medium",
      speed: "Same day to days"
    },
    keyPrerequisites: [
      "Availability of reputable replacement components and repair guides",
      "Assessment of remaining software support lifespan before investing in hardware parts",
      "Chassis has not suffered severe structural or unrecoverable board damage"
    ],
    caveats: [
      "Serialized component pairing on certain modern smartphones may restrict third-party part functionality",
      "Devices past software support end-of-life may pose security vulnerabilities despite working hardware"
    ]
  },
  {
    id: "sell-cash",
    title: "Sell for Cash (Direct to Consumer)",
    shortDescription: "List directly on consumer marketplaces to capture peer-to-peer market value.",
    fullDescription: "Sell directly to individual buyers via peer-to-peer marketplaces. This route typically recovers higher gross cash than trade-in programs, but requires managing listing details, photography, communication, shipping, and platform seller fees.",
    bestSuitedFor: [
      "Fully operational or cosmetically sound equipment with active consumer interest",
      "Models where secondary market demand exceeds dealer trade-in valuations",
      "Sellers comfortable handling buyer inquiries, secure packaging, and tracking"
    ],
    tradeoffs: {
      financialReturn: "Highest",
      effortRequired: "High",
      speed: "1 to 2 weeks"
    },
    keyPrerequisites: [
      "Complete user data removal (e.g. factory reset with hardware-backed encryption, or dedicated media sanitisation)",
      "Decoupling of manufacturer anti-theft and cloud locks (e.g. iCloud, Google FRP)",
      "Honest disclosure of cosmetic condition, battery health, and any missing accessories"
    ],
    caveats: [
      "Open marketplaces carry risks of buyer disputes, payment hold periods, and shipping damage",
      "Market values decline steadily as successor models enter the market"
    ]
  },
  {
    id: "exchange-voucher",
    title: "Exchange for Voucher / Trade-in",
    shortDescription: "Trade in with original manufacturers or retailers against new equipment or store credit.",
    fullDescription: "Submit devices directly to retailer or manufacturer trade-in programs. Payouts are generally lower than direct consumer sales because trade-in operators deduct inspection, refurbishing, and holding costs, but the process provides structured shipping and immediate closure.",
    bestSuitedFor: [
      "Consumers intending to buy a replacement from the same retailer or brand",
      "Users who prefer prepaid shipping and minimal buyer interaction",
      "Supported device models listed within trade-in catalog databases"
    ],
    tradeoffs: {
      financialReturn: "Store-locked",
      effortRequired: "Low",
      speed: "Immediate to 3 days"
    },
    keyPrerequisites: [
      "Device matches the catalog model specification and serial number",
      "All account locks and remote security features deactivated before sending",
      "Battery is intact without signs of swelling or puncture"
    ],
    caveats: [
      "Initial online estimates are provisional; inspection facilities often revise valuations downward upon physical grading",
      "Store credits and promotional vouchers typically have expiration dates or category restrictions"
    ]
  },
  {
    id: "refurbishers-parts",
    title: "Sell to Refurbishers & Component Buyers",
    shortDescription: "Liquidate damaged, locked, or faulty devices for salvageable sub-assemblies.",
    fullDescription: "Specialised repairers and salvage operators purchase non-working devices to harvest working components—such as original display panels, camera modules, structural housings, and discrete ICs—recovering residual value from otherwise uneconomical hardware.",
    bestSuitedFor: [
      "Units with broken screens, damaged charging ports, or unbootable mainboards",
      "Devices where professional repair estimates exceed current market value",
      "Hardware models with active third-party repair and parts demand"
    ],
    tradeoffs: {
      financialReturn: "Modest (Salvage)",
      effortRequired: "Low",
      speed: "3 to 7 days"
    },
    keyPrerequisites: [
      "Verification that personal storage cannot be read, or physical memory destroyed",
      "Proof of lawful ownership to prevent trafficking in locked or disputed hardware",
      "Packaging that protects remaining intact components and isolates the battery"
    ],
    caveats: [
      "Salvage values depend heavily on real-time market demand for specific spare parts",
      "Generic, budget, or severely outdated electronics often have zero salvage demand"
    ]
  },
  {
    id: "donate-reuse",
    title: "Donate or Transfer for Reuse",
    shortDescription: "Transfer functional equipment to charities, schools, community groups, or family.",
    fullDescription: "Extend the lifecycle of functional electronics by donating to registered community organisations, digital inclusion projects, or schools. Many groups configure older systems with lightweight operating systems to support basic digital access.",
    bestSuitedFor: [
      "Working computers, tablets, and peripherals with several years of usable life remaining",
      "Small appliances and equipment that pass visual and electrical safety checks",
      "Surplus working electronics where social utility takes precedence over financial return"
    ],
    tradeoffs: {
      financialReturn: "Zero (Charitable)",
      effortRequired: "Medium",
      speed: "Immediate"
    },
    keyPrerequisites: [
      "Equipment must be in safe working order with power supplies and necessary cords included",
      "Complete erasure of personal accounts and local storage before donation",
      "Direct confirmation with the recipient charity that they currently accept the specific device type"
    ],
    caveats: [
      "Donating unusable, locked, or defective electronics creates waste disposal costs for non-profits",
      "In many jurisdictions, charities require electrical safety verification (such as PAT or local compliance checks) before mains appliances can be redistributed"
    ]
  },
  {
    id: "authorised-recycling",
    title: "Hand Over to Authorised Recyclers",
    shortDescription: "Deliver unrepairable, obsolete, or hazardous electronics to accredited recovery facilities.",
    fullDescription: "When an item cannot be safely reused or repaired, delivery to an authorised e-waste facility ensures proper separation. Certified recyclers isolate hazardous fractions (such as lead, mercury, and chemical electrolytes) and recover recyclable metals (copper, aluminum, gold) under environmental regulations.",
    bestSuitedFor: [
      "Irreparable, obsolete, or physically hazardous equipment",
      "Degraded lithium batteries, loose obsolete wiring, and broken power supplies",
      "Appliances with controlled components (such as refrigerants or heavy capacitors)"
    ],
    tradeoffs: {
      financialReturn: "Zero to Nominal",
      effortRequired: "Low",
      speed: "Immediate to scheduled"
    },
    keyPrerequisites: [
      "Verify facility operates under official environmental permits or recognised standards (e.g. WEEE compliance, R2v3, or e-Stewards)",
      "Tape exposed terminals on loose lithium batteries before placing in collection containers",
      "Ensure personal storage media is physically destroyed or verified wiped if handing over sensitive devices"
    ],
    caveats: [
      "Avoid informal scrap handlers who lack regulated facilities for hazardous fraction handling",
      "Recycling centers focus on safe material reclamation; individual consumer compensation is uncommon for small quantities"
    ]
  }
];
