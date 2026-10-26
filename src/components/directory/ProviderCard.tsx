import React from "react";
import { ProviderWithDetails } from "@/lib/supabase/types";
import { DEVICE_CATEGORIES } from "@/lib/constants/categories";
import { Badge } from "../ui/Badge";
import {
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Truck,
  Building2,
  ExternalLink,
  MapPin,
  Calendar,
  AlertTriangle,
} from "lucide-react";

interface ProviderCardProps {
  provider: ProviderWithDetails;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  // Format organisation type into human-readable label
  const formatOrgType = (type: string) => {
    switch (type) {
      case "authorised_recycler":
        return "Authorised Recycler";
      case "commercial_refurbisher":
        return "Commercial Refurbisher";
      case "non_profit_charity":
        return "Non-Profit Charity";
      case "repair_service":
        return "Repair Service";
      case "retailer_oem":
        return "Retailer / OEM";
      case "component_salvager":
        return "Component Salvager";
      default:
        return type.replace(/_/g, " ");
    }
  };

  // Format service type into readable badge
  const formatServiceType = (service: string) => {
    switch (service) {
      case "repair":
        return "Repair";
      case "cash_buyback":
        return "Cash Buyback";
      case "exchange":
        return "Trade-in / Exchange";
      case "donation_reuse":
        return "Donation & Reuse";
      case "component_recovery":
        return "Component Recovery";
      case "recycling":
        return "Material Recycling";
      default:
        return service.replace(/_/g, " ");
    }
  };

  // Verification badge renderer
  const renderVerificationBadge = () => {
    switch (provider.verification_status) {
      case "verified":
        return (
          <Badge variant="emerald" className="gap-1 font-mono text-[10px]">
            <ShieldCheck className="w-3 h-3 text-[#1B3B2B]" />
            Verified Evidence
          </Badge>
        );
      case "partially_verified":
        return (
          <Badge variant="amber" className="gap-1 font-mono text-[10px]">
            <AlertCircle className="w-3 h-3 text-[#C8532C]" />
            Partially Verified
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="gap-1 font-mono text-[10px]">
            <HelpCircle className="w-3 h-3 text-[#8E8B82]" />
            Unverified
          </Badge>
        );
    }
  };

  // Quote type badge renderer
  const renderQuoteTypeBadge = () => {
    switch (provider.quote_type) {
      case "confirmed_quote":
        return (
          <span className="font-mono text-[10px] text-[#5A574F] bg-[#F4F1EA] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
            Confirmed Quote Available
          </span>
        );
      case "indicative_estimate":
        return (
          <span className="font-mono text-[10px] text-[#5A574F] bg-[#F4F1EA] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
            Indicative Estimate Only
          </span>
        );
      default:
        return (
          <span className="font-mono text-[10px] text-[#8E8B82] bg-[#F4F1EA] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
            Quote on Inspection Required
          </span>
        );
    }
  };

  const hasDocumentedAreas = provider.service_areas && provider.service_areas.length > 0;

