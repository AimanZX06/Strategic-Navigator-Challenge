"use client";
import { useEffect, useState, useMemo } from 'react';
import PoolingSimulator from './components/PoolingSimulator';
import VoyagePlanner from './components/VoyagePlanner';
import FleetAnalytics from './components/FleetAnalytics';

// 1. Define the Shape of a Ship
// This tells what data to expect from the API
export interface Ship {
  ship_id: string;
  ship_type: string;
  route_id: string;
  Compliance_Status: string;
  Compliance_Balance: number;
}

export default function Home() {
  // 2. Tell 'fleet' is a list of 'Ship' objects
  const [fleet, setFleet] = useState<Ship[]>([]);
  const [filter, setFilter] = useState("All"); // "All", "Deficit", "Surplus"
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data from FastAPI backend
    setIsLoading(true);
    setError(null);
    fetch('http://127.0.0.1:8000/api/fleet')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFleet(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(err.message || "Failed to load fleet data");
        setIsLoading(false);
      });
  }, []);

  // Memoized filtered fleet for performance
  const filteredFleet = useMemo(() => {
    return fleet.filter(ship => filter === "All" || ship.Compliance_Status === filter);
  }, [fleet, filter]);


  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Hero Header */}
      <header className="gradient-header text-white px-8 py-6 mb-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            
            <div>
              <h1 className="text-2xl font-bold tracking-tight">MIND X Strategic Navigator</h1>
              <p className="text-blue-200 text-sm">Fleet Compliance & Arbitrage Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-8 pb-8 max-w-7xl mx-auto">
      {/* Fleet Chart Component */}
      <FleetAnalytics fleet={fleet} />

      {/* Header with Count */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fleet Liability Map</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor vessel compliance status and penalty risks</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1">
            {["All", "Deficit", "Surplus"].map((status) => {
              const isActive = filter === status;
              const colorClass = status === "Deficit" 
                ? (isActive ? "bg-red-500 text-white shadow-red-200" : "text-red-600 hover:bg-red-50")
                : status === "Surplus"
                ? (isActive ? "bg-emerald-500 text-white shadow-emerald-200" : "text-emerald-600 hover:bg-emerald-50")
                : (isActive ? "bg-slate-800 text-white shadow-slate-200" : "text-slate-600 hover:bg-slate-100");
              
              return (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${colorClass} ${isActive ? 'shadow-lg' : ''}`}
                >
                  {status}
                  {status !== "All" && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {fleet.filter(s => s.Compliance_Status === status).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <span className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold shadow-sm">
            <span className="font-bold">{fleet.length}</span> vessels
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-slate-200 mb-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Loading fleet data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center h-64 bg-red-50 rounded-xl border border-red-200 mb-8">
          <div className="flex flex-col items-center gap-3 text-center px-4">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-600 font-semibold">Failed to load fleet data</p>
            <p className="text-red-500 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Fleet Grid - Only show when loaded */}
      {!isLoading && !error && (
      <div className="max-h-[600px] overflow-y-auto pr-2 border border-slate-200 rounded-2xl bg-white/50 p-5 shadow-inner mb-8" role="list" aria-label="Fleet vessels list">

        {filteredFleet.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <p>No vessels found matching the filter.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFleet.map((ship, index) => (
              <div key={index} className={`card-hover p-5 rounded-xl shadow-md border-l-4 bg-white ${ship.Compliance_Status === 'Deficit'
                  ? 'border-l-red-500'
                  : 'border-l-emerald-500'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      
                      {ship.ship_id}
                    </h3>
                    <p className="text-xs text-slate-400 uppercase font-medium tracking-wide mt-1">{ship.ship_type}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${ship.Compliance_Status === 'Deficit' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}>
                    {ship.Compliance_Status}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/50 flex justify-between items-end">
                  <span className="text-xs text-slate-400">Net Balance</span>
                  <span className={`text-lg font-mono font-bold ${ship.Compliance_Status === 'Deficit' ? 'text-red-600' : 'text-green-600'
                    }`}>
                    {Number(ship.Compliance_Balance) > 0 ? "+" : ""}
                    {Number(ship.Compliance_Balance).toFixed(2)}
                    <span className="ml-1 text-[10px] text-slate-400 font-bold tracking-wide">
                      kg/NM
                    </span>
                  </span>

                </div>
              </div>
            ))}
        </div>
        )}
      </div>
      )}

      {/* Pooling Simulator Component */}
      <PoolingSimulator fleet={fleet} isLoading={isLoading} />

      {/* Voyage Planner*/}
      <VoyagePlanner />
      </div>
    </main>
  );
}