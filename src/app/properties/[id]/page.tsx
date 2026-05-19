"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Square, Calendar, ShieldCheck, Phone, ArrowLeft, Loader2, Building2, MessageSquare, CreditCard } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PathToOwnership } from "@/components/properties/path-to-ownership";
import { toast } from "sonner";
import { PublicPageActions } from "@/components/shared/public-page-actions";
import { useAuthStore } from "@/store/useAuthStore";
import Cookies from "js-cookie";

interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  price: number;
  listing_type: string;
  minimum_holding_fee?: number;
  mandate_type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  year_built: number;
  amenities: string;
  images: { image_url: string }[];
  owner?: { id: string; profile: { full_name: string; phone_number: string }; email: string };
  agent?: { id: string; profile: { full_name: string; phone_number: string }; email: string };
  created_at: string;
}

interface LeaseRequest {
  id: string;
  property_id: string;
  status: string;
}

interface Invoice {
  id: string;
  property_id: string;
  type: string;
  status: string;
  amount: number;
}

interface WalletData {
  pin_set_at?: string | null;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id } = use(params);
  const [property, setProperty] = useState<Property | null>(null);
  const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const [propertyRes, requestRes, invoiceRes, walletRes] = await Promise.allSettled([
          api.get<Property>(ENDPOINTS.PROPERTIES.GET_ONE(id)),
          api.get<LeaseRequest[]>("/tenant/lease-requests"),
          api.get<Invoice[]>("/tenant/invoices"),
          api.get<WalletData>("/wallet"),
        ]);

        if (propertyRes.status === "fulfilled") {
          setProperty(propertyRes.value);
        }
        if (requestRes.status === "fulfilled") {
          setLeaseRequests(requestRes.value || []);
        }
        if (invoiceRes.status === "fulfilled") {
          setInvoices(invoiceRes.value || []);
        }
        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value);
        }
      } catch (err) {
        console.error("Failed to load property", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const [paying, setPaying] = useState(false);
  const [requestingLease, setRequestingLease] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [reservationPin, setReservationPin] = useState("");
  const isLoggedIn = Boolean(user || Cookies.get("token"));
  const loginHref = property ? `/login?next=${encodeURIComponent(`/properties/${property.id}`)}` : "/login";

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof err.response === "object" &&
      err.response !== null &&
      "data" in err.response &&
      typeof err.response.data === "object" &&
      err.response.data !== null &&
      "message" in err.response.data &&
      typeof err.response.data.message === "string"
    ) {
      return err.response.data.message;
    }

    return err instanceof Error ? err.message : fallback;
  };

  const handlePayment = async () => {
    if (!property) return;
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    setPaying(true);
    try {
      await api.post(`/wallet/pay-holding-fee/${property.id}`, { pin: reservationPin });
      toast.success("Property reserved pending review.");
      setShowPinPrompt(false);
      setReservationPin("");
      
      // Refresh property status
      const data = await api.get<Property>(ENDPOINTS.PROPERTIES.GET_ONE(id));
      setProperty(data);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Reservation failed. Please fund your wallet."));
    } finally {
      setPaying(false);
    }
  };

  const handleLeaseRequest = async () => {
    if (!property) return;
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }

    setRequestingLease(true);
    try {
      await api.post(`/tenant/lease-requests/${property.id}`, {
        message: `I would like to request lease terms for ${property.title}.`,
      });
      setLeaseRequests((current) => [
        ...current.filter((request) => request.property_id !== property.id),
        { id: `local-${property.id}`, property_id: property.id, status: "PENDING" },
      ]);
      toast.success("Lease request submitted. The owner or agent will review it.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Unable to submit lease request"));
    } finally {
      setRequestingLease(false);
    }
  };

  const handleReservationIntent = () => {
    if (!property) return;
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    setShowPinPrompt(true);
  };

  const handleMessageIntent = (userId?: string) => {
    if (!userId) return;
    if (!isLoggedIn) {
      router.push(loginHref);
      return;
    }
    router.push(`/messages?userId=${userId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Building2 size={64} className="text-white/10" />
        <h2 className="text-xl font-bold">Property not found</h2>
        <Link href="/properties" className="text-primary hover:underline">Back to listings</Link>
      </div>
    );
  }

  const primaryImage = property.images && property.images.length > 0 ? property.images[0].image_url : null;
  const secondaryImage = property.images && property.images.length > 1 ? property.images[1].image_url : null;
  const existingLeaseRequest = leaseRequests.find((request) => (
    request.property_id === property.id &&
    ["PENDING", "APPROVED"].includes(request.status)
  ));
  const pendingLeaseRequest = existingLeaseRequest?.status === "PENDING" ? existingLeaseRequest : null;
  const approvedLeaseRequest = existingLeaseRequest?.status === "APPROVED" ? existingLeaseRequest : null;
  const pendingRentInvoice = invoices.find((invoice) => (
    invoice.property_id === property.id &&
    invoice.type === "RENT" &&
    ["PENDING", "OVERDUE"].includes(invoice.status)
  ));

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 animate-in fade-in duration-700">
      {showPinPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPinPrompt(false)} />
          <div className="relative bg-black border border-white/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold font-heading mb-3">Confirm Reservation</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">Enter your wallet PIN to authorize the reservation deposit.</p>
            {!wallet?.pin_set_at ? (
              <div className="space-y-4">
                <div className="p-5 bg-primary/10 border border-primary/20 rounded-2xl">
                  <p className="text-sm font-bold text-primary mb-2">Wallet PIN required</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Create your 4-digit wallet PIN before reserving a property.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPinPrompt(false)}
                    className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <Link
                    href="/tenant/settings#wallet-pin"
                    className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all text-center"
                  >
                    Set PIN
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
              <input
                autoFocus
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={reservationPin}
                onChange={(event) => setReservationPin(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="4-digit PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:border-primary/50 transition-all outline-none text-lg font-bold"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPinPrompt(false);
                    setReservationPin("");
                  }}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={reservationPin.length !== 4 || paying}
                  onClick={handlePayment}
                  className="flex-1 bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {paying ? <Loader2 className="animate-spin" size={18} /> : "Pay"}
                </button>
              </div>
            </div>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="pt-24 px-8 md:px-16 max-w-7xl mx-auto flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/properties" className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors text-sm font-medium group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>
        <PublicPageActions />
      </div>

      {/* Hero / Images */}
      <section className="mt-8 px-8 md:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02]">
          {primaryImage ? (
            <Image src={primaryImage} alt={property.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-10"><Building2 size={120} /></div>
          )}
        </div>
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02]">
            {secondaryImage ? (
              <Image src={secondaryImage} alt={property.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-10"><Building2 size={60} /></div>
            )}
          </div>
          <div className="relative flex-1 bg-white/[0.03] rounded-3xl border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/[0.05] transition-colors">
            <p className="text-sm font-bold text-primary">+ {Math.max(0, property.images.length - 2)} more photos</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <main className="mt-12 px-8 md:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-12">
          {/* Title & Stats */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                   <h1 className="text-4xl md:text-5xl font-bold font-heading">{property.title}</h1>
                   <span className={cn(
                     "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                     property.status === "AVAILABLE" ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                   )}>
                     {property.status}
                   </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{property.address}, {property.city}, {property.state}</span>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500 uppercase tracking-widest mb-1 font-bold">
                  {property.listing_type === "SALE" ? "Total Price" : "Annual Rent"}
                </p>
                <p className="text-4xl font-bold font-heading text-primary">NGN {property.price.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-white/5">
              {[
                { icon: BedDouble, label: "Bedrooms", value: property.bedrooms || 0 },
                { icon: Bath, label: "Bathrooms", value: property.bathrooms || 0 },
                { icon: Square, label: "Square Ft", value: property.square_feet?.toLocaleString() || "0" },
                { icon: Calendar, label: "Year Built", value: property.year_built || "N/A" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-primary">
                    <stat.icon className="w-4 h-4" />
                    <span className="text-sm font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-heading">Description</h3>
            <p className="text-gray-400 leading-relaxed font-light text-lg whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="space-y-6 pt-6">
            <h3 className="text-2xl font-bold font-heading">Features & Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              {(property.amenities ? property.amenities.split(",") : ["Verified Listing", "Security", "Electricity"]).map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-primary/60" />
                  <span className="capitalize">{item.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Path to Ownership (Smart Saving) */}
          {property.listing_type === "SALE" && (
            <div className="pt-10">
              <PathToOwnership propertyId={property.id} />
            </div>
          )}
        </div>

        {/* Sidebar / Stakeholder Info */}
        <div className="lg:col-span-4">
            <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[2rem] shadow-2xl">
              {property.status === "AVAILABLE" && (
                <div className="mb-10 space-y-4">
                  <h3 className="text-xl font-bold font-heading">
                    {property.listing_type === "SALE"
                      ? "Reserve Property"
                      : approvedLeaseRequest
                        ? "Lease Approved"
                        : pendingLeaseRequest
                          ? "Lease Requested"
                          : "Request Lease"}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    {property.listing_type === "SALE" 
                      ? `Pay a reservation deposit of NGN ${property.minimum_holding_fee?.toLocaleString()} to hold this property while the owner or agent reviews the next steps.`
                       : approvedLeaseRequest
                         ? pendingRentInvoice
                           ? `Your request has been approved. Pay the rent invoice of NGN ${pendingRentInvoice.amount.toLocaleString()} to start the lease process.`
                           : "Your request has been approved. Check your payments page for the generated rent invoice."
                         : pendingLeaseRequest
                           ? "Your lease request is waiting for the owner or agent review. Payment becomes available after approval."
                           : "Request lease terms from the owner or agent before making any rent payment. Rent is paid after approval and lease confirmation."}
                  </p>
                  {property.listing_type === "RENT" && approvedLeaseRequest ? (
                    <button
                      type="button"
                      onClick={() => router.push("/tenant/payments")}
                      className="w-full bg-primary text-black font-black py-4 rounded-2xl hover:bg-primary-hover transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                    >
                      <CreditCard size={16} />
                      {pendingRentInvoice ? "Pay Rent Invoice" : "Open Payments"}
                    </button>
                  ) : (
                    <button 
                      onClick={property.listing_type === "SALE" ? handleReservationIntent : handleLeaseRequest}
                      disabled={paying || requestingLease || Boolean(pendingLeaseRequest)}
                      className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-primary transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      {paying || requestingLease ? <Loader2 className="animate-spin" size={16} /> : (property.listing_type === "SALE" ? "Pay Reservation Deposit" : pendingLeaseRequest ? "Requested" : "Request Lease")}
                    </button>
                  )}
                  <div className="h-[1px] bg-white/10 w-full" />
                </div>
              )}

              {property.listing_type === "SALE" && property.status !== "AVAILABLE" && (
                <div className="mb-10 space-y-4">
                  <h3 className="text-xl font-bold font-heading">Sale Progress</h3>
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    {property.status === "RESERVED"
                      ? "This property has a reservation deposit and is awaiting owner or agent review."
                      : property.status === "UNDER_REVIEW"
                        ? "The sale is under review. Final ownership is only confirmed after settlement and stakeholder approval."
                        : property.status === "SOLD"
                          ? "This property has been marked sold after final confirmation."
                          : "This sale process is no longer active."}
                  </p>
                  <div className="h-[1px] bg-white/10 w-full" />
                </div>
              )}

              <h3 className="text-xl font-bold font-heading mb-6">Inquiry</h3>
              
              {property.agent ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
                      {property.agent.profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{property.agent.profile.full_name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Assigned Property Agent</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => handleMessageIntent(property.agent?.id)}
                      className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Agent
                    </button>
                    {property.agent.profile.phone_number && (
                       <a 
                         href={`tel:${property.agent.profile.phone_number}`}
                         className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                       >
                         <Phone className="w-4 h-4" />
                         Call Agent
                       </a>
                    )}
                  </div>
                </div>
              ) : property.owner ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase">
                      {property.owner.profile.full_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold">{property.owner.profile.full_name}</h4>
                      <p className="text-xs text-gray-500 font-medium">Property Owner</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => handleMessageIntent(property.owner?.id)}
                      className="w-full bg-primary hover:bg-primary-hover text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat with Owner
                    </button>
                    {property.owner.profile.phone_number && (
                       <a 
                         href={`tel:${property.owner.profile.phone_number}`}
                         className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                       >
                         <Phone className="w-4 h-4" />
                         Call Owner
                       </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic text-center py-4">No contact info available.</p>
              )}

              <p className="mt-6 text-[10px] text-center text-gray-600 font-medium uppercase tracking-widest leading-relaxed">
                Our verification team ensures <br /> all listings are 100% authentic.
              </p>
            </div>
          </div>
      </main>
    </div>
  );
}



