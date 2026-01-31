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
    <main className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 text-center">MindX Strategic Navigator</h1>

      {/* Fleet Chart Component */}
      <FleetAnalytics fleet={fleet} />

      {/* Header with Count */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-slate-700">Fleet Liability Map</h2>

        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex gap-1">
            {["All", "Deficit", "Surplus"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${filter === status
                    ? "bg-slate-800 text-white shadow"
                    : "text-slate-500 hover:bg-slate-100"
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          <span className="text-sm bg-slate-200 text-slate-600 px-3 py-1 rounded-full">
            Total: {fleet.length} vessels
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
      <div className="max-h-[600px] overflow-y-auto pr-2 border border-slate-200 rounded-xl bg-white p-4 shadow-inner mb-8" role="list" aria-label="Fleet vessels list">

        {filteredFleet.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-slate-400">
            <p>No vessels found matching the filter.</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFleet.map((ship, index) => (
              <div key={index} className={`p-4 rounded-lg shadow-sm border border-l-4 transition-transform hover:scale-[1.02] ${ship.Compliance_Status === 'Deficit'
                  ? 'bg-red-50 border-red-500 border-t-slate-100 border-r-slate-100 border-b-slate-100'
                  : 'bg-green-50 border-green-500 border-t-slate-100 border-r-slate-100 border-b-slate-100'
                }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{ship.ship_id}</h3>
                    <p className="text-xs text-slate-500 uppercase font-semibold">{ship.ship_type}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${ship.Compliance_Status === 'Deficit' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
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

    </main>
  );
}