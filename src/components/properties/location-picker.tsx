"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2 } from "lucide-react";

// Fix for default marker icons in Leaflet + Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number, address?: string) => void;
}

// Sub-component to handle map jumps
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, [center, map]);
  return null;
}

export default function LocationPicker({ lat, lng, onChange }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [position, setPosition] = useState<[number, number]>([lat, lng]);

  // Reverse Geocode: Get address from Lat/Lng
  const fetchAddress = async (newLat: number, newLng: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`);
      const data = await res.json();
      if (data && data.display_name) {
        onChange(newLat, newLng, data.display_name);
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  // Forward Geocode: Get Lat/Lng from Address
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat: newLat, lon: newLon, display_name } = data[0];
        const nLat = parseFloat(newLat);
        const nLng = parseFloat(newLon);
        setPosition([nLat, nLng]);
        onChange(nLat, nLng, display_name);
      }
    } catch (err) {
      console.error("Geocoding search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  function MapEvents() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        fetchAddress(lat, lng);
      },
    });
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Map Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location or street..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all text-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
        >
          {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Search"}
        </button>
      </form>

      <div className="h-[350px] w-full rounded-2xl overflow-hidden border border-white/10 relative z-0">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ChangeView center={position} />
          <MapEvents />
          <Marker position={position} icon={icon} />
        </MapContainer>
      </div>
    </div>
  );
}
