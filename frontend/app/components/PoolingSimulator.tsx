"use client";
import { useState, useMemo } from 'react';

// Re-define the Ship interface for this component
interface Ship {
  ship_id: string;
  ship_type: string;
  Compliance_Status: string;
  Compliance_Balance: number;
}

// Define Props: This component expects a list of Ships named 'fleet'
interface PoolingProps {
  fleet: Ship[];
  isLoading?: boolean;
  darkMode?: boolean;
}

export default function PoolingSimulator({ fleet, isLoading = false, darkMode = false }: PoolingProps) {
  // These states can be a Ship object OR null (if nothing is selected)
  const [shipA, setShipA] = useState<Ship | null>(null);
  const [shipB, setShipB] = useState<Ship | null>(null);

  // Memoized filtered lists for performance
  const deficitShips = useMemo(() => 
    fleet.filter(s => s.Compliance_Status === 'Deficit'), [fleet]
  );
  const surplusShips = useMemo(() => 
    fleet.filter(s => s.Compliance_Status === 'Surplus'), [fleet]
  );

  const calculatePool = () => {
    if (!shipA || !shipB) return "0.00";
    // The math is simple addition: (-2.5) + (+3.0) = +0.5
    return (shipA.Compliance_Balance + shipB.Compliance_Balance).toFixed(2);
  };

  const poolTotal = parseFloat(calculatePool());

  const handleReset = () => {
    setShipA(null);
    setShipB(null);
    // Reset the select elements to default
    const deficitSelect = document.getElementById('deficit-select') as HTMLSelectElement;
    const surplusSelect = document.getElementById('surplus-select') as HTMLSelectElement;
    if (deficitSelect) deficitSelect.value = '';
    if (surplusSelect) surplusSelect.value = '';
  };

  return (
    <div className={`p-8 rounded-2xl shadow-xl border mt-8 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>Pooling Arbitrage Simulator</h2>
        {(shipA || shipB) && (
          <button
            onClick={handleReset}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-slate-300 bg-slate-700 hover:bg-slate-600' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        )}
      </div>
      <p className={`mb-8 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Pair a high-intensity vessel (Deficit) with a low-intensity vessel (Surplus) to check combined FuelEU compliance.
      </p>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Dropdown 1: Deficit Vessel */}
        <div className="flex-1">
            <label 
              id="deficit-label" 
              htmlFor="deficit-select" 
              className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-red-400' : 'text-red-600'}`}
            >
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              Select Deficit Vessel
            </label>
            <select 
              id="deficit-select"
              aria-labelledby="deficit-label"
              aria-describedby="deficit-help"
              disabled={isLoading || deficitShips.length === 0}
              onChange={(e) => setShipA(fleet.find(s => s.ship_id === e.target.value) || null)} 
              className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-medium ${darkMode ? 'border-red-800 bg-red-900/30 focus:ring-red-900 focus:border-red-500 text-slate-200' : 'border-red-200 bg-red-50/50 focus:ring-red-100 focus:border-red-400 text-slate-700'}`}
            >
              <option value="">{isLoading ? 'Loading...' : deficitShips.length === 0 ? 'No deficit vessels' : '-- Select Vessel --'}</option>
              {deficitShips.map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {/* OLD UNIT: gCO2/MJ (Commented Out) */}
                    {/* {s.ship_id} ({Number(s.Compliance_Balance).toFixed(2)} gCO2/MJ) */}
                    
                    {/* NEW UNIT: kg/nm */}
                    {s.ship_id} ({Number(s.Compliance_Balance).toFixed(2)} kg/nm)
                </option>
              ))}
            </select>
            <p id="deficit-help" className="sr-only">Select a vessel with negative compliance balance</p>
        </div>

        {/* Plus Icon */}
        <div className="hidden md:flex items-center justify-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${darkMode ? 'bg-slate-700 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>

        {/* Dropdown 2: Surplus Vessel */}
        <div className="flex-1">
            <label 
              id="surplus-label" 
              htmlFor="surplus-select" 
              className={`flex items-center gap-2 text-sm font-bold mb-3 uppercase ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
            >
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              Select Surplus Vessel
            </label>
            <select 
              id="surplus-select"
              aria-labelledby="surplus-label"
              aria-describedby="surplus-help"
              disabled={isLoading || surplusShips.length === 0}
              onChange={(e) => setShipB(fleet.find(s => s.ship_id === e.target.value) || null)}
              className={`w-full p-4 text-base border-2 rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-medium ${darkMode ? 'border-emerald-800 bg-emerald-900/30 focus:ring-emerald-900 focus:border-emerald-500 text-slate-200' : 'border-emerald-200 bg-emerald-50/50 focus:ring-emerald-100 focus:border-emerald-400 text-slate-700'}`}
            >
              <option value="">{isLoading ? 'Loading...' : surplusShips.length === 0 ? 'No surplus vessels' : '-- Select Vessel --'}</option>
              {surplusShips.map(s => (
                <option key={s.ship_id} value={s.ship_id}>
                    {/* OLD UNIT: gCO2/MJ (Commented Out) */}
                    {/* {s.ship_id} (+{Number(s.Compliance_Balance).toFixed(2)} gCO2/MJ) */}

                    {/* NEW UNIT: kg/nm */}
                    {s.ship_id} (+{Number(s.Compliance_Balance).toFixed(2)} kg/nm)
                </option>
              ))}
            </select>
            <p id="surplus-help" className="sr-only">Select a vessel with positive compliance balance</p>
        </div>
      </div>

      {/* Result Display */}
      {shipA && shipB && (
          <div 
            role="alert"
            aria-live="polite"
            className={`p-6 rounded-xl text-center border-2 transition-all duration-500 ${
              poolTotal >= 0 ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'
            }`}
          >
            <h3 className={`text-3xl font-bold ${poolTotal >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                {/* OLD UNIT: gCO2/MJ (Commented Out) */}
                {/* Net Balance: {poolTotal} gCO2/MJ */}

                {/* NEW UNIT: kg/nm */}
                Net Balance: {poolTotal} kg/nm
            </h3>
            <p className="font-semibold mt-2 text-slate-700">
                {poolTotal >= 0 
                    ? "POOL COMPLIANT: No penalties required." 
                    : "POOL NON-COMPLIANT: Additional credits needed."}
            </p>
            {/* Detailed breakdown for transparency */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-center gap-8 text-sm">
              <div>
                <span className="text-slate-500">Deficit Ship:</span>
                <span className="ml-2 font-mono text-red-600">{shipA.Compliance_Balance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500">Surplus Ship:</span>
                <span className="ml-2 font-mono text-green-600">+{shipB.Compliance_Balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
      )}
    </div>
  );
}