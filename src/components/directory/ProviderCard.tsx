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
  AlertTriangle
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
          <Badge variant="emerald" className="gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Verified Evidence
          </Badge>
        );
      case "partially_verified":
        return (
          <Badge variant="amber" className="gap-1 font-semibold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
            Partially Verified
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" className="gap-1 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
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
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Confirmed Quote Available
          </span>
        );
      case "indicative_estimate":
        return (
          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Indicative Estimate Only
          </span>
        );
      default:
        return (
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Quote on Inspection Required
          </span>
        );
    }
  };

  const hasDocumentedAreas = provider.service_areas && provider.service_areas.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top bar: Demo warning if applicable + Org Type + Verification */}
        {provider.is_sample_data && (
          <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Development Sample Record &bull; Not for commercial use</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {formatOrgType(provider.organisation_type)}
            </span>
            {renderQuoteTypeBadge()}
          </div>
          {renderVerificationBadge()}
        </div>

        {/* Intake Quantity Tier */}
        {provider.minimum_quantity && provider.minimum_quantity > 1 ? (
          <div className="mb-3">
            <span className="inline-flex items-center text-[10px] font-semibold text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
              Bulk Consignments Only (Min. {provider.minimum_quantity} units)
            </span>
          </div>
        ) : (
          <div className="mb-3">
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-900 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Individual Consumer Intake (Min. 1 unit)
            </span>
          </div>
        )}

        {/* Organisation Name & Description */}
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
          {provider.name}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
          {provider.description || "No public description recorded."}
        </p>

        {/* Services Offered */}
        <div className="mb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Documented Services:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {provider.services && provider.services.length > 0 ? (
              provider.services.map((srv) => (
                <span
                  key={srv.id}
                  className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded border border-emerald-200/80"
                  title={srv.service_description || undefined}
                >
                  {formatServiceType(srv.service_type)}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">No specific service breakdown documented</span>
            )}
          </div>
        </div>

        {/* Accepted Categories */}
        <div className="mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            Accepted Equipment Categories:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {provider.accepted_categories && provider.accepted_categories.length > 0 ? (
              provider.accepted_categories.map((cat) => {
                const catDef = DEVICE_CATEGORIES.find((c) => c.slug === cat.category_slug);
                return (
                  <span
                    key={cat.id}
                    className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200"
                    title={cat.notes || undefined}
                  >
                    {catDef ? catDef.name : cat.category_slug}
                  </span>
                );
              })
            ) : (
              <span className="text-xs text-slate-400 italic">Categories not documented</span>
            )}
          </div>
        </div>

        {/* Service Locations & Drop-off Points (STRICT: Unknowns explicitly stated) */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-5 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            Service Area & Logistics:
          </span>

          {/* Logistics summary */}
          <div className="flex flex-wrap gap-2 mb-2 text-slate-700">
            <span className="inline-flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              Pickup: <strong>{provider.offers_pickup ? "Available" : "Not offered"}</strong>
            </span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Drop-off: <strong>{provider.offers_dropoff ? "Available" : "Not offered"}</strong>
            </span>
          </div>

          {/* Documented Locations */}
          {hasDocumentedAreas ? (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-600 block">
                Verified Locations / Pincodes:
              </span>
              <ul className="space-y-1 text-slate-600">
                {provider.service_areas.map((area) => (
                  <li key={area.id} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">&bull;</span>
                    <span>
                      <strong>{area.location_name}</strong>
                      {area.location_code && (
                        <span className="text-slate-500 font-mono text-[11px] ml-1">
                          ({area.location_code})
                        </span>
                      )}
                      {area.dropoff_address && (
                        <span className="block text-[11px] mt-0.5 text-slate-600">
                          {area.supports_dropoff ? (
                            <strong className="text-emerald-800 font-semibold">Public Drop-off Depot: </strong>
                          ) : (
                            <strong className="text-amber-800 font-semibold">Office / Consignment Facility (Consumer walk-in unconfirmed): </strong>
                          )}
                          {area.dropoff_address}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200/80 text-slate-500 text-[11px]">
              <em>Service area not documented or unknown. Do not assume regional coverage without contacting the provider.</em>
            </div>
          )}

          {/* Eligibility restrictions */}
          {provider.eligibility_restrictions && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-700">Restrictions: </span>
              {provider.eligibility_restrictions}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Official Source & Last Checked Date */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
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
              className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-semibold hover:underline"
            >
              <span>Official Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          {provider.source_evidence_url ? (
            <a
              href={provider.source_evidence_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-900 font-semibold hover:underline"
            >
              <span>Evidence Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-slate-400 italic">No source URL documented</span>
          )}
        </div>
      </div>
    </div>
  );
}
