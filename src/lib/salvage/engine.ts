import { SALVAGE_BOM_CATALOG } from "./catalog";
import { DeviceSalvageBOM, SalvageValuationResult } from "./types";

export function getSalvageBOMByModel(modelId: string): DeviceSalvageBOM | null {
  return SALVAGE_BOM_CATALOG.find((b) => b.modelId === modelId) || null;
}

export function getAllSalvageModels(): DeviceSalvageBOM[] {
  return SALVAGE_BOM_CATALOG;
}

export function evaluateComponentSalvage(
  modelId: string,
  functionalComponentIds: string[]
): SalvageValuationResult | null {
  const device = getSalvageBOMByModel(modelId);
  if (!device) return null;

  const functionalSet = new Set(functionalComponentIds);

  const activeParts = device.components.filter((c) => functionalSet.has(c.id));
  const totalHarvestableValueInr = activeParts.reduce((acc, c) => acc + c.salvageValueInr, 0);

  const scrapComparisonMultiplier = Number(
    (totalHarvestableValueInr / Math.max(1, device.genericScrapOfferInr)).toFixed(1)
  );

  const eligiblePartsList = activeParts.filter((c) => c.eligibleForResale);
  const restrictedPartsList = activeParts.filter((c) => !c.eligibleForResale);

  const physicalRoutingGuide = [
    {
      hubName: "Nehru Place Hardware & Screen Labs",
      locality: "Nehru Place Commercial Complex, South Delhi (110019)",
      acceptedParts: eligiblePartsList
        .filter((p) => p.category === "display" || p.category === "acoustics_haptics")
        .map((p) => p.name),
      recommendedAction:
        "Top spot payout for original OEM AMOLED and Retina screens needed for daily consumer repairs.",
    },
    {
      hubName: "Karol Bagh Gaffar Market Spare Exchange",
      locality: "Gaffar Market / Arya Samaj Road, Central Delhi (110005)",
      acceptedParts: eligiblePartsList
        .filter((p) => p.category === "camera" || p.category === "housing")
        .map((p) => p.name),
      recommendedAction:
        "Wholesale clearing hub for pristine camera modules, Glyph back panels, and unbent aluminum chassis.",
    },
    {
      hubName: "CPCB Authorized Recycler (EWRI Okhla)",
      locality: "Okhla Industrial Area Phase II, South Delhi (110020)",
      acceptedParts: restrictedPartsList.map((p) => p.name),
      recommendedAction:
        "Legal closed-loop recycling for worn/swollen lithium batteries and scrap motherboards to prevent toxic acid leaching.",
    },
  ].filter((h) => h.acceptedParts.length > 0);

  return {
    device,
    selectedComponentIds: functionalComponentIds,
    totalHarvestableValueInr,
    scrapComparisonMultiplier,
    eligiblePartsList,
    restrictedPartsList,
    physicalRoutingGuide,
  };
}