  return (
    <div className="bg-white rounded-sm border border-[#E5E0D8] p-6 sm:p-7 shadow-xs hover:border-[#C5BFB5] transition-all flex flex-col justify-between">
      <div>
        {/* Top bar: Demo warning if applicable */}
        {provider.is_sample_data && (
          <div className="mb-3.5 bg-[#FFF9F5] border border-[#F3D1C2] text-[#C8532C] text-xs px-3 py-1.5 rounded-sm flex items-center gap-1.5 font-mono text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#C8532C] shrink-0" />
            <span>Development Sample Record &bull; Not for commercial use</span>
          </div>
        )}

        {/* Badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold text-[#5A574F] uppercase tracking-wider bg-[#F4F1EA] px-2 py-0.5 rounded-sm border border-[#E5E0D8]">
              {formatOrgType(provider.organisation_type)}
            </span>
            {renderQuoteTypeBadge()}
          </div>
          {renderVerificationBadge()}
        </div>

        {/* Intake Quantity Tier */}
        {provider.minimum_quantity && provider.minimum_quantity > 1 ? (
          <div className="mb-3.5">
            <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-wider text-[#6A4E23] bg-[#FAF5EB] border border-[#E8DCBF] px-2 py-0.5 rounded-sm">
              Bulk Consignments Only (Min. {provider.minimum_quantity} units)
            </span>
          </div>
        ) : (
          <div className="mb-3.5">
            <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-wider text-[#1B3B2B] bg-[#EDF5F0] border border-[#C6DFD0] px-2 py-0.5 rounded-sm">
              Individual Consumer Intake (Min. 1 unit)
            </span>
          </div>
        )}

        {/* Organisation Name & Description */}
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#141413] tracking-tight mb-2">
          {provider.name}
        </h3>
        <p className="text-xs sm:text-sm text-[#5A574F] mb-5 leading-relaxed">
          {provider.description || "No public description recorded."}
        </p>

        {/* Services Offered */}
        <div className="mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] block mb-1.5">
            Documented Services
          </span>
          <div className="flex flex-wrap gap-1.5">
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((srv) => (
                <span
                  key={srv.id}
                  className="px-2 py-0.5 bg-[#EDF5F0] text-[#1B3B2B] text-xs font-mono rounded-sm border border-[#C6DFD0]"
                  title={srv.service_description || undefined}
                >
                  {formatServiceType(srv.service_type)}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#8E8B82] italic">No specific service breakdown documented</span>
            )}
          </div>
        </div>

        {/* Accepted Categories */}
        <div className="mb-5">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8E8B82] block mb-1.5">
            Accepted Equipment Categories
          </span>
          <div className="flex flex-wrap gap-1.5">
            {provider.accepted_categories && provider.accepted_categories.length > 0 ? (
              provider.accepted_categories.map((cat) => {
                const catDef = DEVICE_CATEGORIES.find((c) => c.slug === cat.category_slug);
                return (
                  <span
                    key={cat.id}
                    className="px-2 py-0.5 bg-[#F4F1EA] text-[#5A574F] text-xs font-mono rounded-sm border border-[#E5E0D8]"
                    title={cat.notes || undefined}
                  >
                    {catDef ? catDef.name : cat.category_slug}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-[#8E8B82] italic">Categories not documented</span>
            )}
          </div>
        </div>

        {/* Service Locations & Drop-off Points */}
        <div className="bg-[#FAF9F5] rounded-sm p-4 border border-[#E5E0D8] mb-5 text-xs">
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#141413] flex items-center gap-1.5 mb-2.5">
            <MapPin className="w-3.5 h-3.5 text-[#1B3B2B]" />
            Service Area & Logistics Coverage
          </span>

          {/* Logistics summary */}
          <div className="flex flex-wrap gap-2 mb-2.5 text-[#5A574F] font-mono text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3 h-3 text-[#8E8B82]" />
              Pickup: <strong className="text-[#141413]">{provider.offers_pickup ? "Available" : "Not offered"}</strong>
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3 h-3 text-[#8E8B82]" />
              Drop-off: <strong className="text-[#141413]">{provider.offers_dropoff ? "Available" : "Not offered"}</strong>
            </span>
          </div>

          {/* Documented Locations */}
          {hasDocumentedAreas ? (
            <div className="space-y-1.5 pt-2 border-t border-[#E5E0D8]">
              <span className="font-mono text-[10px] font-bold uppercase text-[#8E8B82] block">
                Verified Locations / Pincodes:
              </span>
              <ul className="space-y-1.5 text-[#5A574F]">
                {provider.service_areas.map((area) => (
                  <li key={area.id} className="flex items-start gap-1.5">
                    <span className="text-[#1B3B2B] font-bold">&bull;</span>
                    <div>
                      <strong className="text-[#141413]">{area.location_name}</strong>
                      {area.location_code && (
                        <span className="text-[#8E8B82] font-mono text-[11px] ml-1">
                          ({area.location_code})
                        </span>
                      )}
                      {area.dropoff_address && (
                        <span className="block text-[11px] mt-0.5">
                          {area.supports_dropoff ? (
                            <strong className="text-[#1B3B2B] font-medium">Public Drop-off Depot: </strong>
                          ) : (
                            <strong className="text-[#C8532C] font-medium">Office / Consignment Facility (Consumer walk-in unconfirmed): </strong>
                          )}
                          {area.dropoff_address}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#E5E0D8] text-[#8E8B82] text-[11px] italic">
              Service area not documented or unknown. Do not assume regional coverage without contacting the provider.
            </div>
          )}

          {/* Eligibility restrictions */}
          {provider.eligibility_restrictions && (
            <div className="mt-2.5 pt-2 border-t border-[#E5E0D8] text-[11px] text-[#5A574F]">
              <span className="font-mono text-[10px] uppercase font-bold text-[#141413]">Restrictions: </span>
              {provider.eligibility_restrictions}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Official Source & Last Checked Date */}
      <div className="pt-4 border-t border-[#E5E0D8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#8E8B82] font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#8E8B82]" />
          <span>
            Last checked:{" "}
            {provider.last_checked_at
              ? new Date(provider.last_checked_at).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "Unknown"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {provider.website_url && (
            <a
              href={provider.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#141413] hover:text-[#1B3B2B] font-semibold underline transition-colors"
            >
              <span>Official Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {provider.source_evidence_url ? (
            <a
              href={provider.source_evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#1B3B2B] hover:text-[#132A1F] font-semibold underline transition-colors"
            >
              <span>Evidence Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-[#8E8B82] italic">No source URL documented</span>
          )}
        </div>
      </div>
    </div>
  );
}
