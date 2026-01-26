'use client';

import { MapPin, Globe, Loader2, RefreshCw } from "lucide-react";
import { useLocationInfo } from "@/app/hooks/useLocationInfo";

interface LocationDisplayProps {
  showCoordinates?: boolean;
  showRefresh?: boolean;
  compact?: boolean;
}

export default function LocationDisplay({ 
  showCoordinates = false, 
  showRefresh = false,
  compact = false 
}: LocationDisplayProps) {
  const { locationInfo, loading, error, refetch } = useLocationInfo();

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs">
        {loading ? (
          <div className="flex items-center space-x-1 text-midnight-blue/40">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Mendeteksi...</span>
          </div>
        ) : error ? (
          <div className="flex items-center space-x-1 text-midnight-blue/40">
            <Globe className="w-3 h-3" />
            <span>Jakarta</span>
          </div>
        ) : locationInfo ? (
          <div className="flex items-center space-x-1 text-sage-green">
            <MapPin className="w-3 h-3" />
            <span>{locationInfo.city}</span>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="p-3 bg-sage-green/5 rounded-lg">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <MapPin className="w-4 h-4 text-sage-green" />
        <span className="text-sm font-medium text-sage-green">
          Lokasi Saat Ini
        </span>
        {showRefresh && (
          <button
            onClick={refetch}
            disabled={loading}
            className="ml-2 p-1 text-sage-green/70 hover:text-sage-green hover:bg-sage-green/10 rounded transition-colors"
            title="Refresh lokasi"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="w-4 h-4 text-midnight-blue/40 animate-spin" />
          <span className="text-sm text-midnight-blue/60">Mendeteksi lokasi...</span>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <Globe className="w-4 h-4 text-midnight-blue/40" />
            <span className="text-sm text-midnight-blue/60">Jakarta (Default)</span>
          </div>
          <p className="text-xs text-midnight-blue/40">
            Tidak dapat mendeteksi lokasi
          </p>
        </div>
      ) : locationInfo ? (
        <div className="text-center space-y-1">
          <div className="text-sm font-medium text-midnight-blue">
            {locationInfo.displayName}
          </div>
          {showCoordinates && (
            <div className="text-xs text-midnight-blue/60">
              {locationInfo.coordinates.latitude.toFixed(4)}, {locationInfo.coordinates.longitude.toFixed(4)}
            </div>
          )}
          {locationInfo.country !== 'Indonesia' && (
            <div className="text-xs text-midnight-blue/50">
              {locationInfo.country}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}